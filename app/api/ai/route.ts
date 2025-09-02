import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY, 
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    try {
        const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const aiContent = response.text || "No response";

        return NextResponse.json({ role: "assistant", content: aiContent });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            role: "assistant",
            content: "Error generating response.",
        });
    }
}
