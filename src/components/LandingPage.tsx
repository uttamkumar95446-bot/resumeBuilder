"use client";

import Link from "next/link";
import { ArrowRight, FileText, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "Match Scoring",
    description:
      "Get an explainable 0–100 match score showing how well your resume aligns with any job description.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Bullet Rewriting",
    description:
      "Rewrite experience bullets to better match job requirements while preserving your actual experience and truthfulness.",
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Gap Analysis",
    description:
      "Identify missing skills, weak areas, and get actionable suggestions for improving your resume.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-background to-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Turn Any Job Description Into a{" "}
              <span className="text-primary">Targeted Resume</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Resume Shapeshifter analyzes your resume against real job descriptions,
              rewrites bullets to better match the role, and generates a side-by-side
              comparison — all while preserving truthfulness.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-base">
                  Try It Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-base">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to a better-matched resume.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to optimize your resume?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            No sign-up required. Just paste your resume and a job description to get started.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="text-base">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Resume Shapeshifter — AI-assisted resume tailoring with truthfulness guarantees.</p>
        </div>
      </footer>
    </div>
  );
}
