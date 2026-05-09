"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 w-full justify-start rounded-lg transition-all"
    >
      <LogOut size={16} /> Đăng xuất
    </Button>
  );
}

export function HeaderLogoutButton() {
  return (
    <Button 
      variant="ghost" 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center justify-center p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
      title="Đăng xuất"
    >
      <LogOut size={18} />
    </Button>
  );
}