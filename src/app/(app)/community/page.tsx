import { getStudyCircles } from "@/app/(app)/community/actions"
import { CommunityPageClient } from "@/components/community/CommunityPageClient"

export default async function CommunityPage() {
  const circles = await getStudyCircles()
  return <CommunityPageClient circles={circles} />
}
