"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface ChatWidgetProps {
  hideHeader?: boolean;
}

export default function ChatWidget({ hideHeader }: ChatWidgetProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const message = input.trim();
    if (!message || loading) return;

    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Không thể kết nối tới server, vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-black/10">
      {!hideHeader && (
        <div className="border-b border-black/10 p-3 font-semibold">Chợ Mù - Trợ lý du lịch</div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left text-sm ${
                m.role === "user" ? "bg-black text-white" : "bg-black/5"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div className="mt-1 text-xs text-black/40">
                Nguồn: {m.sources.map((s) => `${s}.md`).join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-sm text-black/40">Chợ Mù đang trả lời...</div>}
      </div>

      <div className="flex gap-2 border-t border-black/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
          placeholder="Hỏi về Mù Cang Chải..."
          className="flex-1 rounded border border-black/20 px-3 py-2 text-sm disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
