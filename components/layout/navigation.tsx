"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, FC, SVGProps } from "react";
import { WebApp } from "@twa-dev/types";
import {
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowUpIcon,
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
  showError: (message: string) => void;
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

type NavTab = {
  id: number;
  label: string;
  path: string;
  Icon: FC<SVGProps<SVGSVGElement> & { className?: string }>;
};

const NavigationLayout: FC<NavigationLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<WebApp | null | undefined>(undefined);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Navigation tabs with icons
  const tabs: NavTab[] = [
    { id: 1, label: "Home", path: "/", Icon: HomeIcon },
    { id: 2, label: "Leaderboard", path: "/leaderboard", Icon: ChartBarIcon },
    { id: 3, label: "Challenges", path: "/challenges", Icon: BoltIcon },
    { id: 4, label: "Progress", path: "/my-progress", Icon: CheckCircleIcon },
  ];

  // Show error message with auto-dismiss
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Telegram WebApp integration
  useEffect(() => {
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
      console.warn("Telegram WebApp not found. Running in browser mode.");
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

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define CSS variables for theming
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --color-primary: #5D5CDE;
        --color-primary-light: #7B7AF0;
        --color-primary-dark: #4A49B0;
        --color-secondary: #F59E0B;
        --color-secondary-light: #FBBF24;
        --color-secondary-dark: #D97706;
        --max-width-container: 42rem;
        --header-height: 0px;
        --nav-height: 4rem;
        --space-page: max(1rem, min(2rem, 5vw));
        --radius-card: 1rem;
        --shadow-card: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .dark {
        --color-primary: #7B7AF0;
        --color-primary-light: #9897F2;
        --color-primary-dark: #5D5CDE;
        --color-secondary: #FBBF24;
        --color-secondary-light: #FCD34D;
        --color-secondary-dark: #F59E0B;
      }

      @media (min-width: 768px) {
        :root {
          --max-width-container: 48rem;
          --space-page: max(1.5rem, min(3rem, 6vw));
        }
      }

      @media (min-width: 1024px) {
        :root {
          --max-width-container: 64rem;
          --space-page: max(2rem, min(4rem, 8vw));
        }
      }
      
      body {
        font-family: var(--font-sans);
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.5);
        border-radius: 3px;
      }
      
      .dark ::-webkit-scrollbar-thumb {
        background: rgba(75, 85, 99, 0.5);
      }
      
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes shine {
        to { background-position: 200% center; }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      
      .animate-slide-up {
        animation: slideUp 0.3s ease-out;
      }
      
      .animate-pulse-once {
        animation: pulse 0.5s ease-in-out;
      }
      
      .animate-shine {
        background: linear-gradient(
          90deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.2) 25%,
          rgba(255,255,255,0.2) 50%,
          rgba(255,255,255,0) 100%
        );
        background-size: 200% auto;
        animation: shine 1.5s linear infinite;
      }
      
      /* Hide scrollbar for Chrome, Safari and Opera */
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      /* Hide scrollbar for IE, Edge and Firefox */
      .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, showError }}>
      <div className="flex flex-col min-h-dvh bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 mx-auto overflow-hidden transition-colors duration-300"
           style={{ maxWidth: 'var(--max-width-container)' }}>
        {/* Main content area with responsive padding */}
        <main className="flex-grow overflow-y-auto overscroll-none"
              style={{
                paddingTop: 'var(--space-page)',
                paddingLeft: 'var(--space-page)',
                paddingRight: 'var(--space-page)',
                paddingBottom: 'calc(var(--nav-height) + var(--space-page))',
              }}>
          <div className="space-y-6 animate-fade-in">
            {children}
          </div>
        </main>

        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10 transition-all duration-300"
             style={{
               maxWidth: 'var(--max-width-container)',
               margin: '0 auto',
               height: 'var(--nav-height)',
               borderTopLeftRadius: 'var(--radius-card)',
               borderTopRightRadius: 'var(--radius-card)',
             }}>
          <div className="flex justify-around items-center h-full">
            {tabs.map((tab) => {
              const isActive = isActiveTab(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`relative flex flex-col items-center justify-center p-2 w-full h-full transition-all duration-300
                              ${isActive 
                                ? "text-[var(--color-primary)] dark:text-[var(--color-primary-light)]" 
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30"}`}
                  aria-label={tab.label}
                >
                  {/* Active tab background indicator */}
                  {isActive && (
                    <span className="absolute inset-0 bg-gray-100 dark:bg-gray-700/40 animate-fade-in -z-10" />
                  )}
                  
                  <tab.Icon
                    className={`w-6 h-6 mb-1 transition-transform duration-300 ${
                      isActive ? "animate-pulse-once scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  
                  <span className="text-xs font-medium">
                    {tab.label}
                  </span>
                  
                  {/* Active tab indicator line */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[var(--color-primary)] dark:bg-[var(--color-primary-light)] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:focus:ring-[var(--color-primary-light)] ${
            showScrollButton ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Error message toast */}
        {error && (
          <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-xs px-4 animate-slide-up z-50">
            <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center justify-between">
              <span className="text-sm font-medium">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default NavigationLayout;