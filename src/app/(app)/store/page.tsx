import { createClient } from "@/lib/supabase/server"
import { TranslatedNotice } from "@/components/layout/TranslatedNotice"
import { getStoreCatalogue } from "@/app/(app)/store/actions"
import { StorePageClient } from "@/components/store/StorePageClient"

export default async function StorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <TranslatedNotice messageKey="signInToVisitStore" />
  }

  // Catalogue and prices come from the database, so what the page shows is what
  // the server charges. Owned quantities are merged in for the "Owned" state.
  const [{ data: profile }, catalogue] = await Promise.all([
    supabase.from("profiles").select("coins").eq("id", user.id).single(),
    getStoreCatalogue(),
  ])

  return <StorePageClient initialCoins={profile?.coins ?? 0} catalogue={catalogue} />
}
