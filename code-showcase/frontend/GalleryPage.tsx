"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Gallery / portfolio page.
 *
 * Showcases completed project categories with representative stock imagery
 * from Unsplash (free under the Unsplash License). These images represent the
 * TYPE of work performed — they are not photos from specific Rams @Elec jobs.
 * They will be replaced with actual project photography when available.
 */

type Category = "all" | "cold-rooms" | "electrical" | "hvac" | "emergency";

interface Project {
  id: string;
  title: string;
  category: Exclude<Category, "all">;
  description: string;
  details: string[];
  location: string;
  image: string;
  imageAlt: string;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "cold-rooms", label: "Cold Rooms" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC & AC" },
  { value: "emergency", label: "Emergency" },
];

// Representative stock imagery — replaced with actual project photos in production
const PROJECTS: Project[] = [
  {
    id: "cr-01",
    title: "Commercial Cold Room — Walk-In Freezer",
    category: "cold-rooms",
    description: "Custom-engineered -18°C walk-in freezer for a supermarket distribution centre. Dual-compressor redundancy with automated defrost cycling.",
    details: ["40m³ capacity", "Dual Bitzer compressors", "Polyurethane panel insulation", "Digital temp monitoring"],
    location: "Polokwane, Limpopo",
    image: "/images/projects/cold-storage.jpg", // Unsplash in dev, real photos in prod
    imageAlt: "Commercial cold storage facility interior",
  },
  {
    id: "el-01",
    title: "Industrial Distribution Board Upgrade",
    category: "electrical",
    description: "Full DB replacement on a manufacturing floor — 200A three-phase with per-circuit isolation, surge protection, and earth leakage on every outgoing.",
    details: ["200A 3-phase main", "32 outgoing circuits", "Type 2 SPD", "SANS 10142 certified"],
    location: "Centurion, Gauteng",
    image: "/images/projects/distribution-board.jpg",
    imageAlt: "Industrial electrical distribution panel with circuit breakers",
  },
  // ... 7 more projects across cold-rooms, electrical, hvac, emergency categories
];

const CATEGORY_ICONS: Record<string, { bg: string; icon: string }> = {
  "cold-rooms": { bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  electrical: { bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  hvac: { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  emergency: { bg: "bg-red-500/10 text-red-400 border-red-500/20", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
};

export default function GalleryPage() {
  const [filter, setFilter] = useState<Category>("all");

  const filtered = filter === "all"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="mono-label">Project Portfolio</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-white">
            Visual Mastery
          </h1>
          <p className="mt-4 text-industrial-400 max-w-xl mx-auto">
            Every project showcases the standard of wiring, mounting, and insulation that
            every client receives. Browse our completed work by category.
          </p>
        </div>

        {/* Verification banner — honesty policy: disclose stock imagery */}
        <div className="mb-10 p-4 rounded-xl border border-industrial-800 bg-industrial-900/60 text-center">
          <p className="text-sm text-industrial-400">
            <span className="text-brand-500 font-semibold">Transparency note:</span>{" "}
            Images shown are representative stock photos (Unsplash) illustrating the type of work
            we perform. Actual project photography from completed Rams @Elec jobs is being compiled.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === cat.value
                  ? "bg-brand-500 text-white"
                  : "bg-industrial-900 text-industrial-400 border border-industrial-800 hover:border-brand-500/50 hover:text-brand-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-white">Impressed by our work?</h2>
          <p className="mt-3 text-industrial-400 max-w-md mx-auto">
            Every project represents a real client who trusted Rams @Elec. We are ready to
            bring this same level of professional mastery to yours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/inquire" className="btn-primary">
              Start Your Project
            </Link>
            <Link href="/services" className="btn-outline">
              View Service Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const catStyle = CATEGORY_ICONS[project.category] ?? CATEGORY_ICONS.electrical;

  return (
    <div className="card-glow group flex flex-col">
      {/* Project image */}
      <div className="relative h-52 rounded-t-2xl -mx-6 -mt-6 mb-5 overflow-hidden border-b border-industrial-800">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-industrial-950/80 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border backdrop-blur-sm ${catStyle.bg}`}>
            {project.category.replace("-", " ")}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors">
          {project.title}
        </h3>
      </div>

      <p className="text-sm text-industrial-400 leading-relaxed mb-4">
        {project.description}
      </p>

      {/* Details list */}
      <ul className="space-y-1.5 mb-4">
        {project.details.map((detail) => (
          <li key={detail} className="flex items-center gap-2 text-xs text-industrial-300">
            <svg className="w-3 h-3 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {detail}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-industrial-800 flex items-center justify-between">
        <span className="text-xs text-industrial-500">
          {project.location}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${catStyle.bg}`}>
          {project.category.replace("-", " ")}
        </span>
      </div>
    </div>
  );
}
