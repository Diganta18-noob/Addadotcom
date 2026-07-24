"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background text-foreground noise-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-caramel transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-caramel" />
              {title}
            </h1>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated} • AddaDotCom Enterprise Policies
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-foreground">
                {idx + 1}. {section.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
