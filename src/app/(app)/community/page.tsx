import { getStudyCircles } from "@/app/(app)/community/actions"
import { getForumViewer } from "@/app/(app)/community/forum-actions"
import { CommunityPageClient } from "@/components/community/CommunityPageClient"

export default async function CommunityPage() {
  const [circles, viewer] = await Promise.all([getStudyCircles(), getForumViewer()])
  return <CommunityPageClient circles={circles} viewer={viewer} />
}
