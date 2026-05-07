import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrainingEditor from "./TrainingEditor";

export const metadata = { title: "Training editor — Admin" };

export default async function TrainingEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, role: true },
  });
  if (!client || client.role !== "USER") notFound();

  const program = await prisma.trainingProgram.findUnique({
    where: { userId: client.id },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });

  const initial = program
    ? {
        title: program.title,
        notes: program.notes ?? "",
        startDate: program.startDate ? program.startDate.toISOString().slice(0, 10) : "",
        days: program.days.map((d) => ({
          dayLabel: d.dayLabel,
          exercises: d.exercises.map((e) => ({
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
    <div className="max-w-4xl">
      <Link
        href={`/admin/clients/${client.id}`}
        className="text-sm text-brand-700 hover:underline"
      >
        ← Back to {client.name}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Training program</h1>
      <p className="mt-1 text-sm text-slate-500">
        Build the weekly program for {client.name}.
      </p>
      <TrainingEditor clientId={client.id} initial={initial} />
    </div>
  );
}
