"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"

export default function CommunityPage() {
  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Community</h1>
          <p className="text-on-surface-variant">Study circles, forums & mentorship</p>
        </div>
        <div className="w-20" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-10 text-center">
        <PremiumBadge variant="secondary" size="md" className="mb-4">Coming Soon</PremiumBadge>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Community features aren&apos;t live yet</h2>
        <p className="text-on-surface-variant max-w-xl mx-auto">
          Study circles, the discussion forum, and mentorship matching all need real backend support before they can
          show actual groups and members instead of placeholders. Check back once other players are on the platform.
        </p>
      </motion.div>
    </div>
  )
}
