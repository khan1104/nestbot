"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
    conversationId: number;
    onFirstMessage?: (title: string) => void;
};

export function Chat({ conversationId, onFirstMessage }: Props) {
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);
    const [input, setInput] = useState("");
    const [isAITyping, setIsAITyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMessages = async () => {
            const res = await fetch(`/api/messages?conversationId=${conversationId}`);
            const data = await res.json();
            setMessages(data || []);
        };
        loadMessages();
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, newMsg]);

        if (messages.length === 0 && onFirstMessage) {
            onFirstMessage(input.slice(0, 30));
        }

        setInput("");

        await fetch("/api/messages", {
            method: "POST",
            body: JSON.stringify({
                conversationId,
                role: newMsg.role,
                content: newMsg.content,
            }),
        });
        setIsAITyping(true);

        try {
            const allMessagesForAI = [...messages, newMsg];
            const aiResponse = await fetch("/api/ai", {
                method: "POST",
                body: JSON.stringify({ conversationId, messages: allMessagesForAI }),
            });
            const aiData = await aiResponse.json();

            setMessages((prev) => [...prev, aiData]);

            await fetch("/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    conversationId,
                    role: aiData.role,
                    content: aiData.content,
                }),
            });
        } catch (error) {
            console.error("AI response error:", error);
        } finally {
            setIsAITyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-2 md:p-4">
                {messages.map((msg, i) => (
                    <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}

                {isAITyping && (
                    <div className="px-4 py-2 rounded-2xl max-w-[70%] bg-gray-200 text-gray-900 self-start shadow-sm animate-pulse">
                        AI is typing...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 p-2 md:p-4 border-t bg-white">
                <Input
                    className="flex-1 h-12 md:h-14 rounded-2xl text-base md:text-lg px-4"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <Button className="h-12 md:h-14 px-4 md:px-6 rounded-2xl text-base md:text-lg" type="submit">
                    Send
                </Button>
            </form>
        </div>
    );
}
