"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumProgress } from "@/components/ui/premium-progress"
import { PremiumModal } from "@/components/ui/premium-modal"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  questionCount: number
  publishedCount: number
  status: "active" | "draft" | "archived"
}

const initialCategories: Category[] = [
  { id: "1", name: "Holy Quran", slug: "holy-quran", description: "Questions about the Holy Quran, its verses, and interpretations", icon: "📖", questionCount: 245, publishedCount: 189, status: "active" },
  { id: "2", name: "Hadith Sciences", slug: "hadith-sciences", description: "Authentic Hadith collections and their scholarly analysis", icon: "📜", questionCount: 189, publishedCount: 156, status: "active" },
  { id: "3", name: "Five Pillars", slug: "five-pillars", description: "The fundamental pillars of Islam", icon: "🕌", questionCount: 98, publishedCount: 87, status: "active" },
  { id: "4", name: "Islamic History", slug: "islamic-history", description: "Major events and figures in Islamic history", icon: "🏛️", questionCount: 134, publishedCount: 98, status: "active" },
  { id: "5", name: "Fiqh", slug: "fiqh", description: "Islamic jurisprudence and rulings", icon: "⚖️", questionCount: 76, publishedCount: 45, status: "active" },
  { id: "6", name: "Arabic Language", slug: "arabic-language", description: "Quranic Arabic and grammar", icon: "🔤", questionCount: 112, publishedCount: 89, status: "active" },
  { id: "7", name: "Seerah", slug: "seerah", description: "The biography of Prophet Muhammad (pbuh)", icon: "🌙", questionCount: 67, publishedCount: 0, status: "draft" },
  { id: "8", name: "Islamic Ethics", slug: "islamic-ethics", description: "Moral teachings and character development", icon: "💎", questionCount: 0, publishedCount: 0, status: "draft" },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", icon: "📚" })

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description, icon: category.icon })
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", icon: "📚" })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: formData.name, description: formData.description, icon: formData.icon }
          : c
      ))
    } else {
      const newCategory: Category = {
        id: String(Date.now()),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        icon: formData.icon,
        questionCount: 0,
        publishedCount: 0,
        status: "draft",
      }
      setCategories(prev => [...prev, newCategory])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: Category["status"]) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Category Management
          </h1>
          <p className="text-on-surface-variant mt-1">
            Create, edit, and organize quiz categories
          </p>
        </div>
        <PremiumButton variant="primary" onClick={handleCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </PremiumButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-primary">{categories.length}</p>
          <p className="text-sm text-on-surface-variant">Total Categories</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-green-400">{categories.filter(c => c.status === "active").length}</p>
          <p className="text-sm text-on-surface-variant">Active</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-tertiary">{categories.reduce((sum, c) => sum + c.questionCount, 0)}</p>
          <p className="text-sm text-on-surface-variant">Total Questions</p>
        </PremiumCard>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <PremiumCard className="p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center text-2xl">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{category.name}</h3>
                      <p className="text-xs text-on-surface-variant">{category.slug}</p>
                    </div>
                  </div>
                  <PremiumBadge 
                    variant={category.status === "active" ? "success" : category.status === "draft" ? "warning" : "secondary"} 
                    size="sm"
                  >
                    {category.status}
                  </PremiumBadge>
                </div>

                <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
                  {category.description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Published</span>
                    <span className="text-on-surface">{category.publishedCount}/{category.questionCount}</span>
                  </div>
                  <PremiumProgress 
                    value={category.publishedCount} 
                    max={category.questionCount || 1} 
                    size="sm" 
                  />
                </div>

                <div className="flex gap-2">
                  <PremiumButton variant="secondary" size="sm" className="flex-1" onClick={() => handleEdit(category)}>
                    Edit
                  </PremiumButton>
                  <PremiumButton variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                    <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create Category"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg border border-white/5 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg border border-white/5 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Category description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {["📖", "📜", "🕌", "🏛️", "⚖️", "🔤", "🌙", "💎", "📚", "🎯", "🧠", "✨"].map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    formData.icon === icon 
                      ? "bg-primary/20 border-2 border-primary" 
                      : "bg-surface-container-high border border-white/5 hover:bg-surface-container-highest"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <PremiumButton variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton variant="primary" fullWidth onClick={handleSave}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </div>
  )
}
