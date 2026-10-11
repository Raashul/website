import "server-only";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export interface OpenrouterMessage {
  role: string;
  content: string;
}

export interface Annotation {
  url: string;
  title?: string;
}

export async function openrouterJSON(opts: {
  messages: OpenrouterMessage[];
  online?: boolean;
  maxTokens?: number;
}): Promise<{ data: unknown; annotations: Annotation[] }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const baseModel = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  const model = opts.online ? `${baseModel}:online` : baseModel;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 500)}`);
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string; annotations?: unknown } }[];
    usage?: { cost?: number };
  };
  const message = payload.choices?.[0]?.message;
  const content = message?.content ?? "";

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error(`OpenRouter returned non-JSON content: ${content.slice(0, 300)}`);
  }

  const annotations: Annotation[] = Array.isArray(message?.annotations)
    ? (message.annotations as unknown[])
        .map((raw): Annotation | null => {
          const a = raw as { type?: string; url_citation?: { url?: string; title?: string } };
          if (a.type !== "url_citation" || typeof a.url_citation?.url !== "string") return null;
          return { url: a.url_citation.url, title: a.url_citation.title };
        })
        .filter((a): a is Annotation => a !== null)
    : [];

  if (typeof payload.usage?.cost === "number") {
    console.info(`[openrouter] model=${model} cost=$${payload.usage.cost}`);
  }

  return { data, annotations };
}
