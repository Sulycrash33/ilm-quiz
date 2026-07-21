"use client";

/**
 * The onboarding flow (age -> avatar -> name) collects profile data before
 * any account exists. There's nowhere to persist it until signup, so we
 * stash it in sessionStorage and apply it to the real `profiles` row right
 * after account creation.
 */

const KEY = "ilmq_onboarding";

export interface OnboardingSelections {
  ageRange?: string;
  avatarUrl?: string;
  name?: string;
  preferredLanguage?: string;
}

export function saveOnboardingSelection(patch: Partial<OnboardingSelections>) {
  if (typeof window === "undefined") return;
  const current = getOnboardingSelections();
  sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
}

export function getOnboardingSelections(): OnboardingSelections {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearOnboardingSelections() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
