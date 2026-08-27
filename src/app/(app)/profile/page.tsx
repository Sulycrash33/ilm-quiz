import { createClient } from "@/lib/supabase/server"
import { TranslatedNotice } from "@/components/layout/TranslatedNotice"
import { getProfileStats } from "@/lib/profile-stats"
import { ProfilePageClient } from "@/components/profile/ProfilePageClient"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <TranslatedNotice messageKey="signInToViewProfile" />
  }

  const stats = await getProfileStats(user.id)

  // Only to decide whether the profile draws a way in to `/admin`. Every page
  // behind that link re-checks the role on the server, so this is about not
  // showing a door to someone it will not open for.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!stats) {
    return <TranslatedNotice messageKey="couldntLoadProfile" />
  }

  return (
    <ProfilePageClient
      stats={stats}
      email={user.email ?? null}
      joinedAt={user.created_at}
      isAdmin={profile?.role === "admin"}
    />
  )
}
