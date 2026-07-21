"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { QuizQuestion, GradeResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Star, ArrowLeft, Clock, Heart, Coins, Lightbulb, Zap, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AskTheImamDialog } from './AskTheImamDialog';
import StarParticles from './StarParticles';
import { useProfile } from '@/hooks/use-profile';
import { useLanguage } from '@/contexts/LanguageContext';
import { DIFFICULTY_STYLES } from '@/lib/design-tokens';
import { submitAnswer, fiftyFifty } from '@/app/(app)/quiz/actions';

interface QuizViewProps { questions: QuizQuestion[]; categoryTitle: string; onExit: () => void; }
interface Lifeline { id: string; name: string; icon: string; cost: number; description: string; }


export function QuizView({ questions, categoryTitle, onExit }: QuizViewProps) {
  const { t, dir } = useLanguage();
  const LIFELINES: Lifeline[] = [
    { id: 'fifty-fifty', name: t('lifelineFiftyFifty'), icon: '⚡', cost: 50, description: t('lifelineFiftyFiftyDesc') },
    { id: 'ask-imam', name: t('lifelineAskImam'), icon: '🧠', cost: 75, description: t('lifelineAskImamDesc') },
    { id: 'skip', name: t('lifelineSkip'), icon: '⏭️', cost: 25, description: t('lifelineSkipDesc') },
    { id: 'double-points', name: t('lifelineDoublePoints'), icon: '💎', cost: 100, description: t('lifelineDoublePointsDesc') },
    { id: 'time-boost', name: t('lifelineTimeBoost'), icon: '⏰', cost: 30, description: t('lifelineTimeBoostDesc') },
  ];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [grade, setGrade] = useState<(GradeResult & { streakMultiplier?: number }) | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [showImamDialog, setShowImamDialog] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [usedLifelines, setUsedLifelines] = useState<string[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [doublePoints, setDoublePoints] = useState(false);
  const [lastLifelineUsed, setLastLifelineUsed] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const questionStartedAt = useRef(Date.now());
  const { profile } = useProfile();

  useEffect(() => {
    if (profile) {
      setHighScore(profile.highScore);
      setCoins(profile.coins);
    }
  }, [profile]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const handleNext = useCallback(() => isLastQuestion ? setShowResult(true) : setCurrentQuestionIndex((i) => i + 1), [isLastQuestion]);
  const handleTimeUp = useCallback(() => {
    if (!currentQuestion || isAnswered) return;
    setIsAnswered(true); setLives((prev) => Math.max(0, prev - 1)); setStreak(0);
    setTimeout(() => (lives <= 1 ? setShowResult(true) : handleNext()), 1200);
  }, [lives, currentQuestion, handleNext, isAnswered]);

  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || isAnswered || showResult) return;
    const timer = setInterval(() => setTimeLeft((prev) => { if (prev <= 1) { handleTimeUp(); return 0; } return prev - 1; }), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, showResult, currentQuestion, handleTimeUp]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 30); setIsAnswered(false); setSelectedIndex(null); setGrade(null);
      setShowExplanation(false); setEliminatedOptions([]); setDoublePoints(false); setUsedHint(false); setLastLifelineUsed(null); questionStartedAt.current = Date.now();
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (isAnswered || isGrading || eliminatedOptions.includes(answerIndex) || !currentQuestion) return;
    setSelectedIndex(answerIndex); setIsAnswered(true); setIsGrading(true);
    try {
      const result = await submitAnswer(currentQuestion.id, answerIndex, { usedHint, responseTimeMs: Date.now() - questionStartedAt.current, doublePoints, lifelineUsed: lastLifelineUsed ?? undefined });
      setLastLifelineUsed(null);
      setGrade(result); setIsGrading(false);
      const pointsEarned = result.correct ? result.xpEarned : 0;
      if (result.correct) {
        setScore((prev) => prev + pointsEarned); setHighScore((prev) => Math.max(prev, score + pointsEarned)); setCoins((prev) => prev + pointsEarned);
        setStreak((prev) => prev + 1); setShowParticles(true); setTimeout(() => setShowParticles(false), 1000);
      } else { setLives((prev) => Math.max(0, prev - 1)); setStreak(0); }
      setTimeout(() => setShowExplanation(true), 700);
      setTimeout(() => (!result.correct && lives <= 1) || isLastQuestion ? setShowResult(true) : handleNext(), 3000);
    } catch {
      setIsAnswered(false); setSelectedIndex(null); setIsGrading(false);
    }
  };

  const useLifeline = useCallback(async (lifelineId: string) => {
    const lifeline = LIFELINES.find((l) => l.id === lifelineId);
    if (!lifeline || usedLifelines.includes(lifelineId) || coins < lifeline.cost || !currentQuestion || isAnswered) return;
    setUsedLifelines((prev) => [...prev, lifelineId]);
    if (lifelineId === 'fifty-fifty') { try { setEliminatedOptions(await fiftyFifty(currentQuestion.id)); } catch { /* no-op */ } }
    if (lifelineId === 'ask-imam') { setUsedHint(true); setShowImamDialog(true); }
    if (lifelineId === 'skip') handleNext();
    if (lifelineId === 'double-points') setDoublePoints(true);
    setLastLifelineUsed(lifelineId);
    if (lifelineId === 'time-boost') setTimeLeft((prev) => prev + 15);
  }, [coins, currentQuestion, usedLifelines, handleNext, isAnswered]);

  const restartQuiz = () => { setCurrentQuestionIndex(0); setScore(0); setLives(3); setStreak(0); setUsedLifelines([]); setShowResult(false); };
  if (questions.length === 0) return <div dir={dir} className="flex flex-col items-center justify-center h-full text-center p-8"><h2 className="text-2xl font-bold mb-2">{t('comingSoon')}</h2><p className="text-muted-foreground">{t('questionsBeingPrepared', { category: categoryTitle })}</p><Button onClick={onExit} className="mt-6">{t('backToCategories')}</Button></div>;
  if (showResult) return <motion.div dir={dir} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 py-6 max-w-2xl"><Card className="border-2 border-primary/20 shadow-xl"><CardHeader className="text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🏆</motion.div><CardTitle className="text-2xl text-primary">{t('quizComplete')}</CardTitle></CardHeader><CardContent className="pt-6 space-y-6"><div className="grid grid-cols-3 gap-4 text-center"><div className="bg-secondary p-4 rounded-lg"><div className="text-2xl font-bold text-primary">{score}</div><div className="text-sm text-muted-foreground">{t('xpThisRound')}</div></div><div className="bg-accent/10 p-4 rounded-lg"><div className="text-2xl font-bold text-accent">{coins}</div><div className="text-sm text-muted-foreground">{t('coinsWord')}</div></div><div className="bg-primary/10 p-4 rounded-lg"><div className="text-2xl font-bold text-primary">{highScore}</div><div className="text-sm text-primary/80">{t('bestTotal')}</div></div></div><div className="flex gap-4"><Button onClick={restartQuiz} className="flex-1">{t('playAgain')}</Button><Button variant="outline" className="flex-1" onClick={onExit}>{t('backToCategories')}</Button></div></CardContent></Card></motion.div>;
  if (!currentQuestion) return <div dir={dir} className="flex flex-col items-center justify-center h-full text-center p-8"><h2 className="text-2xl font-bold mb-2">{t('couldNotLoadQuestion')}</h2><Button onClick={onExit} className="mt-6">{t('backToCategories')}</Button></div>;
  return <div dir={dir}><div className="space-y-4">
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
      <Button variant="ghost" onClick={onExit}><ArrowLeft className="h-4 w-4 mr-2" />{t('exitQuiz')}</Button>
      <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
        <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" /><span>{lives}</span></div>
        <div className="flex items-center gap-2"><Coins className="h-5 w-5 text-accent" /><span>{coins}</span></div>
        <div className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /><span>{streak} {t('streakWord')}</span></div>
      </div>
    </div>
    <div>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}</span>
        <span>{t('roundXp')}: {score}</span>
      </div>
      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-3" />
    </div>
    <Card className="relative overflow-hidden border-2 border-primary/20">
      <StarParticles isEmitting={showParticles} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{categoryTitle}</Badge>
            <Badge variant="outline" className={currentQuestion.difficulty === 'Beginner' ? `${DIFFICULTY_STYLES.easy.border} ${DIFFICULTY_STYLES.easy.text}` : currentQuestion.difficulty === 'Intermediate' ? `${DIFFICULTY_STYLES.medium.border} ${DIFFICULTY_STYLES.medium.text}` : `${DIFFICULTY_STYLES.hard.border} ${DIFFICULTY_STYLES.hard.text}`}>{currentQuestion.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className={timeLeft <= 10 ? 'font-bold text-destructive animate-pulse' : 'font-bold'}>{timeLeft}s</span></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-medium leading-relaxed">{currentQuestion.text}</motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => {
            const isEliminated = eliminatedOptions.includes(index);
            const isSelected = selectedIndex === index;
            const showCorrectAnswer = isAnswered && grade !== null && index === grade.correctIndex;
            const showWrongAnswer = isAnswered && isSelected && grade !== null && index !== grade.correctIndex;
            return <motion.div key={`${index}-${option}`} whileHover={{ scale: isAnswered || isEliminated ? 1 : 1.02 }} whileTap={{ scale: isAnswered || isEliminated ? 1 : .98 }}>
              <Button variant="outline" disabled={isAnswered || isEliminated} onClick={() => handleAnswerSelect(index)} className={cn('h-auto p-4 text-left justify-start transition-all duration-300 w-full', isEliminated && 'opacity-30 cursor-not-allowed', showCorrectAnswer && 'bg-emerald-400/10 border-emerald-400 text-emerald-400 hover:bg-emerald-400/10', showWrongAnswer && 'bg-destructive/10 border-destructive text-destructive hover:bg-destructive/10', !isAnswered && !isEliminated && 'hover:bg-secondary hover:border-primary')}>
                <div className="flex items-center gap-3 w-full">
                  <div className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0', showCorrectAnswer ? 'bg-emerald-400 border-emerald-400 text-emerald-400-foreground' : '', showWrongAnswer ? 'bg-destructive border-destructive text-destructive-foreground' : '', !isAnswered ? 'border-input' : '')}>
                    {showCorrectAnswer ? <CheckCircle className="h-4 w-4" /> : showWrongAnswer ? <XCircle className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 whitespace-normal">{option}</span>
                </div>
              </Button>
            </motion.div>;
          })}
        </div>
        <AnimatePresence>
          {showExplanation && isAnswered && grade && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-400 mb-1">{t('whyItsRight')}</div>
                <div className="text-blue-400/90 text-sm leading-relaxed">{grade.explanation}</div>
                {grade.citation && <div className="text-blue-400/70 text-xs mt-2 italic">{t('sourceLabel')}: {grade.citation}</div>}
                {grade.streakMultiplier && grade.streakMultiplier > 1 && <div className="text-primary text-xs mt-2 font-semibold">{t('streakBonus', { multiplier: grade.streakMultiplier })}</div>}
              </div>
            </div>
          </motion.div>}
        </AnimatePresence>
      </CardContent>
    </Card>
    <Card className="border-2 border-accent/30">
      <CardHeader><CardTitle className="flex items-center gap-2 text-accent"><Zap className="h-5 w-5" />{t('lifelines')}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LIFELINES.map((lifeline) => {
            const isUsed = usedLifelines.includes(lifeline.id);
            const canAfford = coins >= lifeline.cost;
            return <Button key={lifeline.id} variant="outline" disabled={isUsed || !canAfford || isAnswered} onClick={() => useLifeline(lifeline.id)} className={cn('h-20 flex-col gap-1 text-xs w-full', isUsed && 'opacity-50', !canAfford && 'opacity-60')}>
              <span className="text-xl">{lifeline.icon}</span>
              <span className="font-medium">{lifeline.name}</span>
              <span className="text-accent">{lifeline.cost} {t('coinsWord').toLowerCase()}</span>
            </Button>;
          })}
        </div>
      </CardContent>
    </Card>
  </div><AskTheImamDialog open={showImamDialog} onOpenChange={setShowImamDialog} question={currentQuestion} /></div>;
}
