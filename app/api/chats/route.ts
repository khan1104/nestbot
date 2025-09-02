import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
        const chat = await prisma.conversation.findUnique({
            where: { id: parseInt(id) },
            include: { messages: { orderBy: { createdAt: "asc" } } },
        });
        return NextResponse.json(chat);
    } else {
        const chats = await prisma.conversation.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(chats);
    }
}

export async function POST(req: Request) {
    const { title } = await req.json();
    const chat = await prisma.conversation.create({
        data: { title },
    });
    return NextResponse.json(chat);
}

export async function PUT(req: Request) {
    const { id, title } = await req.json();
    const updatedChat = await prisma.conversation.update({
        where: { id },
        data: { title },
    });
    return NextResponse.json(updatedChat);
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    try {
        await prisma.message.deleteMany({ where: { conversationId: Number(id) } });

        const deleted = await prisma.conversation.delete({ where: { id: Number(id) } });

        return NextResponse.json(deleted);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
