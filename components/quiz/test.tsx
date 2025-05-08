    "use client";

    import Link from "next/link";
    import { usePathname, useRouter } from "next/navigation";
    import {
    createContext,
    useContext,
    useEffect,
    useState,
    FC,
    SVGProps,
    } from "react";
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

    // Navigation tabs with icons
    const tabs: {
        id: number;
        label: string;
        path: string;
        Icon: IconComponentType;
    }[] = [
        { id: 1, label: "Home", path: "/", Icon: HomeIcon },
        { id: 2, label: "Leaderboard", path: "/leaderboard", Icon: ChartBarIcon },
        { id: 3, label: "Challenges", path: "/challenges", Icon: BoltIcon },
        { id: 4, label: "Progress", path: "/my-progress", Icon: CheckCircleIcon },
    ];

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
        console.warn(
            "Telegram WebApp not found. Running in browser mode or environment issue."
        );
        }
    }, [router]);

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "/") return pathname === tabPath;
        return pathname.startsWith(tabPath);
    };

    // Support dark mode
    useEffect(() => {
        if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
        document.documentElement.classList.add("dark");
        }

        window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (event) => {
            if (event.matches) {
            document.documentElement.classList.add("dark");
            } else {
            document.documentElement.classList.remove("dark");
            }
        });
    }, []);

    return (
        <AppContext.Provider value={{ user, setUser }}>
        <div className="flex flex-col h-dvh bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 max-w-md mx-auto relative overflow-hidden">
            {/* Main content area */}
            <main className="flex-grow overflow-y-auto px-4 pt-4 pb-20 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
            {children}
            </main>

            {/* Bottom navigation bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg rounded-t-xl z-10">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                const isActive = isActiveTab(tab.path);
                return (
                    <Link
                    key={tab.id}
                    href={tab.path}
                    className={`flex flex-col items-center justify-center p-2 w-full rounded-lg transition-all duration-200
                                ${
                                    isActive
                                    ? "text-[#5D5CDE] dark:text-[#7B7AF0]"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                                }`}
                    aria-label={tab.label}
                    >
                    <tab.Icon
                        className={`w-6 h-6 mb-0.5 ${
                        isActive ? "animate-pulse-once" : ""
                        }`}
                    />
                    <span className="text-xs font-medium mt-0.5">
                        {tab.label}
                    </span>
                    {isActive && (
                        <div className="absolute -bottom-0.5 w-1/4 h-0.5 bg-[#5D5CDE] dark:bg-[#7B7AF0] rounded-full" />
                    )}
                    </Link>
                );
                })}
            </div>
            </nav>

            {error && (
            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-red-500 text-white p-3 text-center text-sm">
                {error}
            </div>
            )}
        </div>
        </AppContext.Provider>
    );
    };

    export default NavigationLayout;


    import { db } from "@/backend/db/drizzle";
    import { Questions } from "@/backend/db/schema";
    import QuizFilter from "@/components/quiz/QuizFilter";

    export default async function Home() {
    const allQuestions = await db.select().from(Questions);

    return (
        <main
        className="container mx-auto py-8 px-2 sm:px-1 lg:px-8"
        style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
        >
        <h1 className="text-3xl font-bold text-center text-amber-600 mb-6">
            Welcome to the Quiz App
        </h1>
        <QuizFilter allQuestions={allQuestions} />
        </main>
    );
    }
