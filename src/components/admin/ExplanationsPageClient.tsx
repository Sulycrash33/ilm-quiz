"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import {
  generateDrafts,
  publishDraft,
  discardDraft,
  reviseDraft,
  listDrafts,
  type DraftRow,
} from "@/app/(app)/admin/explanations/actions"

interface Props {
  categories: { id: string; name: string }[]
  initialRows: DraftRow[]
  initialTotal: number
  loadError: string | null
  progress: {
    total: number
    short: number
    rewritten: number
    pending: number
    avgChars: number
  }
}

/**
 * Reviewing rewritten explanations before any player sees one.
 *
 * The old and the new sit side by side because the decision is a comparison,
 * not a judgement of the new text alone: most of the current explanations are
 * a paraphrase of the correct answer, and seeing that next to the replacement
 * is what makes the difference obvious.
 *
 * Nothing here is bulk-approved on purpose. A publish-all button would make
 * this the same one-step drafting-and-publishing that produced the
 * explanations being replaced.
 */
export function ExplanationsPageClient({
  categories,
  initialRows,
  initialTotal,
  loadError,
  progress,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rows, setRows] = useState(initialRows)
  const [total, setTotal] = useState(initialTotal)
  const [categoryId, setCategoryId] = useState("")
  const [error, setError] = useState<string | null>(loadError)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  async function refresh(cat = categoryId) {
    const res = await listDrafts(cat || undefined, 25, 0)
    if (res.ok) {
      setRows(res.rows)
      setTotal(res.total)
    }
    startTransition(() => router.refresh())
  }

  function generate() {
    if (!categoryId) {
      setError("Pick a category first. Drafting runs one category at a time.")
      return
    }
    setError(null)
    setNotice(null)
    setBusy("generate")
    startTransition(async () => {
      const res = await generateDrafts(categoryId, 10)
      setBusy(null)
      if (!res.ok) {
        setError(res.error)
        return
      }
      if (res.drafted === 0) {
        setNotice(
          "Nothing new was drafted. Either every question in this category already has a draft waiting, or the model returned none.",
        )
      } else {
        setNotice(
          `Drafted ${res.drafted}. ${res.flagged} flagged for scholar verification. ` +
            `${res.skipped} returned nothing usable.`,
        )
      }
      await refresh()
    })
  }

  function accept(id: string) {
    setBusy(id)
    setError(null)
    startTransition(async () => {
      const res = await publishDraft(id)
      setBusy(null)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
      setTotal((t) => Math.max(0, t - 1))
      startTransition(() => router.refresh())
    })
  }

  function reject(id: string) {
    setBusy(id)
    setError(null)
    startTransition(async () => {
      const res = await discardDraft(id)
      setBusy(null)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
      setTotal((t) => Math.max(0, t - 1))
      startTransition(() => router.refresh())
    })
  }

  function saveRevision(id: string) {
    setBusy(id)
    setError(null)
    startTransition(async () => {
      const res = await reviseDraft(id, editText)
      setBusy(null)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, draft: editText, draftChars: editText.length, draftedBy: "edited by hand" }
            : r,
        ),
      )
      setEditing(null)
    })
  }

  const donePct =
    progress.total > 0 ? Math.round((progress.rewritten / progress.total) * 100) : 0

  return (
    <div className="min-h-[100dvh] max-w-5xl mx-auto px-1 py-2">
      <div className="mb-6">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-1">
          Explanations
        </h1>
        <p className="text-sm text-on-surface-variant">
          Rewritten explanations wait here. A player sees one only after you publish it.
        </p>
      </div>

      <PremiumCard className="mb-6 p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Published questions" value={progress.total.toLocaleString()} />
          <Stat label="Rewritten" value={`${progress.rewritten.toLocaleString()} (${donePct}%)`} />
          <Stat label="Still short" value={progress.short.toLocaleString()} />
          <Stat label="Average length" value={`${progress.avgChars} chars`} />
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          &ldquo;Still short&rdquo; counts anything under 300 characters. The explanations being
          replaced average 125 and mostly restate the correct answer; the rewrite targets 350 to 600.
        </p>
      </PremiumCard>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success-bright">
          {notice}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            void refresh(e.target.value)
          }}
          className="rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={generate}
          disabled={pending || busy !== null}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-50"
        >
          {busy === "generate" ? "Drafting…" : "Draft 10 more"}
        </button>

        <span className="text-sm text-on-surface-variant">
          {total} draft{total === 1 ? "" : "s"} waiting
        </span>
      </div>

      {rows.length === 0 ? (
        <PremiumCard className="p-8 text-center">
          <p className="text-on-surface-variant">
            No drafts waiting. Pick a category and draft a batch to begin.
          </p>
        </PremiumCard>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <PremiumCard key={r.id} className="p-4">
              <div className="mb-3">
                <p className="font-medium text-on-surface">{r.question}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {r.category} · tier {r.tier} · correct answer: {r.correct}
                </p>
                {r.draftedBy?.includes("needs verification") && (
                  <span className="mt-2 inline-block rounded bg-warning/10 px-2 py-0.5 text-xs text-warning-bright">
                    the model flagged this one for scholar verification
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-surface-container/50 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-on-surface-variant">
                    Now ({r.currentChars} chars)
                  </p>
                  <p className="text-sm text-on-surface-variant">{r.current ?? "(none)"}</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-primary">
                    Proposed ({r.draftChars} chars)
                  </p>
                  {editing === r.id ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
                    />
                  ) : (
                    <p className="text-sm text-on-surface">{r.draft}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {editing === r.id ? (
                  <>
                    <button
                      onClick={() => saveRevision(r.id)}
                      disabled={busy !== null || !editText.trim()}
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary disabled:opacity-50"
                    >
                      Save wording
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-on-surface-variant hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => accept(r.id)}
                      disabled={busy !== null}
                      className="rounded-lg bg-success px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {busy === r.id ? "Working…" : "Publish this"}
                    </button>
                    <button
                      onClick={() => { setEditing(r.id); setEditText(r.draft) }}
                      disabled={busy !== null}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-on-surface hover:bg-white/5 disabled:opacity-50"
                    >
                      Edit first
                    </button>
                    <button
                      onClick={() => reject(r.id)}
                      disabled={busy !== null}
                      className="rounded-lg border border-danger/30 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      Discard
                    </button>
                  </>
                )}
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold tabular-nums text-primary">{value}</p>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </div>
  )
}
