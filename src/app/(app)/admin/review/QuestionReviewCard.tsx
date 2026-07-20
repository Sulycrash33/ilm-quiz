'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { approveQuestion, rejectQuestion } from './actions';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export type ReviewQuestion = {
  id: string;
  question_text: string;
  choices: string[];
  correct_choice_index: number;
  explanation: string | null;
  citation_reference: string | null;
  madhab_tag: string;
  difficulty: string;
  language: string;
  categoryName: string;
};

export function QuestionReviewCard({ q }: { q: ReviewQuestion }) {
  const [isPending, startTransition] = useTransition();
  const [decided, setDecided] = useState<'approved' | 'rejected' | null>(null);

  const needsVerification = q.citation_reference?.includes('[AI: please verify]') ?? false;

  const [questionText, setQuestionText] = useState(q.question_text);
  const [choices, setChoices] = useState<string[]>(q.choices);
  const [correctIndex, setCorrectIndex] = useState(q.correct_choice_index);
  const [explanation, setExplanation] = useState(q.explanation ?? '');
  const [citation, setCitation] = useState((q.citation_reference ?? '').replace(' [AI: please verify]', ''));
  const [madhab, setMadhab] = useState(q.madhab_tag);

  function handleApprove() {
    startTransition(async () => {
      await approveQuestion(q.id, {
        questionText,
        choices,
        correctChoiceIndex: correctIndex,
        explanation,
        citationReference: citation,
        madhabTag: madhab,
      });
      setDecided('approved');
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectQuestion(q.id);
      setDecided('rejected');
    });
  }

  if (decided) {
    return (
      <Card className="opacity-60">
        <CardContent className="py-4 flex items-center gap-2 text-sm">
          {decided === 'approved' ? (
            <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Published</>
          ) : (
            <><XCircle className="h-4 w-4 text-destructive" /> Rejected</>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{q.categoryName}</Badge>
          <Badge variant="outline">{q.difficulty}</Badge>
          <Badge variant="outline">{q.language}</Badge>
          {needsVerification && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> Needs verification
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Question</Label>
          <Textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={2} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Choices (select the correct one)</Label>
          <div className="space-y-1.5">
            {choices.map((choice, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  className="h-4 w-4 accent-primary"
                />
                <Input
                  value={choice}
                  onChange={e => {
                    const next = [...choices];
                    next[i] = e.target.value;
                    setChoices(next);
                  }}
                  className={correctIndex === i ? 'border-emerald-400' : ''}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Explanation</Label>
          <Textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Citation</Label>
            <Input value={citation} onChange={e => setCitation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Madhab tag</Label>
            <Select value={madhab} onValueChange={setMadhab}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agreed">Agreed (all schools)</SelectItem>
                <SelectItem value="hanafi">Hanafi</SelectItem>
                <SelectItem value="maliki">Maliki</SelectItem>
                <SelectItem value="shafii">Shafi'i</SelectItem>
                <SelectItem value="hanbali">Hanbali</SelectItem>
                <SelectItem value="na">N/A (non-Fiqh)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={handleApprove} disabled={isPending} size="sm" className="gap-1.5">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Approve & publish
          </Button>
          <Button onClick={handleReject} disabled={isPending} size="sm" variant="outline" className="gap-1.5 text-destructive">
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
