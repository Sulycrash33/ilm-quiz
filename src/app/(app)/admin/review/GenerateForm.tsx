'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateDraftQuestions } from './actions';
import { Loader2, Sparkles } from 'lucide-react';

type Category = { id: string; name: string };

export function GenerateForm({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [count, setCount] = useState(5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const category = categories.find(c => c.id === categoryId);
    const formData = new FormData();
    formData.set('categoryId', categoryId);
    formData.set('categoryName', category?.name ?? '');
    formData.set('difficulty', difficulty);
    formData.set('language', language);
    formData.set('count', String(count));

    startTransition(async () => {
      const result = await generateDraftQuestions(formData);
      if (result.ok) {
        setMessage({ type: 'ok', text: `Drafted ${result.draftedCount} question(s) — review them below before they can be published.` });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Draft new candidates (nothing here is ever shown to players until you approve it)
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ha">Hausa</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
              <SelectItem value="ms">Bahasa Malaysia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Count (max 20)</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending || !categoryId}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        {isPending ? 'Drafting…' : 'Draft candidates'}
      </Button>
      {message && (
        <p className={`text-sm ${message.type === 'ok' ? 'text-emerald-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
