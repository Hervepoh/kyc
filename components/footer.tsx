import { Heart } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import LocaleSwitcher from "./LocaleSwitcher";

export function Footer() {
    return (
        <footer className="bg-white dark:bg-black max-h-[100px]">
            <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center ">
                <div>
                    Built  by{' '}
                    {/* with <Heart className="w-5 text-red-600 mx-1" /> */}
                    <a
                        href="https://twitter.com/deepwhitman"
                        target="_blank"
                        rel="noreferrer"
                        className="text-palette-primary font-bold px-1"
                    >
                        Eneo Cameroon SA
                    </a>
                </div>
                <div className="flex gap-1">
                    <LocaleSwitcher />
                    {/* <ThemeToggle /> */}
                </div>
              
            </div>

        </footer>
    )
}