import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ────────── Exercise Library ──────────
const EXERCISES = [
  // Push (chest / shoulders / triceps)
  { name: "Barbell Bench Press", category: "Push", muscleGroup: "chest", equipment: "Barbell", defaultSets: 4, defaultReps: "6-8", defaultRest: "2-3 min" },
  { name: "Incline Barbell Bench Press", category: "Push", muscleGroup: "chest", equipment: "Barbell", defaultSets: 4, defaultReps: "8-10", defaultRest: "2 min" },
  { name: "Decline Barbell Bench Press", category: "Push", muscleGroup: "chest", equipment: "Barbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "2 min" },
  { name: "Dumbbell Bench Press", category: "Push", muscleGroup: "chest", equipment: "Dumbbell", defaultSets: 3, defaultReps: "8-12", defaultRest: "90s" },
  { name: "Incline Dumbbell Press", category: "Push", muscleGroup: "chest", equipment: "Dumbbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Dumbbell Fly", category: "Push", muscleGroup: "chest", equipment: "Dumbbell", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Cable Crossover", category: "Push", muscleGroup: "chest", equipment: "Cable", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Pec Deck Machine", category: "Push", muscleGroup: "chest", equipment: "Machine", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Push-Ups", category: "Push", muscleGroup: "chest", equipment: "Bodyweight", defaultSets: 3, defaultReps: "AMRAP", defaultRest: "60s" },
  { name: "Dips", category: "Push", muscleGroup: "chest", equipment: "Bodyweight", defaultSets: 3, defaultReps: "8-12", defaultRest: "90s" },
  { name: "Overhead Barbell Press", category: "Push", muscleGroup: "shoulders", equipment: "Barbell", defaultSets: 4, defaultReps: "6-8", defaultRest: "2 min" },
  { name: "Seated Dumbbell Shoulder Press", category: "Push", muscleGroup: "shoulders", equipment: "Dumbbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Arnold Press", category: "Push", muscleGroup: "shoulders", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "90s" },
  { name: "Lateral Raises", category: "Push", muscleGroup: "shoulders", equipment: "Dumbbell", defaultSets: 4, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Front Raises", category: "Push", muscleGroup: "shoulders", equipment: "Dumbbell", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Cable Lateral Raise", category: "Push", muscleGroup: "shoulders", equipment: "Cable", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Reverse Pec Deck", category: "Push", muscleGroup: "shoulders", equipment: "Machine", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Tricep Rope Pushdown", category: "Push", muscleGroup: "triceps", equipment: "Cable", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Skullcrushers", category: "Push", muscleGroup: "triceps", equipment: "Barbell", defaultSets: 3, defaultReps: "8-12", defaultRest: "90s" },
  { name: "Overhead Tricep Extension", category: "Push", muscleGroup: "triceps", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Close-Grip Bench Press", category: "Push", muscleGroup: "triceps", equipment: "Barbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Tricep Dips", category: "Push", muscleGroup: "triceps", equipment: "Bodyweight", defaultSets: 3, defaultReps: "AMRAP", defaultRest: "60s" },

  // Pull (back / biceps)
  { name: "Deadlift", category: "Pull", muscleGroup: "back", equipment: "Barbell", defaultSets: 3, defaultReps: "5", defaultRest: "3 min" },
  { name: "Romanian Deadlift", category: "Pull", muscleGroup: "hamstrings", equipment: "Barbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "2 min" },
  { name: "Pull-Ups", category: "Pull", muscleGroup: "back", equipment: "Bodyweight", defaultSets: 4, defaultReps: "AMRAP", defaultRest: "2 min" },
  { name: "Chin-Ups", category: "Pull", muscleGroup: "back", equipment: "Bodyweight", defaultSets: 4, defaultReps: "AMRAP", defaultRest: "2 min" },
  { name: "Lat Pulldown", category: "Pull", muscleGroup: "back", equipment: "Cable", defaultSets: 3, defaultReps: "10-12", defaultRest: "90s" },
  { name: "Barbell Row", category: "Pull", muscleGroup: "back", equipment: "Barbell", defaultSets: 4, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Pendlay Row", category: "Pull", muscleGroup: "back", equipment: "Barbell", defaultSets: 4, defaultReps: "5-6", defaultRest: "2 min" },
  { name: "Dumbbell Row", category: "Pull", muscleGroup: "back", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "T-Bar Row", category: "Pull", muscleGroup: "back", equipment: "Machine", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Seated Cable Row", category: "Pull", muscleGroup: "back", equipment: "Cable", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Face Pulls", category: "Pull", muscleGroup: "shoulders", equipment: "Cable", defaultSets: 3, defaultReps: "15-20", defaultRest: "60s" },
  { name: "Shrugs", category: "Pull", muscleGroup: "traps", equipment: "Dumbbell", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Hyperextensions", category: "Pull", muscleGroup: "lower back", equipment: "Bodyweight", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Barbell Curl", category: "Pull", muscleGroup: "biceps", equipment: "Barbell", defaultSets: 3, defaultReps: "8-12", defaultRest: "60s" },
  { name: "Dumbbell Curl", category: "Pull", muscleGroup: "biceps", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Hammer Curl", category: "Pull", muscleGroup: "biceps", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Preacher Curl", category: "Pull", muscleGroup: "biceps", equipment: "Machine", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Cable Curl", category: "Pull", muscleGroup: "biceps", equipment: "Cable", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Concentration Curl", category: "Pull", muscleGroup: "biceps", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },

  // Legs
  { name: "Back Squat", category: "Legs", muscleGroup: "quads", equipment: "Barbell", defaultSets: 4, defaultReps: "6-8", defaultRest: "3 min" },
  { name: "Front Squat", category: "Legs", muscleGroup: "quads", equipment: "Barbell", defaultSets: 4, defaultReps: "6-8", defaultRest: "2-3 min" },
  { name: "Hack Squat", category: "Legs", muscleGroup: "quads", equipment: "Machine", defaultSets: 3, defaultReps: "8-10", defaultRest: "2 min" },
  { name: "Leg Press", category: "Legs", muscleGroup: "quads", equipment: "Machine", defaultSets: 3, defaultReps: "10-12", defaultRest: "2 min" },
  { name: "Bulgarian Split Squat", category: "Legs", muscleGroup: "quads", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10 each leg", defaultRest: "90s" },
  { name: "Walking Lunges", category: "Legs", muscleGroup: "quads", equipment: "Dumbbell", defaultSets: 3, defaultReps: "12 each leg", defaultRest: "90s" },
  { name: "Goblet Squat", category: "Legs", muscleGroup: "quads", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Leg Extension", category: "Legs", muscleGroup: "quads", equipment: "Machine", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Leg Curl", category: "Legs", muscleGroup: "hamstrings", equipment: "Machine", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Stiff-Leg Deadlift", category: "Legs", muscleGroup: "hamstrings", equipment: "Barbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Glute Bridge", category: "Legs", muscleGroup: "glutes", equipment: "Barbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "90s" },
  { name: "Hip Thrust", category: "Legs", muscleGroup: "glutes", equipment: "Barbell", defaultSets: 3, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Cable Kickback", category: "Legs", muscleGroup: "glutes", equipment: "Cable", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Standing Calf Raise", category: "Legs", muscleGroup: "calves", equipment: "Machine", defaultSets: 4, defaultReps: "12-15", defaultRest: "45s" },
  { name: "Seated Calf Raise", category: "Legs", muscleGroup: "calves", equipment: "Machine", defaultSets: 4, defaultReps: "15-20", defaultRest: "45s" },

  // Core
  { name: "Plank", category: "Core", muscleGroup: "abs", equipment: "Bodyweight", defaultSets: 3, defaultReps: "45-60s", defaultRest: "60s" },
  { name: "Side Plank", category: "Core", muscleGroup: "obliques", equipment: "Bodyweight", defaultSets: 3, defaultReps: "30-45s each", defaultRest: "45s" },
  { name: "Crunches", category: "Core", muscleGroup: "abs", equipment: "Bodyweight", defaultSets: 3, defaultReps: "20-25", defaultRest: "45s" },
  { name: "Hanging Leg Raises", category: "Core", muscleGroup: "abs", equipment: "Bodyweight", defaultSets: 3, defaultReps: "10-15", defaultRest: "60s" },
  { name: "Cable Crunch", category: "Core", muscleGroup: "abs", equipment: "Cable", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Russian Twist", category: "Core", muscleGroup: "obliques", equipment: "Bodyweight", defaultSets: 3, defaultReps: "20 total", defaultRest: "45s" },
  { name: "Ab Wheel Rollout", category: "Core", muscleGroup: "abs", equipment: "Bodyweight", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Mountain Climbers", category: "Core", muscleGroup: "abs", equipment: "Bodyweight", defaultSets: 3, defaultReps: "30s", defaultRest: "30s" },

  // Cardio
  { name: "Treadmill Run", category: "Cardio", muscleGroup: "full", equipment: "Machine", defaultSets: 1, defaultReps: "30 min", defaultRest: "—" },
  { name: "Stationary Bike", category: "Cardio", muscleGroup: "full", equipment: "Machine", defaultSets: 1, defaultReps: "30 min", defaultRest: "—" },
  { name: "Elliptical", category: "Cardio", muscleGroup: "full", equipment: "Machine", defaultSets: 1, defaultReps: "20-30 min", defaultRest: "—" },
  { name: "Stair Climber", category: "Cardio", muscleGroup: "full", equipment: "Machine", defaultSets: 1, defaultReps: "20 min", defaultRest: "—" },
  { name: "Rowing Machine", category: "Cardio", muscleGroup: "full", equipment: "Machine", defaultSets: 1, defaultReps: "20 min", defaultRest: "—" },
  { name: "Jump Rope", category: "Cardio", muscleGroup: "full", equipment: "Bodyweight", defaultSets: 5, defaultReps: "2 min", defaultRest: "60s" },
  { name: "HIIT Sprints", category: "Cardio", muscleGroup: "full", equipment: "Bodyweight", defaultSets: 8, defaultReps: "30s on / 30s off", defaultRest: "—" },

  // Olympic / Compound
  { name: "Power Clean", category: "Olympic", muscleGroup: "full", equipment: "Barbell", defaultSets: 5, defaultReps: "3", defaultRest: "2-3 min" },
  { name: "Clean and Jerk", category: "Olympic", muscleGroup: "full", equipment: "Barbell", defaultSets: 5, defaultReps: "2-3", defaultRest: "3 min" },
  { name: "Snatch", category: "Olympic", muscleGroup: "full", equipment: "Barbell", defaultSets: 5, defaultReps: "2-3", defaultRest: "3 min" },
  { name: "Kettlebell Swing", category: "Olympic", muscleGroup: "full", equipment: "Kettlebell", defaultSets: 4, defaultReps: "15-20", defaultRest: "60s" },
  { name: "Turkish Get-Up", category: "Olympic", muscleGroup: "full", equipment: "Kettlebell", defaultSets: 3, defaultReps: "5 each side", defaultRest: "90s" },
  { name: "Burpees", category: "Full Body", muscleGroup: "full", equipment: "Bodyweight", defaultSets: 3, defaultReps: "10-15", defaultRest: "60s" },
  { name: "Thrusters", category: "Full Body", muscleGroup: "full", equipment: "Dumbbell", defaultSets: 3, defaultReps: "10-12", defaultRest: "90s" },
  { name: "Farmer's Walk", category: "Full Body", muscleGroup: "full", equipment: "Dumbbell", defaultSets: 3, defaultReps: "30m", defaultRest: "90s" },
];

// ────────── Food Library (per 100g/100ml/1 piece etc.) ──────────
const FOODS = [
  // Proteins
  { name: "Chicken breast (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Chicken thigh (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 209, protein: 26, carbs: 0, fat: 11 },
  { name: "Beef sirloin (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 206, protein: 29, carbs: 0, fat: 9 },
  { name: "Lean ground beef 95/5 (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 171, protein: 26, carbs: 0, fat: 7 },
  { name: "Salmon (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 208, protein: 22, carbs: 0, fat: 13 },
  { name: "Tuna (canned in water)", category: "Protein", unit: "g", perAmount: 100, calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: "Tilapia (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 129, protein: 26, carbs: 0, fat: 3 },
  { name: "Shrimp (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 99, protein: 24, carbs: 0, fat: 0.3 },
  { name: "Whole egg", category: "Protein", unit: "piece", perAmount: 1, calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
  { name: "Egg white", category: "Protein", unit: "piece", perAmount: 1, calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1 },
  { name: "Whey protein (scoop)", category: "Protein", unit: "scoop", perAmount: 1, calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: "Casein protein (scoop)", category: "Protein", unit: "scoop", perAmount: 1, calories: 110, protein: 24, carbs: 2, fat: 1 },
  { name: "Turkey breast (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 135, protein: 30, carbs: 0, fat: 1 },
  { name: "Lamb (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 294, protein: 25, carbs: 0, fat: 21 },
  { name: "Cod (cooked)", category: "Protein", unit: "g", perAmount: 100, calories: 105, protein: 23, carbs: 0, fat: 1 },
  { name: "Tofu (firm)", category: "Protein", unit: "g", perAmount: 100, calories: 144, protein: 17, carbs: 2.8, fat: 8.7 },

  // Carbs
  { name: "White rice (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Brown rice (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 123, protein: 2.7, carbs: 26, fat: 1 },
  { name: "Basmati rice (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 121, protein: 3, carbs: 25, fat: 0.4 },
  { name: "Oats (dry)", category: "Carbs", unit: "g", perAmount: 100, calories: 379, protein: 13, carbs: 68, fat: 7 },
  { name: "Quinoa (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: "Sweet potato (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 90, protein: 2, carbs: 20, fat: 0.2 },
  { name: "White potato (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "Pasta (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { name: "Whole wheat bread", category: "Carbs", unit: "slice", perAmount: 1, calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: "White bread", category: "Carbs", unit: "slice", perAmount: 1, calories: 75, protein: 2, carbs: 14, fat: 1 },
  { name: "Corn tortilla", category: "Carbs", unit: "piece", perAmount: 1, calories: 50, protein: 1.4, carbs: 11, fat: 0.6 },
  { name: "Rice cake", category: "Carbs", unit: "piece", perAmount: 1, calories: 35, protein: 1, carbs: 7, fat: 0.3 },
  { name: "Couscous (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 112, protein: 3.8, carbs: 23, fat: 0.2 },
  { name: "Bulgur (cooked)", category: "Carbs", unit: "g", perAmount: 100, calories: 83, protein: 3, carbs: 19, fat: 0.2 },

  // Fats
  { name: "Olive oil", category: "Fats", unit: "tbsp", perAmount: 1, calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: "Coconut oil", category: "Fats", unit: "tbsp", perAmount: 1, calories: 117, protein: 0, carbs: 0, fat: 14 },
  { name: "Almonds", category: "Fats", unit: "g", perAmount: 30, calories: 174, protein: 6, carbs: 6, fat: 15 },
  { name: "Cashews", category: "Fats", unit: "g", perAmount: 30, calories: 165, protein: 5, carbs: 9, fat: 13 },
  { name: "Walnuts", category: "Fats", unit: "g", perAmount: 30, calories: 196, protein: 5, carbs: 4, fat: 20 },
  { name: "Peanut butter", category: "Fats", unit: "tbsp", perAmount: 1, calories: 94, protein: 4, carbs: 3, fat: 8 },
  { name: "Almond butter", category: "Fats", unit: "tbsp", perAmount: 1, calories: 98, protein: 3.4, carbs: 3, fat: 9 },
  { name: "Avocado", category: "Fats", unit: "piece", perAmount: 1, calories: 240, protein: 3, carbs: 12, fat: 22 },
  { name: "Chia seeds", category: "Fats", unit: "tbsp", perAmount: 1, calories: 60, protein: 2, carbs: 5, fat: 4 },
  { name: "Flax seeds", category: "Fats", unit: "tbsp", perAmount: 1, calories: 55, protein: 2, carbs: 3, fat: 4 },

  // Vegetables
  { name: "Broccoli (cooked)", category: "Vegetables", unit: "g", perAmount: 100, calories: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  { name: "Spinach (raw)", category: "Vegetables", unit: "g", perAmount: 100, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Carrots (raw)", category: "Vegetables", unit: "g", perAmount: 100, calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: "Bell pepper", category: "Vegetables", unit: "g", perAmount: 100, calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  { name: "Tomato", category: "Vegetables", unit: "g", perAmount: 100, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: "Cucumber", category: "Vegetables", unit: "g", perAmount: 100, calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: "Lettuce", category: "Vegetables", unit: "g", perAmount: 100, calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: "Asparagus (cooked)", category: "Vegetables", unit: "g", perAmount: 100, calories: 22, protein: 2.4, carbs: 4.1, fat: 0.2 },
  { name: "Green beans (cooked)", category: "Vegetables", unit: "g", perAmount: 100, calories: 35, protein: 1.9, carbs: 8, fat: 0.2 },
  { name: "Zucchini (cooked)", category: "Vegetables", unit: "g", perAmount: 100, calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { name: "Cauliflower (cooked)", category: "Vegetables", unit: "g", perAmount: 100, calories: 23, protein: 1.8, carbs: 4, fat: 0.5 },
  { name: "Mushrooms (cooked)", category: "Vegetables", unit: "g", perAmount: 100, calories: 28, protein: 2.2, carbs: 5, fat: 0.5 },

  // Fruits
  { name: "Banana", category: "Fruits", unit: "piece", perAmount: 1, calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Apple", category: "Fruits", unit: "piece", perAmount: 1, calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Orange", category: "Fruits", unit: "piece", perAmount: 1, calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  { name: "Strawberries", category: "Fruits", unit: "g", perAmount: 100, calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { name: "Blueberries", category: "Fruits", unit: "g", perAmount: 100, calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: "Grapes", category: "Fruits", unit: "g", perAmount: 100, calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { name: "Pineapple", category: "Fruits", unit: "g", perAmount: 100, calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { name: "Mango", category: "Fruits", unit: "piece", perAmount: 1, calories: 200, protein: 2.8, carbs: 50, fat: 1.3 },
  { name: "Watermelon", category: "Fruits", unit: "g", perAmount: 100, calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  { name: "Kiwi", category: "Fruits", unit: "piece", perAmount: 1, calories: 42, protein: 0.8, carbs: 10, fat: 0.4 },
  { name: "Dates", category: "Fruits", unit: "piece", perAmount: 1, calories: 23, protein: 0.2, carbs: 6, fat: 0 },

  // Dairy
  { name: "Greek yogurt (plain, low-fat)", category: "Dairy", unit: "g", perAmount: 100, calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Cottage cheese (low-fat)", category: "Dairy", unit: "g", perAmount: 100, calories: 72, protein: 12, carbs: 2.7, fat: 1 },
  { name: "Skim milk", category: "Dairy", unit: "ml", perAmount: 100, calories: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  { name: "Whole milk", category: "Dairy", unit: "ml", perAmount: 100, calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: "Cheddar cheese", category: "Dairy", unit: "g", perAmount: 30, calories: 121, protein: 7, carbs: 0.4, fat: 10 },
  { name: "Mozzarella", category: "Dairy", unit: "g", perAmount: 30, calories: 85, protein: 6, carbs: 0.7, fat: 6.3 },
  { name: "Feta cheese", category: "Dairy", unit: "g", perAmount: 30, calories: 79, protein: 4.3, carbs: 1.2, fat: 6.4 },
  { name: "Butter", category: "Dairy", unit: "tbsp", perAmount: 1, calories: 102, protein: 0.1, carbs: 0, fat: 11.5 },

  // Drinks
  { name: "Black coffee", category: "Drinks", unit: "cup", perAmount: 1, calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  { name: "Green tea", category: "Drinks", unit: "cup", perAmount: 1, calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: "Almond milk (unsweetened)", category: "Drinks", unit: "ml", perAmount: 100, calories: 17, protein: 0.6, carbs: 0.6, fat: 1.5 },
  { name: "Coconut water", category: "Drinks", unit: "ml", perAmount: 100, calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
  { name: "Orange juice", category: "Drinks", unit: "ml", perAmount: 100, calories: 45, protein: 0.7, carbs: 10, fat: 0.2 },

  // Other
  { name: "Honey", category: "Other", unit: "tbsp", perAmount: 1, calories: 64, protein: 0.1, carbs: 17, fat: 0 },
  { name: "Hummus", category: "Other", unit: "tbsp", perAmount: 1, calories: 25, protein: 1.2, carbs: 2, fat: 1.4 },
  { name: "Dark chocolate (85%)", category: "Other", unit: "g", perAmount: 30, calories: 170, protein: 3.6, carbs: 7.5, fat: 14 },
];

async function main() {
  // Wipe all tables in the right order
  await prisma.exercise.deleteMany();
  await prisma.trainingDay.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.mealItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.macroTarget.deleteMany();
  await prisma.dietPlan.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.bodyMeasurement.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.exerciseLibrary.deleteMany();
  await prisma.food.deleteMany();

  // Seed exercise library
  for (const ex of EXERCISES) {
    await prisma.exerciseLibrary.create({ data: ex });
  }
  console.log(`Seeded ${EXERCISES.length} exercises`);

  // Seed food library
  for (const f of FOODS) {
    await prisma.food.create({ data: f });
  }
  console.log(`Seeded ${FOODS.length} foods`);

  // Seed users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);

  await prisma.user.create({
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

  // Seed sample data for the demo client
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

  // Sample diet plan with food-library-linked items
  const chicken = await prisma.food.findFirst({ where: { name: "Chicken breast (cooked)" } });
  const rice = await prisma.food.findFirst({ where: { name: "White rice (cooked)" } });
  const oats = await prisma.food.findFirst({ where: { name: "Oats (dry)" } });
  const banana = await prisma.food.findFirst({ where: { name: "Banana" } });
  const eggs = await prisma.food.findFirst({ where: { name: "Whole egg" } });
  const eggWhite = await prisma.food.findFirst({ where: { name: "Egg white" } });
  const salmon = await prisma.food.findFirst({ where: { name: "Salmon (cooked)" } });
  const sweetPotato = await prisma.food.findFirst({ where: { name: "Sweet potato (cooked)" } });

  await prisma.dietPlan.create({
    data: {
      userId: client.id,
      title: "Cut Phase — Week 4",
      notes: "Stay consistent with timing. Drink 3L water/day. Black coffee allowed in the morning.",
      macros: {
        create: { calories: 2200, protein: 180, carbs: 220, fat: 70 },
      },
      meals: {
        create: [
          {
            name: "Breakfast",
            time: "08:00",
            order: 0,
            items: {
              create: [
                { foodId: oats?.id, quantity: 80, unit: "g", order: 0 },
                { foodId: banana?.id, quantity: 1, unit: "piece", order: 1 },
                { foodId: eggs?.id, quantity: 2, unit: "piece", order: 2 },
                { foodId: eggWhite?.id, quantity: 4, unit: "piece", order: 3 },
              ],
            },
          },
          {
            name: "Lunch",
            time: "13:30",
            order: 1,
            items: {
              create: [
                { foodId: chicken?.id, quantity: 200, unit: "g", order: 0 },
                { foodId: rice?.id, quantity: 250, unit: "g", order: 1 },
              ],
            },
          },
          {
            name: "Dinner",
            time: "19:30",
            order: 2,
            items: {
              create: [
                { foodId: salmon?.id, quantity: 180, unit: "g", order: 0 },
                { foodId: sweetPotato?.id, quantity: 250, unit: "g", order: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  // Sample training program with library-linked exercises
  const benchPress = await prisma.exerciseLibrary.findFirst({ where: { name: "Barbell Bench Press" } });
  const inclineDb = await prisma.exerciseLibrary.findFirst({ where: { name: "Incline Dumbbell Press" } });
  const ohp = await prisma.exerciseLibrary.findFirst({ where: { name: "Overhead Barbell Press" } });
  const lateral = await prisma.exerciseLibrary.findFirst({ where: { name: "Lateral Raises" } });
  const tri = await prisma.exerciseLibrary.findFirst({ where: { name: "Tricep Rope Pushdown" } });

  const dl = await prisma.exerciseLibrary.findFirst({ where: { name: "Deadlift" } });
  const pullup = await prisma.exerciseLibrary.findFirst({ where: { name: "Pull-Ups" } });
  const bbRow = await prisma.exerciseLibrary.findFirst({ where: { name: "Barbell Row" } });
  const facePull = await prisma.exerciseLibrary.findFirst({ where: { name: "Face Pulls" } });
  const hammer = await prisma.exerciseLibrary.findFirst({ where: { name: "Hammer Curl" } });

  const squat = await prisma.exerciseLibrary.findFirst({ where: { name: "Back Squat" } });
  const rdl = await prisma.exerciseLibrary.findFirst({ where: { name: "Romanian Deadlift" } });
  const lunge = await prisma.exerciseLibrary.findFirst({ where: { name: "Walking Lunges" } });
  const legCurl = await prisma.exerciseLibrary.findFirst({ where: { name: "Leg Curl" } });
  const calfRaise = await prisma.exerciseLibrary.findFirst({ where: { name: "Standing Calf Raise" } });

  await prisma.trainingProgram.create({
    data: {
      userId: client.id,
      title: "Push / Pull / Legs — 5 weeks",
      notes: "Warm up 5–10 min before each session. Keep 1–2 RIR on most working sets.",
      startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
      days: {
        create: [
          {
            dayLabel: "Monday — Push",
            order: 0,
            exercises: {
              create: [
                { libraryId: benchPress?.id, name: benchPress!.name, sets: 4, reps: "6-8", rest: "2-3 min", notes: "Pause at chest", order: 0 },
                { libraryId: inclineDb?.id, name: inclineDb!.name, sets: 3, reps: "8-10", rest: "90s", order: 1 },
                { libraryId: ohp?.id, name: ohp!.name, sets: 3, reps: "8-10", rest: "90s", order: 2 },
                { libraryId: lateral?.id, name: lateral!.name, sets: 4, reps: "12-15", rest: "60s", order: 3 },
                { libraryId: tri?.id, name: tri!.name, sets: 3, reps: "12-15", rest: "60s", order: 4 },
              ],
            },
          },
          {
            dayLabel: "Wednesday — Pull",
            order: 1,
            exercises: {
              create: [
                { libraryId: dl?.id, name: dl!.name, sets: 3, reps: "5", rest: "3 min", notes: "Reset each rep", order: 0 },
                { libraryId: pullup?.id, name: pullup!.name, sets: 4, reps: "AMRAP", rest: "2 min", order: 1 },
                { libraryId: bbRow?.id, name: bbRow!.name, sets: 3, reps: "8-10", rest: "90s", order: 2 },
                { libraryId: facePull?.id, name: facePull!.name, sets: 3, reps: "15", rest: "60s", order: 3 },
                { libraryId: hammer?.id, name: hammer!.name, sets: 3, reps: "10-12", rest: "60s", order: 4 },
              ],
            },
          },
          {
            dayLabel: "Friday — Legs",
            order: 2,
            exercises: {
              create: [
                { libraryId: squat?.id, name: squat!.name, sets: 4, reps: "6-8", rest: "3 min", order: 0 },
                { libraryId: rdl?.id, name: rdl!.name, sets: 3, reps: "8-10", rest: "2 min", order: 1 },
                { libraryId: lunge?.id, name: lunge!.name, sets: 3, reps: "12 each leg", rest: "90s", order: 2 },
                { libraryId: legCurl?.id, name: legCurl!.name, sets: 3, reps: "12", rest: "60s", order: 3 },
                { libraryId: calfRaise?.id, name: calfRaise!.name, sets: 4, reps: "15", rest: "45s", order: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded:");
  console.log("  admin → coach@hdcoaching.com / admin123");
  console.log("  client → demo@hdcoaching.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
