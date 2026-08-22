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

  if (!stats) {
    return <TranslatedNotice messageKey="couldntLoadProfile" />
  }

  return <ProfilePageClient stats={stats} email={user.email ?? null} joinedAt={user.created_at} />
}
