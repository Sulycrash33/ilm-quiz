import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { getModerationQueue, getPendingMentorApplications } from "@/app/(app)/community/mentor-actions"
import { ModerationQueueClient } from "@/components/admin/ModerationQueueClient"

/**
 * The moderation queue.
 *
 * Reviewers as well as admins, matching who `is_moderator()` lets act: the
 * people who already review question drafts are the people who should see a
 * reported forum post. The RPCs behind this page enforce the same check, so a
 * user who reaches the URL directly gets an empty queue and failed actions
 * rather than a working page.
 */
export default async function ModerationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "reviewer" && profile.role !== "admin")) {
    redirect("/home")
  }

  const [queue, applications] = await Promise.all([getModerationQueue(), getPendingMentorApplications()])

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <header className="mb-8 flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-tertiary" aria-hidden="true" />
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Moderation</h1>
      </header>

      <ModerationQueueClient queue={queue} applications={applications} />
    </div>
  )
}
