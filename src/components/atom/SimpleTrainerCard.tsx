import React from "react";
import { MapPin, MessageCircle, Phone, Mail, Sparkles, ChevronRight } from "lucide-react";
import type { Trainer } from "@/lib/trainers";

interface SimpleTrainerCardProps {
  trainer: Trainer;
  activeRequirementTerms?: string[];
  minExperience?: number | null;
  matchScore?: number;
  onViewDetails: (trainer: Trainer) => void;
}

export function SimpleTrainerCard({
  trainer,
  activeRequirementTerms = [],
  minExperience,
  matchScore,
  onViewDetails,
}: SimpleTrainerCardProps) {
  // Format WhatsApp Link with prefilled text
  const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
  const whatsappNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello ${trainer.name}, We are from Team ATOM, and we are currently looking for a trainer. We would like to check your availability and discuss the opportunity with you.

Please let us know a convenient time to connect.`,
  )}`;

  const isMatchingTerm = (skillName: string) => {
    if (!activeRequirementTerms.length) return false;
    return activeRequirementTerms.some(
      (term) =>
        skillName.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(skillName.toLowerCase()),
    );
  };

  return (
    <div className="card-surface group relative flex flex-col justify-between rounded-2xl border border-border/80 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-base border border-primary/10">
              {trainer.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                  {trainer.name}
                </h3>
                {matchScore !== undefined && matchScore > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                    <Sparkles className="h-2.5 w-2.5" /> {matchScore}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">{trainer.designation}</p>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {trainer.city}
          </span>
          <span>•</span>
          <span
            className={`transition-all ${
              minExperience && trainer.experience >= minExperience
                ? "font-bold rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[11px]"
                : "font-medium text-foreground"
            }`}
          >
            {trainer.experience} yrs exp
          </span>
        </div>

        {/* Skills Pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {trainer.skills.map((skill) => {
            const isMatch = isMatchingTerm(skill.name);
            return (
              <span
                key={skill.name}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all ${
                  isMatch
                    ? "bg-emerald-500 text-white font-bold shadow-xs scale-105"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {skill.name}
              </span>
            );
          })}
        </div>

        {/* Short Bio snippet */}
        {trainer.bio && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {trainer.bio}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        {/* Quick Contact Icons */}
        <div className="flex items-center gap-1.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp ${trainer.name}`}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <a
            href={`tel:${trainer.phone}`}
            title={`Call ${trainer.name}`}
            className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>

          <a
            href={`mailto:${trainer.email}`}
            title={`Email ${trainer.name}`}
            className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* View Profile Modal Button */}
        <button
          onClick={() => onViewDetails(trainer)}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          View Profile <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
