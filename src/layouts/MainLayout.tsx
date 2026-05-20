import { Outlet } from "react-router-dom";
import { Library } from "lucide-react";

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <Library size={28} />
              <span className="font-bold text-xl tracking-tight">
                Metadata Library
              </span>
            </div>
            <nav className="hidden md:flex gap-4">
              <span className="text-gray-500 hover:text-[var(--color-primary)] cursor-pointer transition">
                Home
              </span>
              <span className="text-gray-500 hover:text-[var(--color-primary)] cursor-pointer transition">
                Browse
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} Metadata Library System. Built with Clean
          Architecture.
        </p>
      </footer>
    </div>
  );
};
