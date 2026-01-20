"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[70vh] w-full items-center justify-center px-4 py-16">
      <Card className="relative w-full max-w-xl overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-10 top-10 h-40 rounded-full bg-primary/15 blur-[80px]"
          aria-hidden
        />
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" aria-hidden />
          </div>
          <CardTitle className="text-3xl">Oops, something broke</CardTitle>
          <CardDescription>
            We could not complete your request. You can retry the last step or head back to the
            homepage while we inspect the issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Details</p>
          <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {error.message || "Unknown error. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Reference code:{" "}
              <span className="font-semibold text-foreground">{error.digest}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
