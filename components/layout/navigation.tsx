"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { WebApp } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

interface MyContextType {
  user: WebApp | null | undefined;
  setUser: (value: WebApp) => void;
}

// Create the context with a default value
const UserContext = createContext<MyContextType | null>(null);

export const useTgContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useTgContext must be used within a MyProvider");
  }
  return context;
};

const NavigationLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<WebApp | null>();

  const tabs: {
    id: string;
    label: string;
    path: string;
    // Icon: React.FC<{ className?: string }>;
  }[] = [
    { id: "home", label: "Home", path: "/" },
    { id: "leaderboard", label: "Tiktok", path: "/" },
    { id: "challenge", label: "Challenge", path: "/" },
    { id: "task", label: "Task", path: "/" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window?.Telegram?.WebApp;
      tg.ready();
      setUser(tg);
      tg.BackButton.show();
      tg.BackButton.onClick(() => router.back()); // Use Next.js router for navigation
    } else {
      setError("This app should be opened in Telegram");
    }
  }, [router]);

  // Helper function to determine if the path is active
  const isActiveTab = (tabPath: string) => {
    return pathname === tabPath || pathname.startsWith(`${tabPath}/`);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className={`flex flex-col h-screen pb-8  max-w-[1500px] mx-auto`}>
        <div className="flex-grow overflow-y-auto py-1 px-2 bg-card text-card-foreground mt-2">
          {children}
        </div>
        <div
          className={` bg-secondary text-secondary-foreground/50 border-card w-full p-1 pt-3 rounded-t-full`}
        >
          <div className="flex justify-around ">
            {tabs.map((tab) => {
              const isActive = isActiveTab(tab.path); // Use the helper to check active state
              return (
                <Link key={tab.id} href={tab.path} className={``}>
                  <span
                    className={`w-8 h-8 ${
                      isActive
                        ? "text-secondary-foreground"
                        : "text-secondary-foreground/30 "
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
    </UserContext.Provider>
  );
};

export default NavigationLayout;
