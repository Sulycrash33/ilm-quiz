"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState, useTransition } from "react"
import { BadgeCheck, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { useToast } from "@/hooks/use-toast"
import {
  listQuestions,
  reviewQuestion,
  type AdminQuestion,
  type QuestionSummary,
} from "@/app/(app)/admin/questions/actions"

const PAGE_SIZE = 25

interface Props {
  initialQuestions: AdminQuestion[]
  initialTotal: number
  summary: QuestionSummary | null
}

const statusColors: Record<string, string> = {
  published: "bg-emerald-400/10 text-emerald-400",
  ai_drafted: "bg-blue-400/10 text-blue-400",
  draft: "bg-blue-400/10 text-blue-400",
  rejected: "bg-red-400/10 text-red-400",
}

/**
 * The question console: all 5,220, not the first 1,000.
 *
 * Every filter and the paging are applied in the database rather than to an
 * array in the browser — the previous version fetched everything and filtered
 * client-side, which is exactly how it ended up showing a fifth of the bank
 * and calling it the whole thing.
 *
 * "Scholar approved" is shown and set separately from the publication status.
 * They are different facts: a question is published so it can be played, and
 * separately vouched for by a person. Conflating them would take the question
 * out of the game the moment it was approved.
 */
export function QuestionsPageClient({ initialQuestions, initialTotal, summary }: Props) {
  const reduce = useReducedMotion()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  const [questions, setQuestions] = useState(initialQuestions)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tier, setTier] = useState("")
  const [status, setStatus] = useState("")
  const [source, setSource] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Typing a search term should not fire a query per keystroke against a
  // 5,220-row table.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const filterKey = `${debounced}|${categoryId}|${tier}|${status}|${source}`

  // Any change of filter puts us back on the first page: staying on page 40
  // of a result set that now has three pages shows nothing and looks broken.
  useEffect(() => {
    setPage(0)
  }, [filterKey])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listQuestions({
      search: debounced,
      categoryId: categoryId || undefined,
      tier: tier ? Number(tier) : undefined,
      status: status || undefined,
      source: source || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }).then((r) => {
      if (cancelled) return
      setLoading(false)
      if (!r.ok) {
        toast({ variant: "destructive", title: "Could not load questions", description: r.error })
        return
      }
      setQuestions(r.questions)
      setTotal(r.total)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const scholarDone = summary
    ? summary.categories.reduce((n, c) => n + c.scholar_approved, 0)
    : 0

  async function act(q: AdminQuestion, opts: { status?: "published" | "rejected"; scholarApproved?: boolean }) {
    if (busy) return
    setBusy(q.id)
    const r = await reviewQuestion(q.id, opts)
    setBusy(null)
    if (!r.ok) {
      toast({ variant: "destructive", title: "That did not work", description: r.error })
      return
    }
    setQuestions((prev) =>
      prev.map((x) =>
        x.id === q.id
          ? {
              ...x,
              status: opts.status ?? x.status,
              scholarApproved: opts.scholarApproved ?? x.scholarApproved,
            }
          : x,
      ),
    )
    startTransition(() => {})
  }

  return (
    <div className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          Question Bank
        </h1>
        <p className="text-on-surface-variant">
          {summary ? `${summary.total} questions` : `${total} questions`}
          {summary && ` · ${scholarDone} scholar approved`}
        </p>
      </motion.div>

      {summary && scholarDone === 0 && (
        <PremiumCard className="mb-6 border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-on-surface">
            No question has been approved by a scholar yet. Filter to{" "}
            <strong>Awaiting review</strong> and work a category at a time — approving a
            question keeps it published and playable, it only records that a person
            vouched for it.
          </p>
        </PremiumCard>
      )}

      <div className="mb-6 grid gap-3 md:grid-cols-5">
        <input
          type="text"
          placeholder="Search text, explanation or citation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface placeholder:text-on-surface-variant/50"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Filter by category"
          className="px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface"
        >
          <option value="">All categories</option>
          {summary?.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.scholar_approved}/{c.total})
            </option>
          ))}
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          aria-label="Filter by tier"
          className="px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface"
        >
          <option value="">All tiers</option>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((t) => (
            <option key={t} value={t}>Tier {t}</option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-label="Filter by review state"
          className="px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface"
        >
          <option value="">Reviewed or not</option>
          <option value="unreviewed">Awaiting review</option>
          <option value="scholar">Scholar approved</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">
          {loading ? "Loading..." : `${total} matching · page ${page + 1} of ${pages}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">Nothing matches those filters.</p>
          </PremiumCard>
        ) : (
          questions.map((q) => (
            <motion.div key={q.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <PremiumCard className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                      className="text-left"
                    >
                      <p className="font-medium text-on-surface">{q.text}</p>
                    </button>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-on-surface-variant">{q.category ?? "Uncategorised"}</span>
                      <span className="text-on-surface-variant/60">·</span>
                      <span className="text-on-surface-variant">Tier {q.tier ?? "—"}</span>
                      <span className="text-on-surface-variant/60">·</span>
                      <span className="text-on-surface-variant">{q.difficulty}</span>
                      <span className={`rounded px-2 py-0.5 ${statusColors[q.status] ?? "bg-white/5 text-on-surface-variant"}`}>
                        {q.status}
                      </span>
                      {q.scholarApproved && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-400/10 px-2 py-0.5 text-emerald-400">
                          <BadgeCheck className="h-3 w-3" aria-hidden="true" /> scholar approved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => act(q, { scholarApproved: !q.scholarApproved })}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        q.scholarApproved
                          ? "border-white/15 text-on-surface-variant hover:bg-white/5"
                          : "border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10"
                      }`}
                    >
                      {busy === q.id
                        ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        : <BadgeCheck className="h-4 w-4" aria-hidden="true" />}
                      {q.scholarApproved ? "Withdraw approval" : "Approve"}
                    </button>

                    {q.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => act(q, { status: "rejected" })}
                        aria-label="Reject this question"
                        className="inline-flex items-center gap-2 rounded-lg border border-error/40 px-3 py-2 text-sm font-semibold text-error transition-colors hover:bg-error/15 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" aria-hidden="true" /> Reject
                      </button>
                    )}
                  </div>
                </div>

                {expanded === q.id && (
                  <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-surface-container/50 p-4">
                    <ol className="space-y-1">
                      {q.choices.map((c, i) => (
                        <li
                          key={i}
                          className={`text-sm ${i === q.correctIndex ? "font-semibold text-emerald-400" : "text-on-surface-variant"}`}
                        >
                          {String.fromCharCode(65 + i)}. {c}
                          {i === q.correctIndex && " ✓"}
                        </li>
                      ))}
                    </ol>
                    {q.explanation && (
                      <p className="text-sm text-on-surface-variant">
                        <span className="text-on-surface">Explanation: </span>{q.explanation}
                      </p>
                    )}
                    {q.citation && (
                      <p className="text-sm text-on-surface-variant">
                        <span className="text-on-surface">Citation: </span>{q.citation}
                      </p>
                    )}
                  </div>
                )}
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>

      {pending && <span className="sr-only">Saving</span>}
    </div>
  )
}
