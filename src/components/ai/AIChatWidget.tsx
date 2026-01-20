"use client";

import React, { useState, useRef, useEffect } from "react";
import { aiService, AIComicResult } from "@/services/ai.service";
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { FaRobot } from "react-icons/fa6";

// Kiểu tin nhắn trong giao diện
interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  recommendations?: AIComicResult[]; // Bot có thể kèm danh sách truyện
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Tin nhắn mặc định chào mừng
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: "Xin chào! Tôi là trợ lý AI của Comax. Bạn muốn tìm truyện thể loại gì hôm nay? (Ví dụ: Main bá đạo, truyện buồn, xuyên không...)",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input;
    setInput("");

    // 1. Hiển thị tin nhắn User ngay lập tức
    const userMsg: Message = { id: Date.now(), role: "user", text: userMsgText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Gọi API AI
      const data = await aiService.chat(userMsgText);

      // 3. Hiển thị phản hồi từ Bot
      const botMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: data.answer,
        recommendations: data.relatedComics,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      // Xử lý lỗi
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: "Xin lỗi, hệ thống AI đang quá tải hoặc gặp sự cố. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* --- CỬA SỔ CHAT --- */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <FaRobot className="w-5 h-5 text-yellow-300" />
              <h3 className="font-bold">Comax AI Assistant</h3>
            </div>
            <button aria-label="Mở" onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Nội dung Chat (Scroll) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Bong bóng chat */}
                <div
                  className={`max-w-[85%] p-3 text-sm rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>

                {/* Nếu Bot có gợi ý truyện -> Hiển thị thẻ nhỏ bên dưới */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-2 w-[85%] space-y-2">
                    <p className="text-xs text-gray-500 font-semibold ml-1">Đề xuất cho bạn:</p>
                    {msg.recommendations.map((comic) => (
                      <Link 
                        key={comic.id} 
                        href={`/truyen/${comic.slug}`}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                      >
                         <div className="relative w-10 h-14 flex-shrink-0 overflow-hidden rounded">
                            {/* Dùng thẻ img thường hoặc Next/Image */}
                            <img src={comic.cover} alt={comic.title} className="object-cover w-full h-full" />
                         </div>
                         <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600">{comic.title}</h4>
                            <p className="text-[10px] text-green-600 mt-1">Độ phù hợp: {(comic.score * 100).toFixed(0)}%</p>
                         </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Hiệu ứng đang gõ... */}
            {isLoading && (
               <div className="flex items-start">
                  <div className="bg-gray-200 p-3 rounded-2xl rounded-bl-none flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
               </div>
            )}
            
            {/* Điểm neo để scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi gì đó đi..."
              disabled={isLoading}
              className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
            aria-label="Gửi tin nhắn"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
        </div>
      )}

      {/* --- NÚT TRÒN TOGGLE --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen ? "bg-gray-600 rotate-90" : "bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-slow"
        }`}
      >
        {isOpen ? (
          <XMarkIcon className="w-8 h-8 text-white" />
        ) : (
          <FaRobot className="w-8 h-8 text-white" />
        )}
      </button>
    </div>
  );
}