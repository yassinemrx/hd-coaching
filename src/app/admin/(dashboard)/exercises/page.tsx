import { prisma } from "@/lib/prisma";
import ExerciseLibraryClient from "./ExerciseLibraryClient";

export const metadata = { title: "Exercise library — Admin" };
export const dynamic = "force-dynamic";

export default async function ExerciseLibraryPage() {
  const exercises = await prisma.exerciseLibrary.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="animate-fade-in">
      <ExerciseLibraryClient
        initial={exercises.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          muscleGroup: e.muscleGroup,
          equipment: e.equipment,
          notes: e.notes,
          defaultSets: e.defaultSets,
          defaultReps: e.defaultReps,
          defaultRest: e.defaultRest,
        }))}
      />
    </div>
  );
}
