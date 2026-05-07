import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DumbbellIcon, ChevronDownIcon } from "@/components/Icon";

export const metadata = { title: "Training — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const user = await requireClient();
  const program = await prisma.trainingProgram.findUnique({
    where: { userId: user.id },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { library: true },
          },
        },
      },
    },
  });

  if (!program) {
    return (
      <div className="empty-state">
        <DumbbellIcon size={28} className="text-ink-300" />
        <p className="mt-3 font-medium text-ink-700">No training program yet</p>
        <p className="mt-1 text-muted">Your coach hasn&apos;t assigned a program. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Your program</p>
        <h1 className="mt-1 h-page">{program.title}</h1>
        {program.startDate && (
          <p className="mt-1 text-xs text-ink-500">
            Started {format(new Date(program.startDate), "MMM d, yyyy")}
          </p>
        )}
        {program.notes && (
          <p className="mt-2 whitespace-pre-line text-sm text-ink-600">{program.notes}</p>
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
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <DumbbellIcon size={18} />
                </span>
                <h2 className="text-base font-semibold text-ink-900">{day.dayLabel}</h2>
                <span className="chip">{day.exercises.length} exercises</span>
              </div>
              <ChevronDownIcon size={18} className="text-ink-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-2">
              {day.exercises.map((ex) => (
                <article
                  key={ex.id}
                  className="rounded-lg border border-ink-100 bg-ink-50/40 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink-900">{ex.name}</h3>
                      {ex.library && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {ex.library.muscleGroup && (
                            <span className="chip chip-brand">{ex.library.muscleGroup}</span>
                          )}
                          {ex.library.equipment && <span className="chip">{ex.library.equipment}</span>}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <Stat label="Sets" value={ex.sets} />
                      <Stat label="Reps" value={ex.reps} />
                      <Stat label="Rest" value={ex.rest || "—"} />
                    </div>
                  </div>
                  {ex.notes && (
                    <p className="mt-2 text-xs text-ink-500">{ex.notes}</p>
                  )}
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-white px-2 py-1 ring-1 ring-ink-100">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}
