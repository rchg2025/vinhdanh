import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDisplayUrl = (url: string) => {
  if (!url) return "";
  
  const viewMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (viewMatch && viewMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${viewMatch[1]}&sz=w2000`;
  }
  
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1] && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w2000`;
  }
  
  return url;
};
