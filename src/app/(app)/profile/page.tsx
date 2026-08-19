import { createClient } from "@/lib/supabase/server"
import { getProfileStats } from "@/lib/profile-stats"
import { ProfilePageClient } from "@/components/profile/ProfilePageClient"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <p>Please sign in to view your profile.</p>
      </div>
    )
  }

  const stats = await getProfileStats(user.id)

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <p>We couldn&apos;t load your profile. Please try again.</p>
      </div>
    )
  }

  return <ProfilePageClient stats={stats} email={user.email ?? null} joinedAt={user.created_at} />
}
