import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
        return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
        where: { conversationId: parseInt(conversationId) },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
}

export async function POST(req: Request) {
    const { conversationId, role, content } = await req.json();

    if (!conversationId || !role || !content) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            role,
            content,
        },
    });

    return NextResponse.json(message);
}
