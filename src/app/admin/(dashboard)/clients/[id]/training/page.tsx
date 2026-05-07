import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrainingEditor from "./TrainingEditor";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Training editor — Admin" };
export const dynamic = "force-dynamic";

export default async function TrainingEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const [client, t] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, role: true },
    }),
    getDict(),
  ]);
  if (!client || client.role !== "USER") notFound();

  const [program, library] = await Promise.all([
    prisma.trainingProgram.findUnique({
      where: { userId: client.id },
      include: {
        days: {
          orderBy: { order: "asc" },
          include: { exercises: { orderBy: { order: "asc" } } },
        },
      },
    }),
    prisma.exerciseLibrary.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  const initial = program
    ? {
        title: program.title,
        notes: program.notes ?? "",
        startDate: program.startDate ? program.startDate.toISOString().slice(0, 10) : "",
        days: program.days.map((d) => ({
          dayLabel: d.dayLabel,
          exercises: d.exercises.map((e) => ({
            libraryId: e.libraryId,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            rest: e.rest ?? "",
            notes: e.notes ?? "",
          })),
        })),
      }
    : null;

  return (
    <div className="animate-fade-in">
      <Link
        href={`/admin/clients/${client.id}`}
        className="text-sm font-medium text-brand-700 hover:text-brand-600"
      >
        {t.admin.backToClient.replace("{name}", client.name)}
      </Link>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            {t.admin.trainingProgramLabel}
          </p>
          <h1 className="mt-1 h-page">{client.name}</h1>
          <p className="mt-1 text-muted">{t.admin.pickExercises}</p>
        </div>
      </div>
      <TrainingEditor
        clientId={client.id}
        initial={initial}
        library={library.map((l) => ({
          id: l.id,
          name: l.name,
          category: l.category,
          muscleGroup: l.muscleGroup,
          equipment: l.equipment,
          defaultSets: l.defaultSets,
          defaultReps: l.defaultReps,
          defaultRest: l.defaultRest,
        }))}
      />
    </div>
  );
}
