import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  DumbbellIcon,
  SaladIcon,
  ChartIcon,
  CameraIcon,
  TargetIcon,
  FlameIcon,
  CheckIcon,
  ChevronRightIcon,
  SparkleIcon,
} from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const isClient = session?.user?.role === "USER";
  const dashHref = isAdmin ? "/admin" : "/dashboard/progress";

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-white shadow-soft">
              <DumbbellIcon size={18} />
            </span>
            <span className="font-display text-base font-bold tracking-tight">HD Coaching</span>
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 sm:inline-block"
            >
              Features
            </a>
            <a
              href="#how"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 sm:inline-block"
            >
              How it works
            </a>
            {session ? (
              <Link href={dashHref} className="btn btn-primary">
                {isAdmin ? "Coach panel" : "My dashboard"}
                <ChevronRightIcon size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Sign in
                </Link>
                <Link href="/admin/login" className="btn btn-primary">
                  Coach login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                <SparkleIcon size={14} /> Personal coaching, reimagined
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl text-balance">
                Train smarter.{" "}
                <span className="bg-brand-gradient bg-clip-text text-transparent">
                  Eat with intent.
                </span>{" "}
                See your progress.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
                HD Coaching is the private platform where your coach builds your training and
                nutrition plan — and you log progress, weight, and photos every day. Simple,
                focused, designed to help you stay on track.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {session ? (
                  <Link href={dashHref} className="btn btn-primary text-base">
                    Open dashboard <ChevronRightIcon size={16} />
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-primary text-base">
                      Client sign-in <ChevronRightIcon size={16} />
                    </Link>
                    <Link href="/admin/login" className="btn btn-secondary text-base">
                      Coach login
                    </Link>
                  </>
                )}
              </div>
              <ul className="mt-8 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-brand-600" /> Daily weight tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-brand-600" /> Custom meal plans
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-brand-600" /> Personalized training
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-brand-600" /> Weekly progress photos
                </li>
              </ul>
            </div>

            {/* Hero visual: stylised dashboard mock */}
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-brand-gradient opacity-20 blur-2xl" />
              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <ChartIcon size={16} />
                    </span>
                    <div>
                      <div className="text-xs text-ink-500">Weight last 30 days</div>
                      <div className="font-display text-sm font-semibold text-ink-900">
                        81.4 kg
                      </div>
                    </div>
                  </div>
                  <span className="chip chip-brand">−2.3 kg</span>
                </div>
                <FakeChart />

                <div className="mt-5 grid grid-cols-4 gap-2">
                  <Stat label="Calories" value="2,180" accent="bg-amber-50 text-amber-700" />
                  <Stat label="Protein" value="178g" accent="bg-blue-50 text-blue-700" />
                  <Stat label="Carbs" value="215g" accent="bg-purple-50 text-purple-700" />
                  <Stat label="Fat" value="68g" accent="bg-pink-50 text-pink-700" />
                </div>

                <div className="mt-5 rounded-lg border border-ink-100 p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-700">
                      <DumbbellIcon size={14} />
                    </span>
                    <div className="text-xs font-semibold text-ink-700">Today — Push</div>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-ink-600">
                    <li className="flex justify-between">
                      <span>Barbell Bench Press</span>
                      <span className="text-ink-400">4 × 6-8</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Incline Dumbbell Press</span>
                      <span className="text-ink-400">3 × 8-10</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Lateral Raises</span>
                      <span className="text-ink-400">4 × 12-15</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Everything in one place
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl text-balance">
            One platform for your coach and you
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Built around what actually drives results — consistency, clear plans, honest tracking.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<ChartIcon size={20} />}
            title="Progress tracking"
            text="Log weight daily, body measurements weekly. Your coach sees real trends, not single data points."
            accent="bg-brand-50 text-brand-700"
          />
          <FeatureCard
            icon={<SaladIcon size={20} />}
            title="Custom diet plans"
            text="Macro targets and meals built from a real food library. Quantities in grams or pieces — no guesswork."
            accent="bg-blue-50 text-blue-700"
          />
          <FeatureCard
            icon={<DumbbellIcon size={20} />}
            title="Training programs"
            text="Day-by-day exercises with sets, reps, rest, and notes. Pulled from a curated exercise library."
            accent="bg-amber-50 text-amber-700"
          />
          <FeatureCard
            icon={<CameraIcon size={20} />}
            title="Weekly photos"
            text="Front, side, back. Side-by-side over time. Visual proof beats the scale on slow weeks."
            accent="bg-purple-50 text-purple-700"
          />
          <FeatureCard
            icon={<TargetIcon size={20} />}
            title="Macro auto-calculation"
            text="Pick a food, set the quantity. Calories, protein, carbs, fat update instantly. Hit your targets."
            accent="bg-pink-50 text-pink-700"
          />
          <FeatureCard
            icon={<FlameIcon size={20} />}
            title="Private &amp; secure"
            text="Each client only sees their own data. Coach access is fully gated. Encrypted in transit."
            accent="bg-red-50 text-red-700"
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-ink-gradient py-16 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
              How it works
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Three steps from sign-up to results
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Your coach handles the planning. You handle the work. The platform tracks the rest.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <StepCard
              num={1}
              title="Get your account"
              text="Your coach creates a private login for you. No public signup — this is invite-only coaching."
            />
            <StepCard
              num={2}
              title="Receive your plan"
              text="A diet plan with daily macros and meals, plus a training program with exercises for each day."
            />
            <StepCard
              num={3}
              title="Track every day"
              text="Log your weight, measurements, and weekly photos. Your coach watches the trend and adjusts."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-glow sm:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Ready to put in the work?
            </h2>
            <p className="mt-3 max-w-xl text-white/90">
              If you already have an account, sign in. Otherwise, contact your coach to be added.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {session ? (
                <Link
                  href={dashHref}
                  className="btn bg-white text-brand-700 hover:bg-ink-50"
                >
                  Open my dashboard <ChevronRightIcon size={16} />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn bg-white text-brand-700 hover:bg-ink-50">
                    Sign in <ChevronRightIcon size={16} />
                  </Link>
                  <Link
                    href="/admin/login"
                    className="btn bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20"
                  >
                    Coach login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-gradient text-white">
              <DumbbellIcon size={14} />
            </span>
            <span className="text-sm font-semibold text-ink-700">HD Coaching</span>
          </div>
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} HD Coaching. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-md bg-ink-50 px-2 py-1.5 text-center">
      <div className={`mx-auto mb-1 grid h-5 w-5 place-items-center rounded ${accent}`}>
        <FlameIcon size={10} />
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-xs font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <article className="group rounded-2xl bg-white p-6 ring-1 ring-ink-200/60 transition-all hover:-translate-y-0.5 hover:shadow-soft hover:ring-brand-200">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>{icon}</span>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p>
    </article>
  );
}

function StepCard({
  num,
  title,
  text,
}: {
  num: number;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/10">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient font-display text-base font-bold shadow-glow">
        {num}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
    </article>
  );
}

function FakeChart() {
  // Stylised SVG chart showing a downward weight trend
  const points = [
    [0, 50],
    [10, 48],
    [20, 52],
    [30, 46],
    [40, 49],
    [50, 44],
    [60, 47],
    [70, 41],
    [80, 39],
    [90, 36],
    [100, 33],
  ];
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
  const fill = `${path} L 100 70 L 0 70 Z`;
  return (
    <div className="mt-3">
      <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="h-32 w-full">
        <defs>
          <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1ba973" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1ba973" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#hero-fill)" />
        <path d={path} fill="none" stroke="#0e885c" strokeWidth="1.4" strokeLinejoin="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" fill="#0e885c" />
        ))}
      </svg>
    </div>
  );
}
