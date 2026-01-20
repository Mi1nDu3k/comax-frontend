"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { crawlerService } from "@/services/crawler.service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BoltIcon } from "@heroicons/react/24/outline";
import { useSignalR } from "@/hooks/useSignalR"; 

export default function CrawlerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const connection = useSignalR("/hubs/crawl");


  useEffect(() => {
    if (connection) {

      connection.on("ReceiveLog", (message: string) => {
        setLogs((prev) => [...prev, message]);
      });

 
      return () => {
        connection.off("ReceiveLog");
      };
    }
  }, [connection]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const formik = useFormik({
    initialValues: { url: "" },
    validationSchema: Yup.object({
      url: Yup.string().url("Link sai định dạng").required("Nhập link đi"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setLogs([]); 
      try {
        await crawlerService.crawlManual(values.url);
      } catch (error) {
        toast.error("Lỗi gửi lệnh crawl");
      } finally {
        setIsLoading(false);
        resetForm();
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Form nhập liệu (Giữ nguyên như cũ, chỉ rút gọn code demo) */}
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BoltIcon className="w-6 h-6 text-yellow-500"/> Crawler Console
            </h1>
            
            <form onSubmit={formik.handleSubmit} className="flex gap-2">
                 
                <input
                    name="url"
                    placeholder="Nhập link truyện..."
                    onChange={formik.handleChange}
                    value={formik.values.url}
                    className="flex-1 border rounded-md p-2"
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isLoading ? "Đang gửi..." : "Start Crawl"}
                </button>
            </form>
            {formik.errors.url && <p className="text-red-500 text-sm mt-1">{formik.errors.url}</p>}
        </div>

        {/* 4. Khu vực hiển thị Logs (Terminal Style) */}
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700">
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-400 font-mono ml-2">Live Logs output</span>
            </div>
            
            <div className="p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                    <div className="text-gray-500 italic text-center mt-20">
                        Chưa có dữ liệu. Hãy nhập link và bấm Start...
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="mb-1 break-words">
                            <span className="text-green-400 mr-2">➜</span>
                            {/* Tô màu cho các từ khóa đặc biệt */}
                            <span className={
                                log.includes("❌") || log.includes("☠️") ? "text-red-400" :
                                log.includes("🎉") || log.includes("✅") ? "text-green-300 font-bold" :
                                log.includes("⏳") ? "text-yellow-300" :
                                "text-gray-300"
                            }>
                                {log}
                            </span>
                        </div>
                    ))
                )}
                {/* Div rỗng để cuộn xuống */}
                <div ref={logEndRef} />
            
            </div>
            
        </div>

      </div>
    </div>
  );
}
