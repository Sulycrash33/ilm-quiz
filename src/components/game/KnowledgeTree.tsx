"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface TreeNode {
  id: string
  name: string
  icon: string
  progress: number
  unlocked: boolean
  children?: TreeNode[]
}

interface KnowledgeTreeProps {
  nodes: TreeNode[]
}

export function KnowledgeTree({ nodes }: KnowledgeTreeProps) {
  return (
    <div className="relative">
      {/* Tree Background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full text-primary/10" viewBox="0 0 400 600">
          <path
            d="M200 50 Q200 150 150 200 Q100 250 100 350 Q100 450 150 500 Q200 550 200 600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <path
            d="M200 50 Q200 150 250 200 Q300 250 300 350 Q300 450 250 500 Q200 550 200 600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      {/* Tree Nodes */}
      <div className="relative z-10 space-y-8">
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex justify-center"
          >
            <Link
              href={node.unlocked ? `/quiz/${node.id}` : "#"}
              className={`
                relative group
                ${!node.unlocked ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {/* Node Circle */}
              <motion.div
                whileHover={node.unlocked ? { scale: 1.1 } : {}}
                whileTap={node.unlocked ? { scale: 0.95 } : {}}
                className={`
                  w-20 h-20 rounded-full
                  flex items-center justify-center
                  ${node.unlocked
                    ? "bg-gradient-to-br from-primary/20 to-primary-container/20 border-2 border-primary shadow-[0_0_20px_rgba(78,222,163,0.3)]"
                    : "bg-surface-container-highest border-2 border-white/10"
                  }
                  transition-all duration-300
                `}
              >
                <span className="text-3xl">{node.icon}</span>
              </motion.div>

              {/* Progress Ring */}
              {node.unlocked && node.progress < 100 && (
                <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-surface-container-highest"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - node.progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Node Label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="font-label-caps text-label-caps text-on-surface whitespace-nowrap">
                  {node.name}
                </p>
                {node.unlocked && (
                  <p className="text-xs text-on-surface-variant">
                    {node.progress}% complete
                  </p>
                )}
              </div>

              {/* Lock Icon */}
              {!node.unlocked && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center border border-white/10">
                  <svg
                    className="w-3 h-3 text-on-surface-variant"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
