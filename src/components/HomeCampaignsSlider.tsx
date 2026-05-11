"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  startDate: string | Date;
  endDate: string | Date;
};

export default function HomeCampaignsSlider({ campaigns }: { campaigns: Campaign[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (campaigns.length <= 3) return; // Do not auto slide if there are 3 or fewer items
    
    const interval = setInterval(() => {
      if (containerRef.current) {
        const itemWidth = containerRef.current.children[0].clientWidth + 24; // width + gap(24px)
        
        // If reached the end, scroll back to the start
        if (containerRef.current.scrollLeft + containerRef.current.clientWidth >= containerRef.current.scrollWidth - 10) {
          containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          containerRef.current.scrollBy({ left: itemWidth, behavior: "smooth" });
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [campaigns.length]);

  const now = new Date();

  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="flex gap-6 overflow-x-auto py-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {campaigns.map((campaign) => {
          const isStarted = new Date(campaign.startDate) <= now;
          return (
            <div 
              key={campaign.id} 
              className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform w-[85vw] sm:w-[45vw] md:w-[calc(33.333%-16px)] shrink-0 snap-start h-auto min-h-[250px]"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{campaign.title}</h3>
                {campaign.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                )}
              </div>
              <div className="mt-4">
                <div className="flex flex-col gap-2 text-xs font-medium mb-4">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 flex items-center gap-1.5">
                    🗓 Mở: {new Date(campaign.startDate).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-md border border-rose-100 flex items-center gap-1.5">
                    ⏰ Đóng: {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                {isStarted ? (
                  <Link 
                    href={`/apply/${campaign.id}`}
                    className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
                  >
                    Nộp ngay 🚀
                  </Link>
                ) : (
                  <div className="w-full text-center px-4 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200 cursor-not-allowed">
                    Chưa mở cổng
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-8">
        <Link 
          href="/campaigns"
          className="px-6 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-all shadow-lg"
        >
          Xem tất cả đợt xét duyệt →
        </Link>
      </div>
    </div>
  );
}
