import { createClient } from '@/lib/supabase/server'
import { CategoriesPageClient } from '@/components/admin/CategoriesPageClient'
import type { AdminCategory } from '@/app/(app)/admin/categories/actions'

export default async function CategoriesPage() {
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

  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, sort_order, questions(count)')
    // Same order the player sees, so a change here is judged in context.
    .order('sort_order')

  // The count decides whether a category can be deleted at all, so it is read
  // here rather than guessed: the database refuses to drop a category any
  // question still points at.
  const categories: AdminCategory[] = (data ?? []).map((c: any) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    description: (c.description ?? null) as string | null,
    icon: (c.icon ?? null) as string | null,
    sortOrder: (c.sort_order ?? 0) as number,
    questionCount: (c.questions?.[0]?.count ?? 0) as number,
  }))

  return <CategoriesPageClient categories={categories} />
}
