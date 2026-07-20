import { createClient } from '@/lib/supabase/server'
import { UsersPageClient } from '@/components/admin/UsersPageClient'

export default async function UsersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><p>Please sign in to access admin.</p></div>
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><p>Access denied. Admin only.</p></div>
  }

  // Fetch real users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, total_xp, streak_count, created_at')
    .order('created_at', { ascending: false })

  return <UsersPageClient users={users ?? []} />
}
