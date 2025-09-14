"use client"

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Star, Clock, Target, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES as KNOWLEDGE_CATEGORIES, CATEGORY_DETAILS } from "@/lib/constants";
import type { Category as CategoryType, CategoryDetails } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";


// Reusable Category Card Component
interface CategoryCardProps {
  category: CategoryType;
  details: CategoryDetails;
}

function CategoryCard({ category, details }: CategoryCardProps) {
  const router = useRouter();

  const handleSelect = (slug: string, unlocked: boolean) => {
    if (unlocked) {
      router.push(`/quiz/${slug}`);
    }
  };

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card
        className={`h-full border-2 shadow-lg transition-all duration-300 ${details.color} ${
          details.unlocked ? "hover:shadow-2xl cursor-pointer" : "opacity-60 cursor-not-allowed"
        }`}
        onClick={() => handleSelect(category.id, details.unlocked)}
        onKeyDown={(e) => e.key === "Enter" && handleSelect(category.id, details.unlocked)}
        tabIndex={details.unlocked ? 0 : -1}
        role="button"
        aria-label={`Quiz category: ${category.title}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
               <div className={`text-4xl p-2 rounded-full ${details.unlocked ? 'bg-background/50' : 'bg-muted'}`} aria-hidden="true">
                <category.icon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">{category.title}</CardTitle>
                 {details.mastery >= 80 && (
                  <Badge className="mt-2 text-xs bg-yellow-100 text-yellow-700">
                    <Crown className="h-3 w-3 mr-1" />
                    Mastered
                  </Badge>
                )}
              </div>
            </div>
            {!details.unlocked && <Lock className="h-5 w-5 text-muted-foreground" aria-label="Category locked" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 flex flex-col justify-between h-full pb-6">
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-semibold" aria-label={`Completed ${details.completed} of ${details.questions} questions`}>
                  {details.completed}/{details.questions}
                </span>
              </div>
              <Progress
                value={(details.completed / details.questions) * 100}
                className="h-2"
                aria-label={`Progress: ${((details.completed / details.questions) * 100).toFixed(0)}%`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" aria-hidden="true" />
                  <span aria-label="Experience points">{details.xpReward} XP</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span aria-label="Estimated time">{details.estimatedTime}</span>
                </span>
              </div>
               <Button
                size="sm"
                disabled={!details.unlocked}
                className={`${
                  details.unlocked
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted cursor-not-allowed"
                } text-primary-foreground transition-colors duration-200`}
                aria-label={details.unlocked ? `Start ${category.title} quiz` : `${category.title} quiz locked`}
              >
                {details.unlocked ? "Start" : "Locked"}
              </Button>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


function CategorySkeleton() {
  return (
    <Card className="border-2 shadow-lg animate-pulse">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function KnowledgeCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "Beginner" | "Intermediate" | "Advanced" | "All Levels">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Shorter delay
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = useMemo(() => {
    return KNOWLEDGE_CATEGORIES.filter((category) => {
      const details = CATEGORY_DETAILS[category.id];
      if (!details) return false;
      const matchesSearch =
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "all" || details.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [searchTerm, selectedDifficulty]);

  const totalQuestions = useMemo(() => Object.values(CATEGORY_DETAILS).reduce((sum, cat) => sum + cat.questions, 0), []);
  const totalCompleted = useMemo(() => Object.values(CATEGORY_DETAILS).reduce((sum, cat) => sum + cat.completed, 0), []);
  const unlockedCount = useMemo(() => Object.values(CATEGORY_DETAILS).filter(cat => cat.unlocked).length, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <Button asChild variant="ghost">
          <Link href="/home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Knowledge Categories</h1>
          <p className="text-muted-foreground">Explore {KNOWLEDGE_CATEGORIES.length} areas of Islamic knowledge</p>
        </div>

        <div className="w-40" />
      </header>

      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{unlockedCount}</div>
              <div className="text-sm text-muted-foreground">Categories Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalCompleted}</div>
              <div className="text-sm text-muted-foreground">Questions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">
                {Object.values(CATEGORY_DETAILS).filter((cat) => cat.mastery >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Mastered Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            onChange={handleSearchChange}
            className="pl-10"
            aria-label="Search knowledge categories"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["all", "Beginner", "Intermediate", "Advanced", "All Levels"] as const).map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(difficulty)}
              aria-pressed={selectedDifficulty === difficulty}
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading
            ? Array(6).fill(0).map((_, index) => <CategorySkeleton key={index} />)
            : filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  details={CATEGORY_DETAILS[category.id]}
                />
              ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
