import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface MinimalistHeaderProps {
  onOpenPdfUpload?: () => void;
  onOpenAddTrainer?: () => void;
  onOpenBulkUpload?: () => void;
}

export function MinimalistHeader({}: MinimalistHeaderProps) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully.");
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <img
              src="/atom-logo.png"
              alt="ATOM"
              className="h-9 w-auto object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Trainer Hub
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
               
              </p>
            </div>
          </Link>
        </div>

        {/* Admin User Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-foreground leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-muted-foreground">{currentUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

