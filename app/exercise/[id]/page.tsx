import ExerciseScreen from "@/components/exercises/ExerciseScreen";
import { EXERCISES } from "@/lib/content";

// Pre-render every exercise so the app also works as a static (mobile) export.
export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Keyed so moving between exercises always starts fresh.
  return <ExerciseScreen key={id} id={id} />;
}
