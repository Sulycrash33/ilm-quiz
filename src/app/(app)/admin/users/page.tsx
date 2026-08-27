import { createClient } from '@/lib/supabase/server'
import { UsersPageClient } from '@/components/admin/UsersPageClient'
import { listUsers } from './actions'

/**
 * The register.
 *
 * This page used to select `email` from `profiles`, which has no such column —
 * the address is on `auth.users`. PostgREST rejected the select, the error was
 * never read, and `data ?? []` turned the failure into an empty list. An
 * administrator saw "No users found" over a full register and had no way to
 * tell that apart from an empty game. It now goes through `admin_list_users()`
 * (migration 0031), which can reach `auth.users`, and a failure says so.
 */
export default async function UsersPage() {
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

  const result = await listUsers()

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] px-6">
        <p className="text-center text-error">Could not load the register: {result.error}</p>
      </div>
    )
  }

  return <UsersPageClient users={result.users} />
}
