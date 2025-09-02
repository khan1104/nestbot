"use client";

import Image from "next/image";
import { Chat } from "@/components/Chat";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Menu } from "lucide-react";

type ChatType = { id: number; title: string };

export default function Home() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadChats = async () => {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data);
    };
    loadChats();
  }, []);

  const handleNewChat = async () => {
    const res = await fetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({ title: "New Chat" }),
    });
    const newChat = await res.json();
    setChats([newChat, ...chats]);
    setActiveChat(newChat.id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (id: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChat === id) setActiveChat(null);

    await fetch(`/api/chats?id=${id}`, {
      method: "DELETE",
    });
  };

  const updateChatTitle = async (id: number, newTitle: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
    );

    await fetch("/api/chats", {
      method: "PUT",
      body: JSON.stringify({ id, title: newTitle }),
    });
  };

  return (
    <main className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar toggle button */}
      <Button
        className="md:hidden fixed top-4 left-4 z-20"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative top-0 left-0 z-10 h-full w-64 bg-white border-r flex-col p-4 shadow-md
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300
          md:translate-x-0 flex
        `}
      >
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="NestBot Logo" width={40} height={40} className="mb-2" />
          <div className="text-xl font-bold">NestBot</div>
        </div>

        <Button className="w-full mb-4" onClick={handleNewChat}>
          + New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.length === 0 ? (
            <p className="text-gray-500 text-center">No chat history</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between p-2 rounded-md ${activeChat === chat.id
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <span
                  onClick={() => {
                    setActiveChat(chat.id);
                    setSidebarOpen(false); // Close sidebar on mobile
                  }}
                  className="flex-1 truncate cursor-pointer"
                >
                  {chat.title}
                </span>

                <div className="relative group">
                  <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer" />
                  <div className="hidden group-hover:block absolute right-0 mt-1 w-24 bg-white shadow-lg rounded-md border z-10">
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat Section */}
      <section className="flex-1 flex">
        {activeChat ? (
          <Chat
            key={activeChat}
            conversationId={activeChat}
            onFirstMessage={(msg: string) => updateChatTitle(activeChat, msg)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            Click on new chat
          </div>
        )}
      </section>
    </main>
  );
}
