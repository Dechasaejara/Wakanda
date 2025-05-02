"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, FC } from "react"; // Added FC type
import { WebApp } from "@twa-dev/types";

// Extend the Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

// Define the context type, potentially including user data structured according to the schema
interface AppContextType {
  // User data could be extended to include fields from the 'Users' or 'Profiles' schema tables
  user: WebApp | null | undefined;
  setUser: (value: WebApp | null | undefined) => void; // Allow setting user to null or undefined
  // Add other context properties as needed, potentially derived from the schema
  // e.g., modules, challenges, leaderboard data
}

// Create the context with a default value
// Using 'undefined' as the initial value to indicate that the context is not yet initialized
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to access the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Define the props for the layout component
interface NavigationLayoutProps {
  children: React.ReactNode;
}

// Navigation layout component
const NavigationLayout: FC<NavigationLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  // Initialize user state to undefined to differentiate from null (WebApp not available)
  const [user, setUser] = useState<WebApp | null | undefined>(undefined);

  // Define navigation tabs, aligning paths with potential routes based on schema entities
  const tabs: {
    id: string;
    label: string;
    path: string;
    // Icon: React.FC<{ className?: string }>; // Keep as a potential future addition
  }[] = [
    { id: "home", label: "Home", path: "/" },
    // Paths updated to reflect potential routes for schema entities
    { id: "leaderboard", label: "Leaderboard", path: "/leaderboard" },
    { id: "challenge", label: "Challenges", path: "/challenges" },
    // Assuming 'Task' might relate to lessons or user progress in the schema
    { id: "task", label: "My Progress", path: "/my-progress" },
  ];

  useEffect(() => {
    // Check if running in a browser and if Telegram WebApp is available
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      setUser(tg);

      // Show the back button and set its onClick handler
      tg.BackButton.show();
      tg.BackButton.onClick(() => router.back());

      // Expand the WebApp to full height
      tg.expand();
    } else {
      // Set an error if not in Telegram WebApp
      setError("This app should be opened in Telegram");
    }

    // Clean up the back button handler on component unmount
    return () => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.offClick(() => router.back());
      }
    };
  }, [router]); // Dependency array includes router

  // Helper function to determine if a tab is active
  const isActiveTab = (tabPath: string) => {
    return pathname === tabPath || pathname.startsWith(`${tabPath}/`);
  };

  return (
    // Provide the user and setUser function through the context
    <AppContext.Provider value={{ user, setUser }}>
      {/* Main container with flexible column layout */}
      <div className={`flex flex-col h-screen  mx-auto`}>
        {/* Content area, expands to fill available space */}
        <div className="flex-grow overflow-y-auto py-1 px-2 bg-card text-card-foreground mt-2">
          {children}
        </div>

        {/* Navigation bar at the bottom */}
        <div
          className={`bg-secondary text-secondary-foreground/50 border-card w-full p-1 pt-3 rounded-t-full`}
        >
          <div className="flex justify-around">
            {/* Map through tabs to create navigation links */}
            {tabs.map((tab) => {
              const isActive = isActiveTab(tab.path);
              return (
                <Link key={tab.id} href={tab.path} className={``}>
                  {/* Tab label with active state styling */}
                  <span
                    className={`w-8 h-8 flex items-center justify-center text-center text-xs ${ // Added flex and text styles for better layout
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
    </AppContext.Provider>
  );
};

export default NavigationLayout;