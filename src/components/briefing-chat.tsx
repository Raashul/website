"use client";

import { useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function BriefingChat({ date, itemId }: { date: string; itemId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grounding, setGrounding] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;

    const history = messages;
    setInput("");
    setError(null);
    setBusy(true);
    setMessages([...history, { role: "user", content: question }, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/briefing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, itemId, question, history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setGrounding(res.headers.get("X-Grounded"));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "user", content: question }, { role: "assistant", content: answer }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
        setMessages(history);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm text-[var(--foreground-muted)] hover:text-[var(--color-accent)] transition-colors"
      >
        💬 {open ? "Close" : "Ask"}
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          {messages.length > 0 && (
            <div className="mb-3 space-y-3 text-sm leading-relaxed" aria-live="polite">
              {messages.map((m, i) => (
                <p
                  key={i}
                  className={`whitespace-pre-wrap ${
                    m.role === "user" ? "font-medium" : "text-[var(--foreground-muted)]"
                  }`}
                >
                  {m.content || (busy && i === messages.length - 1 ? "Thinking…" : "")}
                </p>
              ))}
              {grounding === "summary" && (
                <p className="text-xs text-[var(--foreground-muted)]">
                  The article couldn&apos;t be fetched; answers use the summary only.
                </p>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="mb-3 text-sm text-red-500">
              {error}
            </p>
          )}
          <form onSubmit={ask} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Ask a follow-up about this story…"
              aria-label="Ask a follow-up question"
              className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={busy || input.trim() === ""}
              className="rounded-md px-3 py-1.5 text-sm text-[var(--color-accent)] border border-[var(--border)] disabled:opacity-50"
            >
              {busy ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
