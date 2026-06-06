"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { getDisplayUrl } from "@/lib/utils";

type Program = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string | Date;
  endDate: string | Date;
  registrationStartDate: string | Date | null;
  registrationEndDate: string | Date | null;
};

export default function HomeProgramsSlider({ programs }: { programs: Program[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (programs.length <= 3) return; // Do not auto slide if there are 3 or fewer items
    
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
    }, 3500);
    
    return () => clearInterval(interval);
  }, [programs.length]);

  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="flex gap-6 overflow-x-auto py-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {programs.map((program) => {
          return (
            <div 
              key={program.id} 
              className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform w-[85vw] sm:w-[45vw] md:w-[calc(33.333%-16px)] shrink-0 snap-start h-auto min-h-[320px]"
            >
              <div>
                {program.imageUrl && (
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-4 border border-emerald-100/50 shadow-sm">
                    <img 
                      src={getDisplayUrl(program.imageUrl)} 
                      alt={program.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{program.title}</h3>
                {program.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{program.description}</p>
                )}
              </div>
              <div className="mt-4">
                <div className="flex flex-col gap-2 text-xs font-medium mb-4">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-100 flex items-center gap-1.5">
                    🗓 Diễn ra: {new Date(program.startDate).toLocaleDateString("vi-VN")} - {new Date(program.endDate).toLocaleDateString("vi-VN")}
                  </div>
                  {(program.registrationStartDate || program.registrationEndDate) && (
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 flex items-center gap-1.5">
                      Đăng ký: {program.registrationStartDate ? new Date(program.registrationStartDate).toLocaleDateString("vi-VN") : "Bây giờ"} - {program.registrationEndDate ? new Date(program.registrationEndDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                    </div>
                  )}
                </div>
                <Link 
                  href={`/activities`}
                  className="block w-full text-center px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
                >
                  Xem chi tiết 🔍
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-8">
        <Link 
          href="/activities"
          className="px-6 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-all shadow-lg"
        >
          Xem tất cả hoạt động →
        </Link>
      </div>
    </div>
  );
}
