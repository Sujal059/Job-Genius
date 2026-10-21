import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { JobGeniusLogo } from "../ui/JobGeniusLogo";

export function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-main">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-line-subtle bg-surface/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <a href="/dashboard" className="flex items-center gap-2">
          <JobGeniusLogo size="sm" />
        </a>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-muted hover:text-main"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="relative h-full">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-4 z-10 text-muted hover:text-main"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 md:px-10 md:pb-12 md:pt-10">
        <div className="mx-auto max-w-6xl">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}

export default AppShell;
