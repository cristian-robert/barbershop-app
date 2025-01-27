"use client";

import { MainNav } from "@/components/navigation/main-nav";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Barbershop</h1>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <MainNav />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
