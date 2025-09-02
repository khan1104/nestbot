"use client";

import { cn } from "@/lib/utils";

type Props = {
    role: "user" | "assistant";
    content: string;
};

export function ChatMessage({ role, content }: Props) {
    return (
        <div
            className={cn(
                "px-4 py-2 rounded-2xl max-w-[80%] md:max-w-[70%] break-words shadow-sm",
                role === "user"
                    ? "bg-blue-600 text-white self-end"
                    : "bg-gray-200 text-gray-900 self-start"
            )}
        >
            {content}
        </div>
    );
}
