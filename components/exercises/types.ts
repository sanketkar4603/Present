export interface ExerciseProps {
  /** Call when the activity is finished. `summary` is offered for the journal. */
  onDone: (summary?: string) => void;
  /** 0–100, drives the progress bar in the exercise header. */
  setProgress: (pct: number) => void;
}
