import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Wipe order: respect FKs (Prisma cascades, but seed twice safely)
  await prisma.exercise.deleteMany();
  await prisma.trainingDay.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.macroTarget.deleteMany();
  await prisma.dietPlan.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.bodyMeasurement.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Coach Admin",
      email: "coach@hdcoaching.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const client = await prisma.user.create({
    data: {
      name: "Demo Client",
      email: "demo@hdcoaching.com",
      passwordHash: clientPassword,
      role: "USER",
    },
  });

  // Weight logs - last 30 days, gentle downward trend
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const base = 82.0 - (29 - i) * 0.07;
    const noise = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 0.25;
    await prisma.weightLog.create({
      data: {
        userId: client.id,
        date: d,
        weightKg: Math.round((base + noise) * 10) / 10,
      },
    });
  }

  // Body measurements - 4 weekly entries
  for (let w = 3; w >= 0; w--) {
    const d = new Date(today);
    d.setDate(d.getDate() - w * 7);
    await prisma.bodyMeasurement.create({
      data: {
        userId: client.id,
        date: d,
        chest: 102 - w * 0.4,
        waist: 88 - w * 0.6,
        hips: 99 - w * 0.3,
        thighs: 60 - w * 0.2,
        arms: 36 + (3 - w) * 0.1,
      },
    });
  }

  // Diet plan
  const diet = await prisma.dietPlan.create({
    data: {
      userId: client.id,
      title: "Cut Phase — Week 4",
      notes:
        "Stay consistent with timing. Drink 3L water/day. Black coffee allowed in the morning.",
      macros: {
        create: {
          calories: 2200,
          protein: 180,
          carbs: 220,
          fat: 70,
        },
      },
      meals: {
        create: [
          {
            name: "Breakfast",
            time: "08:00",
            foods:
              "4 egg whites + 2 whole eggs, 80g oats, 1 banana, 10g almond butter",
            order: 0,
          },
          {
            name: "Mid-morning",
            time: "11:00",
            foods: "Greek yogurt 200g, 30g granola, mixed berries",
            order: 1,
          },
          {
            name: "Lunch",
            time: "13:30",
            foods: "150g grilled chicken, 200g rice, mixed greens, olive oil",
            order: 2,
          },
          {
            name: "Pre-workout",
            time: "16:30",
            foods: "1 rice cake, 1 scoop whey, black coffee",
            order: 3,
          },
          {
            name: "Dinner",
            time: "19:30",
            foods: "180g salmon, 250g sweet potato, asparagus",
            order: 4,
          },
        ],
      },
    },
  });

  // Training program
  await prisma.trainingProgram.create({
    data: {
      userId: client.id,
      title: "Push / Pull / Legs — 5 weeks",
      notes:
        "Warm up 5–10 min before each session. Keep 1–2 RIR on most working sets.",
      startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
      days: {
        create: [
          {
            dayLabel: "Monday — Push",
            order: 0,
            exercises: {
              create: [
                {
                  name: "Barbell bench press",
                  sets: 4,
                  reps: "6-8",
                  rest: "2-3 min",
                  notes: "Pause at chest, full lockout",
                  order: 0,
                },
                {
                  name: "Incline dumbbell press",
                  sets: 3,
                  reps: "8-10",
                  rest: "90s",
                  order: 1,
                },
                {
                  name: "Overhead press",
                  sets: 3,
                  reps: "8-10",
                  rest: "90s",
                  order: 2,
                },
                {
                  name: "Lateral raises",
                  sets: 4,
                  reps: "12-15",
                  rest: "60s",
                  order: 3,
                },
                {
                  name: "Tricep rope pushdown",
                  sets: 3,
                  reps: "12-15",
                  rest: "60s",
                  order: 4,
                },
              ],
            },
          },
          {
            dayLabel: "Wednesday — Pull",
            order: 1,
            exercises: {
              create: [
                {
                  name: "Deadlift",
                  sets: 3,
                  reps: "5",
                  rest: "3 min",
                  notes: "Reset each rep",
                  order: 0,
                },
                {
                  name: "Pull-ups",
                  sets: 4,
                  reps: "AMRAP",
                  rest: "2 min",
                  order: 1,
                },
                {
                  name: "Barbell row",
                  sets: 3,
                  reps: "8-10",
                  rest: "90s",
                  order: 2,
                },
                {
                  name: "Face pulls",
                  sets: 3,
                  reps: "15",
                  rest: "60s",
                  order: 3,
                },
                {
                  name: "Hammer curls",
                  sets: 3,
                  reps: "10-12",
                  rest: "60s",
                  order: 4,
                },
              ],
            },
          },
          {
            dayLabel: "Friday — Legs",
            order: 2,
            exercises: {
              create: [
                {
                  name: "Back squat",
                  sets: 4,
                  reps: "6-8",
                  rest: "3 min",
                  order: 0,
                },
                {
                  name: "Romanian deadlift",
                  sets: 3,
                  reps: "8-10",
                  rest: "2 min",
                  order: 1,
                },
                {
                  name: "Walking lunges",
                  sets: 3,
                  reps: "12 each leg",
                  rest: "90s",
                  order: 2,
                },
                {
                  name: "Leg curl",
                  sets: 3,
                  reps: "12",
                  rest: "60s",
                  order: 3,
                },
                {
                  name: "Standing calf raise",
                  sets: 4,
                  reps: "15",
                  rest: "45s",
                  order: 4,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded:");
  console.log(`  admin → coach@hdcoaching.com / admin123`);
  console.log(`  client → demo@hdcoaching.com / client123`);
  console.log(`  diet plan id: ${diet.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
