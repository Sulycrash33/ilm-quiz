"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAIHint } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { MosqueIcon } from "../icons/MosqueIcon";
import type { QuizQuestion } from "@/lib/types";

interface AskTheImamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuizQuestion;
}

export function AskTheImamDialog({ open, onOpenChange, question }: AskTheImamDialogProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && !hint && !error) {
      setIsLoading(true);
      const fetchHint = async () => {
        const result = await getAIHint({
          question: question.text,
          options: question.options || [],
        });
        if ("hint" in result) {
          setHint(result.hint);
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      };
      fetchHint();
    } else if (!open) {
      setTimeout(() => {
        setHint(null);
        setError(null);
        setIsLoading(false);
      }, 300);
    }
  }, [open, question, hint, error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MosqueIcon className="h-6 w-6 text-primary" />
            Ask the Imam
          </DialogTitle>
          <DialogDescription>
            The Imam is considering your question...
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 py-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {hint && (
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-secondary-foreground">{hint}</p>
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Return to Quiz
        </Button>
      </DialogContent>
    </Dialog>
  );
}
