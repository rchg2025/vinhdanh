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
      className="w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={`Giấy khen ${honoree.user.name}`}
          loading="lazy"
          decoding="async"
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {honorees.map((h) => (
        <HonoreeCard key={h.id} honoree={h} />
      ))}
    </div>
  );
}
