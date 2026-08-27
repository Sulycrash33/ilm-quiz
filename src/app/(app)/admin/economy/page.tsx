import { createClient } from '@/lib/supabase/server'
import { EconomyPageClient } from '@/components/admin/EconomyPageClient'
import { getEconomy } from './actions'

export default async function EconomyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Please sign in to access admin.</p></div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Access denied. Admin only.</p></div>
  }

  const result = await getEconomy()

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] px-6">
        <p className="text-center text-error">Could not load the economy: {result.error}</p>
      </div>
    )
  }

  return <EconomyPageClient economy={result.economy} />
}
