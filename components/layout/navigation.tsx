"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, FC, SVGProps, useMemo } from "react";
import { WebApp } from "@twa-dev/types";

// Icon imports
import {
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Telegram WebApp type declaration
declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

// Context type definition
interface AppContextType {
  user: WebApp | null | undefined;
  setUser: (value: WebApp | null | undefined) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface NavigationLayoutProps {
  children: React.ReactNode;
}

type IconComponentType = FC<SVGProps<SVGSVGElement> & { className?: string }>;

const NavigationLayout: FC<NavigationLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<WebApp | null | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Navigation tabs with icons
  const tabs = useMemo(() => [
    { id: 1, label: "Home", path: "/", Icon: HomeIcon },
    { id: 2, label: "Leaderboard", path: "/leaderboard", Icon: ChartBarIcon },
    { id: 3, label: "Challenges", path: "/challenges", Icon: BoltIcon },
    { id: 4, label: "Progress", path: "/my-progress", Icon: CheckCircleIcon },
  ], []);

  useEffect(() => {
    // Initialize Telegram WebApp if available
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      setUser(tg);

      tg.BackButton.show();
      const handleBackButtonClick = () => router.back();
      tg.BackButton.onClick(handleBackButtonClick);
      tg.expand();

      return () => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        }
      };
    } else {
      console.warn("Telegram WebApp not found. Running in browser mode or environment issue.");
    }
  }, [router]);

  // Check if tab is active
  const isActiveTab = (tabPath: string) => {
    if (tabPath === "/") return pathname === tabPath;
    return pathname.startsWith(tabPath);
  };

  // Support dark mode
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }, []);

  // Close menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Add font styles to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
      :root {
        --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
        --font-heading: 'Outfit', system-ui, -apple-system, sans-serif;
      }
      body {
        font-family: var(--font-sans);
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      <div className="flex flex-col h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 max-w-md mx-auto relative overflow-hidden font-sans">
        {/* Main content area */}
        <main className="flex-grow  px-4 pt-4 pb-20 scroll-smooth">
          {children}
        </main>

        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg rounded-t-2xl z-10 transition-all duration-300 ease-in-out">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => {
              const isActive = isActiveTab(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`relative flex flex-col items-center justify-center p-2 w-full rounded-lg transition-all duration-300 ease-out group overflow-hidden
                    ${isActive 
                      ? "text-teal-500 dark:text-teal-400" 
                      : "text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300"}`}
                  aria-label={tab.label}
                >
                  {/* Background glow effect for active tab */}
                  {isActive && (
                    <span className="absolute inset-0 bg-teal-50 dark:bg-teal-900/20 rounded-lg -z-10 animate-fade-in"></span>
                  )}
                  
                  {/* Icon with animations */}
                  <tab.Icon
                    className={`w-6 h-6 mb-0.5 transition-transform duration-300 ease-bounce 
                      ${isActive ? "animate-tab-bounce text-teal-500 dark:text-teal-400" : "group-hover:scale-110"}`}
                  />
                  
                  {/* Tab label */}
                  <span className="text-xs font-medium mt-0.5 transition-opacity">
                    {tab.label}
                  </span>
                  
                  {/* Active indicator line */}
                  <span 
                    className={`absolute bottom-0 h-0.5 bg-teal-500 dark:bg-teal-400 rounded-full transition-all duration-300 ease-out
                      ${isActive ? "w-10 opacity-100" : "w-0 opacity-0"}`}
                  ></span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Error message */}
        {error && (
          <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-rose-500 text-white p-3 text-center text-sm font-medium rounded-lg mx-2 shadow-lg animate-slide-up">
            {error}
            <button 
              className="ml-2 p-1 rounded-full hover:bg-white/20"
              onClick={() => setError(null)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

// Add these animation keyframes to your global CSS or inline here
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes tab-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-tab-bounce {
      animation: tab-bounce 0.5s ease-in-out;
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
    .ease-bounce {
      transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `}</style>
);

const NavigationLayoutWithStyles: FC<NavigationLayoutProps> = (props) => (
  <>
    <AnimationStyles />
    <NavigationLayout {...props} />
  </>
);

export default NavigationLayoutWithStyles;