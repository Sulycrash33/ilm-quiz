"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { PremiumCard } from "@/components/ui/premium-card"
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type AdminCategory,
} from "@/app/(app)/admin/categories/actions"

interface Props {
  categories: AdminCategory[]
}

/** Turns a display name into a usable slug, matching the pattern the database
 *  enforces: lowercase, and only letters, numbers, hyphens and underscores. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CategoriesPageClient({ categories }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // The working order. Reordering is applied here first so the list responds
  // to a click immediately, then saved; a failure re-reads from the server
  // rather than leaving the screen showing an order the database rejected.
  const [order, setOrder] = useState(categories)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newSlugTouched, setNewSlugTouched] = useState(false)
  const [newDesc, setNewDesc] = useState("")
  const [newIcon, setNewIcon] = useState("")

  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editIcon, setEditIcon] = useState("")

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function refresh() {
    setDirty(false)
    startTransition(() => router.refresh())
  }

  function move(index: number, delta: number) {
    const next = [...order]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
    setDirty(true)
    setError(null)
    setNotice(null)
  }

  function saveOrder() {
    setError(null)
    startTransition(async () => {
      const res = await reorderCategories(order.map((c) => c.id))
      if (!res.ok) {
        setError(res.error)
        // The screen must not keep showing an order the database refused.
        router.refresh()
        return
      }
      setNotice("Order saved.")
      refresh()
    })
  }

  function submitNew() {
    setError(null)
    const slug = newSlugTouched ? newSlug : slugify(newName)
    startTransition(async () => {
      const res = await createCategory({
        name: newName,
        slug,
        description: newDesc,
        icon: newIcon,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setAdding(false)
      setNewName(""); setNewSlug(""); setNewSlugTouched(false); setNewDesc(""); setNewIcon("")
      setNotice("Category added at the end of the list.")
      refresh()
    })
  }

  function beginEdit(c: AdminCategory) {
    setEditing(c.id)
    setEditName(c.name)
    setEditDesc(c.description ?? "")
    setEditIcon(c.icon ?? "")
    setError(null)
  }

  function submitEdit(id: string) {
    setError(null)
    startTransition(async () => {
      const res = await updateCategory({ id, name: editName, description: editDesc, icon: editIcon })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setEditing(null)
      setNotice("Category updated.")
      refresh()
    })
  }

  function submitDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const res = await deleteCategory(id)
      if (!res.ok) {
        setError(res.error)
        setConfirmDelete(null)
        return
      }
      setConfirmDelete(null)
      setNotice("Category deleted.")
      refresh()
    })
  }

  return (
    <div className="min-h-[100dvh] px-1 py-2 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-1">Categories</h1>
        <p className="text-on-surface-variant text-sm">
          {order.length} categories. The order here is the order players see on the category grid.
        </p>
      </motion.div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setAdding((v) => !v); setError(null); setNotice(null) }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
        >
          {adding ? "Cancel" : "Add category"}
        </button>

        {dirty && (
          <>
            <button
              onClick={saveOrder}
              disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save order"}
            </button>
            <button
              onClick={() => { setOrder(categories); setDirty(false) }}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-on-surface-variant hover:bg-white/5"
            >
              Discard
            </button>
            <span className="text-xs text-on-surface-variant">The new order is not saved yet.</span>
          </>
        )}
      </div>

      {adding && (
        <PremiumCard className="mb-6 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-on-surface-variant">Name</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-on-surface"
                placeholder="Fiqh of Worship"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-on-surface-variant">
                Slug <span className="text-xs">(the URL: /quiz/&lt;slug&gt;, and permanent)</span>
              </span>
              <input
                value={newSlugTouched ? newSlug : slugify(newName)}
                onChange={(e) => { setNewSlug(e.target.value); setNewSlugTouched(true) }}
                className="w-full rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 font-mono text-on-surface"
                placeholder="fiqh-of-worship"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-on-surface-variant">Description</span>
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-on-surface"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-on-surface-variant">Icon (an emoji)</span>
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                maxLength={4}
                className="w-24 rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-on-surface"
                placeholder="📗"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={submitNew}
              disabled={pending || !newName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add"}
            </button>
            <p className="text-xs text-on-surface-variant">
              A new category starts empty and appears at the end. It stays invisible to players
              until it has published questions.
            </p>
          </div>
        </PremiumCard>
      )}

      <div className="space-y-3">
        {order.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">No categories yet.</p>
          </PremiumCard>
        ) : (
          order.map((category, i) => (
            <PremiumCard key={category.id} className="p-4">
              {editing === category.id ? (
                <div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      <span className="mb-1 block text-on-surface-variant">Name</span>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-on-surface"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-on-surface-variant">Icon</span>
                      <input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        maxLength={4}
                        className="w-24 rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-on-surface"
                      />
                    </label>
                    <label className="text-sm sm:col-span-2">
                      <span className="mb-1 block text-on-surface-variant">Description</span>
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-surface-container-high px-3 py-2 text-on-surface"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    The slug stays <span className="font-mono">{category.slug}</span>. It is the
                    category&apos;s URL, and changing it would break every link and bookmark
                    pointing at the old one.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => submitEdit(category.id)}
                      disabled={pending || !editName.trim()}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-on-surface-variant hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${category.name} up`}
                        className="rounded px-2 text-on-surface-variant hover:bg-white/5 disabled:opacity-25"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === order.length - 1}
                        aria-label={`Move ${category.name} down`}
                        className="rounded px-2 text-on-surface-variant hover:bg-white/5 disabled:opacity-25"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="w-6 text-right text-sm tabular-nums text-on-surface-variant">{i + 1}</span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <span className="text-2xl">{category.icon || "📚"}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-on-surface">{category.name}</h3>
                      <p className="truncate text-sm text-on-surface-variant">
                        <span className="font-mono text-xs">{category.slug}</span>
                        {category.description ? ` · ${category.description}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary tabular-nums">{category.questionCount}</p>
                      <p className="text-xs text-on-surface-variant">questions</p>
                    </div>
                    <button
                      onClick={() => beginEdit(category)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-on-surface hover:bg-white/5"
                    >
                      Edit
                    </button>
                    {confirmDelete === category.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => submitDelete(category.id)}
                          disabled={pending}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-on-surface-variant hover:bg-white/5"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setConfirmDelete(category.id); setError(null); setNotice(null) }}
                        title={
                          category.questionCount > 0
                            ? `This category holds ${category.questionCount} questions and cannot be deleted until they are moved or removed.`
                            : "Delete this category"
                        }
                        className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </PremiumCard>
          ))
        )}
      </div>
    </div>
  )
}
