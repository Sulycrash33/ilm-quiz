"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, BrainCircuit, Star, ArrowLeft, Clock, Heart, Coins, Lightbulb, Zap, Timer, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AskTheImamDialog } from './AskTheImamDialog';
import StarParticles from './StarParticles';

interface QuizViewProps {
  questions: Question[];
  categoryTitle: string;
  onExit: () => void;
}

interface Lifeline {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
}

const LIFELINES: Lifeline[] = [
    { id: "fifty-fifty", name: "50/50", icon: "⚡", cost: 50, description: "Remove two wrong answers" },
    { id: "ask-imam", name: "Ask Imam", icon: "🧠", cost: 75, description: "Get a helpful hint" },
    { id: "skip", name: "Skip", icon: "⏭️", cost: 25, description: "Skip to next question" },
    { id: "double-points", name: "2x Points", icon: "💎", cost: 100, description: "Double points for this question" },
    { id: "time-boost", name: "Time+", icon: "⏰", cost: 30, description: "Add 15 seconds" },
];

export function QuizView({ questions, categoryTitle, onExit }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showImamDialog, setShowImamDialog] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // New state from quiz engine
  const [highScore, setHighScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(1250);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [streak, setStreak] = useState<number>(0);
  const [usedLifelines, setUsedLifelines] = useState<string[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [doublePoints, setDoublePoints] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  useEffect(() => {
    setHighScore(Number(localStorage.getItem("highScore")) || 0);
    setCoins(Number(localStorage.getItem("coins")) || 1250);
  }, []);

  useEffect(() => {
    localStorage.setItem("highScore", highScore.toString());
    localStorage.setItem("coins", coins.toString());
  }, [highScore, coins]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
        setShowResult(true);
    } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (!currentQuestion) return;
    setIsAnswered(true);
    setLives((prev) => Math.max(0, prev - 1));
    setStreak(0);
    setTimeout(() => {
      if (lives <= 1) {
        setShowResult(true);
      } else if (!isLastQuestion) {
        handleNext()
      } else {
        setShowResult(true)
      }
    }, 2000);
  }, [lives, isLastQuestion, currentQuestion]);

  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || isAnswered || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, showResult, currentQuestion, handleTimeUp]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 30);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setEliminatedOptions([]);
      setDoublePoints(false);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleAnswerSelect = (answer: string | boolean, answerIndex: number) => {
    if (isAnswered || eliminatedOptions.includes(answerIndex)) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    const isCorrect = answer === currentQuestion.answer;
    
    const streakMultiplier = Math.min(Math.floor(streak / 3) + 1, 3);
    const pointsEarned = isCorrect ? (doublePoints ? (currentQuestion.points ?? 10) * 2 : (currentQuestion.points ?? 10)) * streakMultiplier : 0;

    if (isCorrect) {
      setScore(prev => prev + pointsEarned);
      setHighScore(prev => Math.max(prev, score + pointsEarned));
      setCoins(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    } else {
      setLives(prev => Math.max(0, prev - 1));
      setStreak(0);
    }

    setTimeout(() => setShowExplanation(true), 1000);
    setTimeout(() => {
      if ((lives <= 1 && !isCorrect) || isLastQuestion) {
        setShowResult(true);
      } else {
        handleNext();
      }
    }, 4000);
  };
  
  const useLifeline = useCallback((lifelineId: string) => {
      const lifeline = LIFELINES.find((l) => l.id === lifelineId);
      if (!lifeline || usedLifelines.includes(lifelineId) || coins < lifeline.cost || !currentQuestion) return;

      setCoins((prev) => prev - lifeline.cost);
      setUsedLifelines((prev) => [...prev, lifelineId]);

      switch (lifelineId) {
        case "fifty-fifty":
          const correctIndex = currentQuestion.options?.indexOf(currentQuestion.answer as string);
          const wrongAnswers = currentQuestion.options?.map((_, i) => i).filter(i => i !== correctIndex);
          const toEliminate = wrongAnswers?.sort(() => Math.random() - 0.5).slice(0, 2) || [];
          setEliminatedOptions(toEliminate);
          break;
        case "ask-imam":
          setShowImamDialog(true);
          break;
        case "skip":
          handleNext();
          break;
        case "double-points":
          setDoublePoints(true);
          break;
        case "time-boost":
          setTimeLeft((prev) => prev + 15);
          break;
      }
    },
    [coins, currentQuestion, usedLifelines]
  );

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setUsedLifelines([]);
    setShowResult(false);
  };
  
  if (questions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
              <p className="text-muted-foreground">Questions for the "{categoryTitle}" category are being prepared. Please check back later.</p>
              <Button onClick={onExit} className="mt-6">Back to Categories</Button>
          </div>
      )
  }

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 max-w-2xl"
      >
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-accent/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <CardTitle className="text-2xl text-primary">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-secondary p-4 rounded-lg"
                >
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-accent/10 p-4 rounded-lg"
                >
                  <div className="text-2xl font-bold text-accent">{coins}</div>
                  <div className="text-sm text-muted-foreground">Coins</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-blue-100 p-4 rounded-lg"
                >
                  <div className="text-2xl font-bold text-blue-600">{highScore}</div>
                  <div className="text-sm text-blue-500">High Score</div>
                </motion.div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={restartQuiz} className="flex-1">
                Play Again
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onExit}
              >
                Back to Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <Button variant="ghost" onClick={onExit} aria-label="Go back to dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Quiz
            </Button>
            <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
                <div className="flex items-center gap-2" aria-label={`Lives remaining: ${lives}`}>
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">{lives}</span>
                </div>
                <div className="flex items-center gap-2" aria-label={`Coins: ${coins}`}>
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">{coins}</span>
                </div>
                <div className="flex items-center gap-2" aria-label={`Streak: ${streak}`}>
                    <Star className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold">{streak} streak</span>
                </div>
            </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>Score: {score}</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-3" />
        </div>
        
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <StarParticles isEmitting={showParticles} />
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary">{categoryTitle}</Badge>
                     <Badge
                        variant="outline"
                        className={
                          currentQuestion.difficulty === "Beginner"
                            ? "border-green-300 text-green-700"
                            : currentQuestion.difficulty === "Intermediate"
                              ? "border-yellow-300 text-yellow-700"
                              : "border-red-300 text-red-700"
                        }
                      >
                        {currentQuestion.difficulty}
                    </Badge>
                </div>
                 <div className="flex items-center gap-2" aria-label={`Time remaining: ${timeLeft} seconds`}>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={`font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                        {timeLeft}s
                    </span>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-medium leading-relaxed"
              >
                {currentQuestion.text}
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((option, index) => {
                  const isEliminated = eliminatedOptions.includes(index);
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.answer;
                  const showCorrectAnswer = isAnswered && isCorrect;
                  const showWrongAnswer = isAnswered && isSelected && !isCorrect;

                  return (
                    <motion.div
                      key={option}
                      whileHover={{ scale: isAnswered || isEliminated ? 1 : 1.02 }}
                      whileTap={{ scale: isAnswered || isEliminated ? 1 : 0.98 }}
                    >
                      <Button
                        variant="outline"
                        disabled={isAnswered || isEliminated}
                        onClick={() => handleAnswerSelect(option, index)}
                        className={cn(
                          'h-auto p-4 text-left justify-start transition-all duration-300 w-full',
                          isEliminated && "opacity-30 cursor-not-allowed",
                          showCorrectAnswer && 'bg-green-100 border-green-500 text-green-800 hover:bg-green-100',
                          showWrongAnswer && 'bg-red-100 border-red-500 text-red-800 hover:bg-red-100',
                          !isAnswered && !isEliminated && 'hover:bg-secondary hover:border-primary'
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                           <div className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0",
                                showCorrectAnswer ? "bg-green-500 border-green-500 text-white" : "",
                                showWrongAnswer ? "bg-red-500 border-red-500 text-white" : "",
                                !isAnswered ? "border-input" : ""
                            )}>
                               {showCorrectAnswer ? <CheckCircle className="h-4 w-4" /> : showWrongAnswer ? <XCircle className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                           </div>
                           <span className="flex-1 whitespace-normal">{option}</span>
                        </div>
                      </Button>
                    </motion.div>
                  )
              })}
            </div>

            <AnimatePresence>
                {showExplanation && isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-800 mb-1">Explanation</div>
                        <div className="text-blue-700 text-sm leading-relaxed">{currentQuestion.explanation}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Lifelines */}
        <Card className="border-2 border-yellow-200/50">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
                <Zap className="h-5 w-5" />
                Lifelines
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {LIFELINES.map((lifeline) => {
                const isUsed = usedLifelines.includes(lifeline.id);
                const canAfford = coins >= lifeline.cost;

                return (
                    <motion.div
                      key={lifeline.id}
                      whileHover={{ scale: isUsed || !canAfford || isAnswered ? 1 : 1.02 }}
                      whileTap={{ scale: isUsed || !canAfford || isAnswered ? 1 : 0.98 }}
                    >
                    <Button
                        variant="outline"
                        disabled={isUsed || !canAfford || isAnswered}
                        onClick={() => useLifeline(lifeline.id)}
                        className={cn(
                          'h-20 flex-col gap-1 text-xs w-full',
                           isUsed && "opacity-50 cursor-not-allowed",
                           !canAfford && "opacity-60",
                           canAfford && !isUsed && "hover:bg-yellow-50/50 hover:border-accent"
                        )}
                        aria-label={`${lifeline.name}: ${lifeline.description}, costs ${lifeline.cost} coins`}
                        aria-disabled={isUsed || !canAfford || isAnswered}
                    >
                        <span className="text-xl">{lifeline.icon}</span>
                        <span className="font-medium">{lifeline.name}</span>
                        <span className="text-accent">{lifeline.cost} coins</span>
                    </Button>
                    </motion.div>
                );
                })}
            </div>
            </CardContent>
        </Card>
      </div>

      <AskTheImamDialog open={showImamDialog} onOpenChange={setShowImamDialog} question={currentQuestion} />
    </>
  );
}

    