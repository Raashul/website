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
  /** With `online`, restrict web results to these domains (web plugin). */
  includeDomains?: string[];
  maxTokens?: number;
}): Promise<{ data: unknown; annotations: Annotation[] }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const baseModel = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  // The `:online` suffix can't carry options, so domain filtering uses the plugin form.
  const useSuffix = opts.online && !opts.includeDomains;
  const model = useSuffix ? `${baseModel}:online` : baseModel;
  const plugins =
    opts.online && opts.includeDomains
      ? [{ id: "web", max_results: 8, include_domains: opts.includeDomains }]
      : undefined;

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
      ...(plugins && { plugins }),
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

// Streams plain-text deltas from a chat completion. Throws before the first
// byte on HTTP errors so callers can still return a proper error status.
export async function openrouterStream(opts: {
  messages: OpenrouterMessage[];
  maxTokens?: number;
  signal?: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 600,
      stream: true,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 500)}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const upstream = res.body.getReader();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await upstream.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let emitted = false;
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]" || data === "") continue;
          try {
            const chunk = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
              usage?: { cost?: number };
            };
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
              emitted = true;
            }
            if (typeof chunk.usage?.cost === "number") {
              console.info(`[openrouter] chat model=${model} cost=$${chunk.usage.cost}`);
            }
          } catch {
            // Ignore keep-alive comments and partial frames.
          }
        }
        if (emitted) return;
      }
    },
    cancel() {
      return upstream.cancel();
    },
  });
}
