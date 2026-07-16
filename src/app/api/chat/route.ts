import { NextRequest, NextResponse } from "next/server";
import { getRelevantKnowledge } from "@/lib/knowledge";
import { getOpenAIClient } from "@/lib/openai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(knowledge: { slug: string; content: string }[]): string {
  const context = knowledge
    .map((k) => `### Nguồn: ${k.slug}\n${k.content}`)
    .join("\n\n");

  return [
    'Bạn là "Chợ Sapa" - trợ lý du lịch địa phương thân thiện, am hiểu về Sa Pa, Lào Cai.',
    "Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, đúng trọng tâm câu hỏi.",
    "Chỉ sử dụng thông tin trong phần NGỮ CẢNH dưới đây để trả lời. Không bịa thêm số liệu, giá cả, số điện thoại hoặc thông tin không có trong ngữ cảnh.",
    "Nếu ngữ cảnh không đủ để trả lời chính xác, hãy nói rõ là không chắc và gợi ý khách xác minh thêm, thay vì đoán bừa.",
    "",
    "NGỮ CẢNH:",
    context,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const message = body?.message;
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

  if (typeof message !== "string" || message.trim() === "") {
    return NextResponse.json(
      { reply: "Vui lòng nhập câu hỏi.", sources: [] },
      { status: 400 }
    );
  }

  const relevant = getRelevantKnowledge(message);
  const systemPrompt = buildSystemPrompt(relevant);

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({
      reply,
      sources: relevant.map((r) => r.slug),
    });
  } catch (error) {
    console.error("Lỗi gọi OpenAI API:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        reply:
          "Xin lỗi, Chợ Sapa đang gặp sự cố kết nối tới trợ lý AI. Bạn vui lòng thử lại sau ít phút nhé.",
        sources: [],
      },
      { status: 502 }
    );
  }
}
