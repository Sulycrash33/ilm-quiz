import { createClient } from "@/lib/supabase/server"
import { StorePageClient } from "@/components/store/StorePageClient"

export default async function StorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to visit the store.</p>
      </div>
    )
  }

  const { data: profile } = await supabase.from("profiles").select("coins").eq("id", user.id).single()

  return <StorePageClient initialCoins={profile?.coins ?? 0} />
}
