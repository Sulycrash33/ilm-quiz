import { createClient } from "@/lib/supabase/server"
import { HadithsPageClient } from "@/components/admin/HadithsPageClient"
import { listHadiths } from "./actions"

/**
 * Where the daily hadith rotation is filled in.
 *
 * Admin pages are English by convention and exempt from the i18n guard, which
 * is a little pointed on a page whose whole subject is six languages, and is
 * still right: it is a control room, not player-facing copy.
 */
export default async function HadithsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Please sign in to access admin.</p></div>
  }

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Access denied. Admin only.</p></div>
  }

  const list = await listHadiths()

  return (
    <HadithsPageClient
      rows={list.ok ? list.rows : []}
      listError={list.ok ? null : list.error}
    />
  )
}
