
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Trophy, Star, Clock, Target, Zap, Award, CheckCircle } from "lucide-react";
import type { Topic, CategoryAchievement, CategoryDetails, Question } from "@/lib/types";
import { QuizView } from "@/components/game/QuizView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RANKS } from "@/lib/constants";

interface CategoryDetailClientProps {
  category: CategoryDetails;
  questions: Question[];
}

export function CategoryDetailClient({ category, questions }: CategoryDetailClientProps) {
  const [showQuiz, setShowQuiz] = useState(false);

  const { completedTopics, totalTopics } = useMemo(() => ({
    completedTopics: category.topics.filter((topic) => topic.completed === topic.questions).length,
    totalTopics: category.topics.length
  }), [category.topics]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };
  
  const handleQuizExit = () => {
    setShowQuiz(false);
  }

  const difficultyBreakdown = useMemo(() => 
    ["Beginner", "Intermediate", "Advanced"].map((difficulty) => {
      const topicsInDifficulty = category.topics.filter((t) => t.difficulty === difficulty);
      const completedInDifficulty = topicsInDifficulty.reduce((sum, t) => sum + t.completed, 0);
      const totalInDifficulty = topicsInDifficulty.reduce((sum, t) => sum + t.questions, 0);
      return {
        difficulty,
        completed: completedInDifficulty,
        total: totalInDifficulty,
        percentage: totalInDifficulty > 0 ? (completedInDifficulty / totalInDifficulty) * 100 : 0
      };
    }), [category.topics]);

  if (showQuiz) {
    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <QuizView 
                questions={questions}
                categoryTitle={category.name}
                onExit={handleQuizExit}
            />
        </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <Button asChild variant="ghost" className="flex items-center gap-2">
            <Link href="/quiz">
                <ArrowLeft className="h-4 w-4" /> Back to Categories
            </Link>
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl" aria-hidden="true">{category.icon}</span>
            <h1 className="text-3xl font-bold text-primary">{category.name}</h1>
          </div>
          <p className="text-muted-foreground">{category.description}</p>
        </div>

        <div className="w-40" /> {/* Spacer */}
      </header>

      <Card className={`mb-8 border-2 ${category.color} shadow-lg`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { value: category.completed, label: "Questions Completed", subtext: `of ${category.questions} total`, color: "text-blue-600" },
              { value: `${category.mastery}%`, label: "Mastery Level", component: <Progress value={category.mastery} className="mt-2 h-2" />, color: "text-purple-600" },
              { value: completedTopics, label: "Topics Mastered", subtext: `of ${totalTopics} topics`, color: "text-green-600" },
              { value: category.xpReward, label: "Total XP Available", subtext: category.estimatedTime, color: "text-yellow-600" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                {stat.subtext && <div className={`text-xs ${stat.color} mt-1`}>{stat.subtext}</div>}
                {stat.component}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="topics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {["topics", "achievements", "progress"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Button size="lg" className="h-16" onClick={handleStartQuiz}>
                    <div className="flex flex-col items-center gap-1">
                      <Play className="h-5 w-5" />
                      <span className="text-sm">Mixed Quiz</span>
                    </div>
                  </Button>
                  <Button size="lg" variant="secondary" className="h-16" onClick={handleStartQuiz}>
                     <div className="flex flex-col items-center gap-1">
                        <Target className="h-5 w-5" />
                        <span className="text-sm">Practice Mode</span>
                      </div>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 border-accent text-accent hover:bg-accent/10 hover:text-accent" onClick={handleStartQuiz}>
                      <div className="flex flex-col items-center gap-1">
                        <Trophy className="h-5 w-5" />
                        <span className="text-sm">Challenge Mode</span>
                      </div>
                  </Button>
                  <Select>
                    <SelectTrigger className="h-16 text-base">
                      <SelectValue placeholder="Select a difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      {RANKS.map((rank) => (
                        <SelectItem key={rank.level} value={rank.title.toLowerCase()}>
                          <div className="flex items-center gap-2">
                            <rank.icon className={`h-4 w-4 ${rank.theme}`} />
                            <span>{rank.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.topics.map((topic) => (
              <Card
                key={topic.id}
                className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  !topic.unlocked ? "opacity-60 cursor-not-allowed bg-muted/50" : "cursor-pointer"
                } ${topic.completed === topic.questions ? "border-green-300 bg-green-50" : "hover:border-accent"}`}
                onClick={() => topic.unlocked && handleStartQuiz()}
                role="button"
                tabIndex={topic.unlocked ? 0 : -1}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg leading-tight">{topic.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {topic.difficulty}
                        </Badge>
                        {topic.completed === topic.questions && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-semibold">{topic.completed}/{topic.questions}</span>
                    </div>
                    <Progress value={(topic.completed / topic.questions) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {Math.round(topic.questions * 10)} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{Math.round(topic.questions / 2)}min
                      </span>
                    </div>
                    {topic.unlocked ? (
                      <Button size="sm">
                        Start
                      </Button>
                    ) : (
                      <Badge variant="outline">
                        Locked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Category Achievements</h2>
            <p className="text-muted-foreground">Unlock special rewards for mastering this category</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`border-2 shadow-lg ${
                  achievement.unlocked
                    ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : ""
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl ${achievement.unlocked ? "" : "grayscale opacity-60"}`} aria-hidden="true">
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${achievement.unlocked ? "text-yellow-800" : ""}`}>
                        {achievement.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.target !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">{achievement.progress}/{achievement.target}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    {achievement.unlocked ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Award className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Learning Progress</h2>
            <p className="text-muted-foreground">Track your journey through this category</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Topic Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.topics.map((topic) => (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{topic.name}</span>
                        <span className="font-semibold">{Math.round((topic.completed / topic.questions) * 100)}%</span>
                      </div>
                      <Progress value={(topic.completed / topic.questions) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-accent/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-accent">Difficulty Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {difficultyBreakdown.map(({ difficulty, completed, total, percentage }) => (
                    <div key={difficulty} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{difficulty}</span>
                        <span className="font-semibold">{completed}/{total}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
