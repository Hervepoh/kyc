'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun } from 'lucide-react';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
   const locale: 'en' | 'fr' = 'en';
  interface ToggleLocaleFunction {
    (locale: 'en' | 'fr'): void;
  }

  const toggleLocale: ToggleLocaleFunction = (locale) => {
    console.log(locale);
  };

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => toggleLocale("en")}>
        EN
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => toggleLocale("fr")}>
        FR
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  );
}
