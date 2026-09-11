import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { availabilityMeta, type Trainer } from "@/lib/trainers";

export function waLink(trainer: Trainer, message?: string) {
  const num = trainer.whatsapp.replace(/[^0-9]/g, "");
  const text =
    message ??
    `Hi ${trainer.name.split(" ")[0]}, this is ATOM. We have a training requirement matching your profile. Are you available for this project?`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export function mailLink(trainer: Trainer) {
  return `mailto:${trainer.email}?subject=${encodeURIComponent("ATOM Training Requirement")}&body=${encodeURIComponent(
    `Hi ${trainer.name.split(" ")[0]},\n\nWe have an upcoming training requirement and would like to check your availability.\n\nRegards,\nATOM Team`,
  )}`;
}

export function ContactActions({ trainer, size = "sm" }: { trainer: Trainer; size?: "sm" | "md" }) {
  const cls =
    size === "sm"
      ? "inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
      : "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent";
  return (
    <div className="flex flex-wrap gap-2">
      <a className={cls} href={`tel:${trainer.phone}`}>
        <Phone className="h-3.5 w-3.5" /> Call
      </a>
      <a className={cls} href={waLink(trainer)} target="_blank" rel="noreferrer">
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
      <a className={cls} href={mailLink(trainer)}>
        <Mail className="h-3.5 w-3.5" /> Email
      </a>
    </div>
  );
}

export function StatusPill({ trainer }: { trainer: Trainer }) {
  const meta = availabilityMeta[trainer.availability];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <article className="card-surface flex flex-col gap-4 p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start gap-3">
        <img
          src={trainer.photo}
          alt={trainer.name}
          className="h-14 w-14 rounded-xl border border-border bg-muted object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold">{trainer.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{trainer.designation}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {trainer.city}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {trainer.skills.slice(0, 4).map((s) => (
          <span
            key={s.name}
            className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground"
          >
            {s.name}
          </span>
        ))}
        {trainer.skills.length > 4 && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            +{trainer.skills.length - 4}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{trainer.experience} yrs experience</span>
        <span>Projects: {trainer.projectsCompleted}</span>
        <StatusPill trainer={trainer} />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Link
          to="/trainers/$trainerId"
          params={{ trainerId: trainer.id }}
          className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          View Profile
        </Link>
        <ContactActions trainer={trainer} />
      </div>
    </article>
  );
}
