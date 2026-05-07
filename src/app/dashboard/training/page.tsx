import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const metadata = { title: "Training — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const user = await requireClient();
  const program = await prisma.trainingProgram.findUnique({
    where: { userId: user.id },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!program) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">No training program yet</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your coach hasn&apos;t assigned a program. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{program.title}</h1>
        {program.startDate && (
          <p className="mt-1 text-xs text-slate-500">
            Started {format(new Date(program.startDate), "MMM d, yyyy")}
          </p>
        )}
        {program.notes && (
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{program.notes}</p>
        )}
      </header>

      <div className="space-y-3">
        {program.days.map((day) => (
          <details
            key={day.id}
            className="card group [&_summary::-webkit-details-marker]:hidden"
            open
          >
            <summary className="flex cursor-pointer items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{day.dayLabel}</h2>
              <span className="text-xs text-slate-400 group-open:rotate-90 transition-transform">
                ▶
              </span>
            </summary>
            <div className="mt-4 overflow-x-auto rounded-md ring-1 ring-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Exercise</th>
                    <th className="px-4 py-2">Sets</th>
                    <th className="px-4 py-2">Reps</th>
                    <th className="px-4 py-2">Rest</th>
                    <th className="px-4 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {day.exercises.map((ex) => (
                    <tr key={ex.id}>
                      <td className="px-4 py-2 font-medium text-slate-900">{ex.name}</td>
                      <td className="px-4 py-2">{ex.sets}</td>
                      <td className="px-4 py-2">{ex.reps}</td>
                      <td className="px-4 py-2 text-slate-500">{ex.rest || "—"}</td>
                      <td className="px-4 py-2 text-slate-500">{ex.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
