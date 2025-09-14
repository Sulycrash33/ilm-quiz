import { QuizCategoryList } from "@/components/game/QuizCategoryList";

export default function QuizPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold font-headline">Choose a Category</h1>
        <p className="text-muted-foreground">Select a topic to test your knowledge.</p>
      </header>
      <QuizCategoryList />
    </div>
  );
}
