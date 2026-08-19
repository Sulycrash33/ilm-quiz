import { createClient } from '@/lib/supabase/server'
import { CategoriesPageClient } from '@/components/admin/CategoriesPageClient'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Please sign in to access admin.</p></div>
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Access denied. Admin only.</p></div>
  }

  // Fetch real categories with question counts
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, questions(count)')
    .order('name')

  return <CategoriesPageClient categories={categories ?? []} />
}
