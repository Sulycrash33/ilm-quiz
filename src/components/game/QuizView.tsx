"use client";

import { useState, useMemo } from 'react';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, BrainCircuit } from 'lucide-react';
import { AskTheImamDialog } from './AskTheImamDialog';
import StarParticles from './StarParticles';

interface QuizViewProps {
  questions: Question[];
  categoryTitle: string;
}

export function QuizView({ questions, categoryTitle }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showImamDialog, setShowImamDialog] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = useMemo(() => {
    if (!isAnswered) return false;
    return selectedAnswer === currentQuestion.answer;
  }, [isAnswered, selectedAnswer, currentQuestion]);

  const handleAnswer = (answer: string | boolean) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === currentQuestion.answer) {
      setScore(score + 10);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 100);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // End of quiz
      console.log('Quiz Finished! Score:', score);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };
  
  if (questions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
              <p className="text-muted-foreground">Questions for the "{categoryTitle}" category are being prepared. Please check back later.</p>
              <Button onClick={() => window.history.back()} className="mt-6">Back to Categories</Button>
          </div>
      )
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl">Your final score is</p>
          <p className="text-6xl font-bold text-primary my-4">{score}</p>
          <p className="text-muted-foreground">You answered {score / 10} out of {questions.length} questions correctly.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestart} className="w-full">Play Again</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-bold text-primary truncate">{categoryTitle}</h1>
            <div className="text-right">
                <p className="text-sm font-semibold text-muted-foreground">Score</p>
                <p className="font-bold text-primary">{score}</p>
            </div>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        <Card className="relative overflow-hidden">
          <StarParticles isEmitting={showParticles} />
          <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <CardTitle className="text-2xl font-headline">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={cn(
                  'w-full justify-start h-auto py-3 text-left whitespace-normal',
                  isAnswered && (
                    option === currentQuestion.answer 
                    ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200' 
                    : (option === selectedAnswer ? 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200' : 'bg-muted/50')
                  )
                )}
                variant="outline"
              >
                {option}
              </Button>
            ))}
            {currentQuestion.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((option) => (
                  <Button
                    key={String(option)}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={cn(
                      'h-16 text-lg',
                      isAnswered && (
                        option === currentQuestion.answer
                          ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
                          : (option === selectedAnswer ? 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200' : 'bg-muted/50')
                      )
                    )}
                    variant="outline"
                  >
                    {String(option)}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isAnswered && (
          <Card className={cn("border-2", isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {isCorrect ? <CheckCircle className="h-6 w-6 text-green-500 mt-1" /> : <AlertCircle className="h-6 w-6 text-red-500 mt-1" />}
                <div>
                  <h3 className={cn("font-bold text-lg", isCorrect ? "text-green-700" : "text-red-700")}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </h3>
                  <p className={cn("text-sm", isCorrect ? "text-green-600" : "text-red-600")}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 space-y-2">
         <Button onClick={() => setShowImamDialog(true)} variant="secondary" className="w-full h-12" disabled={isAnswered}>
              <BrainCircuit className="mr-2 h-5 w-5"/>
              Ask the Imam
        </Button>
        {isAnswered && (
          <Button onClick={handleNext} className="w-full h-12 text-lg">
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
      <AskTheImamDialog open={showImamDialog} onOpenChange={setShowImamDialog} question={currentQuestion} />
    </>
  );
}
