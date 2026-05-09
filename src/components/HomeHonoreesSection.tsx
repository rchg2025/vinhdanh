"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Honoree = {
  id: string;
  certificateUrl: string | null;
  portraitImage: string | null;
  user: { name: string | null; studentId: string | null };
  campaign: { title: string };
};

function getCertThumb(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (m?.[1]) return `/api/proxy-image?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`)}`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2?.[1]) return `/api/proxy-image?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${m2[1]}&sz=w400`)}`;
  return url;
}

function HonoreeCard({ honoree }: { honoree: Honoree }) {
  const thumb = getCertThumb(honoree.certificateUrl);

  return (
    <Link
      href={`/certificate/${honoree.id}`}
      className="flex-shrink-0 w-52 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={`Giấy khen ${honoree.user.name}`}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl">
          🏆
        </div>
      )}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm truncate">{honoree.user.name}</p>
        <p className="text-xs text-indigo-600 font-medium truncate mt-0.5">{honoree.campaign.title}</p>
      </div>
    </Link>
  );
}

export default function HomeHonoreesSection({ honorees }: { honorees: Honoree[] }) {
  // Split into 2 rows
  const row1 = honorees.filter((_, i) => i % 2 === 0);
  const row2 = honorees.filter((_, i) => i % 2 === 1);

  const sliderRef1 = useRef<HTMLDivElement>(null);
  const sliderRef2 = useRef<HTMLDivElement>(null);

  // Auto-scroll animation
  useEffect(() => {
    const animate = (el: HTMLDivElement | null, speed: number, reverse = false) => {
      if (!el) return;
      let pos = reverse ? -el.scrollWidth / 2 : 0;
      const step = () => {
        pos += reverse ? -speed : speed;
        if (!reverse && pos >= el.scrollWidth / 2) pos = 0;
        if (reverse && pos <= -el.scrollWidth / 2) pos = 0;
        el.style.transform = `translateX(${-pos}px)`;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // Only animate if rows have enough content
    if (row1.length >= 2) animate(sliderRef1.current, 0.4);
    if (row2.length >= 2) animate(sliderRef2.current, 0.3, true);
  }, [row1.length, row2.length]);

  return (
    <div className="space-y-4 overflow-hidden">
      {/* Row 1 */}
      <div className="overflow-hidden">
        <div ref={sliderRef1} className="flex gap-4 w-max">
          {[...row1, ...row1].map((h, i) => (
            <HonoreeCard key={`r1-${h.id}-${i}`} honoree={h} />
          ))}
        </div>
      </div>
      {/* Row 2 */}
      {row2.length > 0 && (
        <div className="overflow-hidden">
          <div ref={sliderRef2} className="flex gap-4 w-max">
            {[...row2, ...row2].map((h, i) => (
              <HonoreeCard key={`r2-${h.id}-${i}`} honoree={h} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
