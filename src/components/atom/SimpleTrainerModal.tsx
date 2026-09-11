import React from "react";
import {
  X,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  GraduationCap,
  Award,
  Trash2,
} from "lucide-react";
import type { Trainer } from "@/lib/trainers";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface SimpleTrainerModalProps {
  trainer: Trainer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleTrainerModal({ trainer, isOpen, onClose }: SimpleTrainerModalProps) {
  const { deleteTrainer } = useStore();

  if (!isOpen || !trainer) return null;

  const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
  const whatsappNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello ${trainer.name}, We are from Team ATOM, and we are currently looking for a trainer. We would like to check your availability and discuss the opportunity with you.

Please let us know a convenient time to connect.`,
  )}`;

  const handleAddRating = (e: React.FormEvent) => {
    e.preventDefault();
    addTrainerRating(trainer.id, {
      technical: ratingScore,
      communication: ratingScore,
      engagement: ratingScore,
      punctuality: ratingScore,
      content: ratingScore,
      overall: ratingScore,
      comments: ratingComment,
      project: "Direct Evaluation",
    });
    setShowRatingForm(false);
    setRatingComment("");
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${trainer.name} from ATOM Hub?`)) {
      deleteTrainer(trainer.id);
      toast.info(`${trainer.name} removed.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card-surface max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-lg border border-primary/20">
              {trainer.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{trainer.name}</h2>
              <p className="text-xs text-muted-foreground">{trainer.designation}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <MapPin className="h-3 w-3" /> {trainer.city}, {trainer.state}
                </span>
                <span>•</span>
                <span>{trainer.experience} yrs exp</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5">
          {/* Quick Contact Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp ({trainer.phone})
            </a>
            <a
              href={`tel:${trainer.phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-semibold text-foreground hover:bg-muted"
            >
              <Phone className="h-3.5 w-3.5 text-primary" /> Call
            </a>
            <a
              href={`mailto:${trainer.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-semibold text-foreground hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5 text-primary" /> {trainer.email}
            </a>
          </div>

          {/* Bio / Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Professional Summary
            </h4>
            <p className="text-xs leading-relaxed text-foreground rounded-xl bg-card border border-border/60 p-3">
              {trainer.bio || "No summary provided."}
            </p>
          </div>

          {/* Skills & Competencies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Skills & Expertise ({trainer.skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {trainer.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  <span>{skill.name}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                    {skill.level} • {skill.years}y
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Certifications */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            {/* Education */}
            <div className="rounded-xl border border-border/80 bg-card p-3.5">
              <h5 className="flex items-center gap-1.5 font-bold text-foreground mb-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Education
              </h5>
              {trainer.education.length > 0 ? (
                trainer.education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-semibold text-foreground">{edu.degree}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {edu.field} • {edu.college} ({edu.year})
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-[11px]">Degree verified in record.</p>
              )}
            </div>

            {/* Certifications */}
            <div className="rounded-xl border border-border/80 bg-card p-3.5">
              <h5 className="flex items-center gap-1.5 font-bold text-foreground mb-2">
                <Award className="h-4 w-4 text-primary" /> Certifications & Track Record
              </h5>
              <p className="font-semibold text-foreground">
                {trainer.projectsCompleted} Corporate & Campus Batches Delivered
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Modes: {trainer.modes.join(", ")} • Sectors: {trainer.sectors.join(", ")}
              </p>
            </div>
          </div>



          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove Trainer
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
