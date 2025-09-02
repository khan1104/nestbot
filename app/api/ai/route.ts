import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface AIRequestBody {
    messages: Message[];
}

interface AIResponse {
    role: "assistant";
    content: string;
}

export async function POST(req: Request) {
    try {
        const body: AIRequestBody = await req.json();

        if (!body.messages || !Array.isArray(body.messages)) {
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        const prompt = body.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const aiMessage: AIResponse = {
            role: "assistant",
            content: response.text || "No response",
        };

        return NextResponse.json(aiMessage);
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            role: "assistant",
            content: "Error generating response.",
        });
    }
}
