"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut } from "lucide-react";
import Image from "next/image";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background">
            <header className="eneo-gradient">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="ENEO Logo"
                                width={120}
                                height={40}
                                className="h-8 w-auto"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="text-white hover:text-white/80"
                            >
                                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                className="text-white hover:text-white/80"
                                onClick={() => { }}
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}