import { useState, useEffect, type ReactNode } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { MinimalistHeader } from "./MinimalistHeader";
import { PdfUploadModal } from "./PdfUploadModal";
import { BulkUploadModal } from "./BulkUploadModal";
import { SimpleAddTrainerModal } from "./SimpleAddTrainerModal";

export function AppShell({ children }: { title?: string; subtitle?: string; children: ReactNode }) {
  const { isAuthenticated } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Route Protection: If unauthenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, pathname, navigate]);

  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Minimalist Header */}
      <MinimalistHeader />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>

      {/* Global Modals */}
      <PdfUploadModal isOpen={pdfModalOpen} onClose={() => setPdfModalOpen(false)} />
      <BulkUploadModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
      <SimpleAddTrainerModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />

      {/* Minimal Footer */}
      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        ATOM  • Centralized Internal Network & Smart Requirement Matcher
      </footer>
    </div>
  );
}
