/**
 * Nutrition scaling, summing, and Daily-Value % helpers.
 * Used by both the admin diet editor (live preview) and the client diet page (totals).
 */

import type { Food } from "@prisma/client";

/** Every nutrition column we care about — names match the Food model exactly. */
export const NUTRIENT_KEYS = [
  // core
  "calories",
  "protein",
  "carbs",
  "fat",
  // extended core
  "netCarbs",
  "fiber",
  "sodium",
  "cholesterol",
  // minerals
  "calcium",
  "iron",
  "potassium",
  "vitaminD",
  "magnesium",
  "phosphorus",
  "zinc",
  "selenium",
  "copper",
  "manganese",
  // vitamins
  "vitaminA",
  "vitaminAIU",
  "vitaminB6",
  "vitaminB12",
  "vitaminC",
  "vitaminE",
  "vitaminK",
  "thiamine",
  "riboflavin",
  "niacin",
  "pantothenicAcid",
  "folate",
  "choline",
  "retinol",
  "alphaCarotene",
  "betaCarotene",
  "lycopene",
  "fluoride",
  "vitaminD2",
  "vitaminD3",
  "vitaminDIU",
  "caffeine",
  "theobromine",
  // sugars
  "sugar",
  "sucrose",
  "glucose",
  "fructose",
  "lactose",
  "maltose",
  "galactose",
  "starch",
  // fat breakdown
  "saturatedFat",
  "monounsaturatedFat",
  "polyunsaturatedFat",
  "transFat",
  // fatty acids
  "omega3",
  "omega6",
  "ala",
  "dha",
  "epa",
  "dpa",
  // amino acids
  "alanine",
  "arginine",
  "asparticAcid",
  "cystine",
  "glutamicAcid",
  "glycine",
  "histidine",
  "hydroxyproline",
  "isoleucine",
  "leucine",
  "lysine",
  "methionine",
  "phenylalanine",
  "proline",
  "serine",
  "threonine",
  "tryptophan",
  "tyrosine",
  "valine",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

/** A scaled or summed nutrition totals object. All values are numbers (0 if unknown). */
export type NutritionTotals = Record<NutrientKey, number>;

/** A "raw" partial nutrition object as it appears on a Food row — some fields may be null. */
export type NutritionSource = Partial<Record<NutrientKey, number | null | undefined>>;

/** FDA Daily Values (2016 reference). Units: g for macros/fats/fiber, mg/μg/IU otherwise. */
export const DAILY_VALUES: Partial<Record<NutrientKey, number>> = {
  calories: 2000,
  fat: 78,
  saturatedFat: 20,
  cholesterol: 300,
  sodium: 2300,
  carbs: 275,
  fiber: 28,
  sugar: 50, // added sugars DV
  protein: 50,
  // Minerals
  calcium: 1300,
  iron: 18,
  potassium: 4700,
  vitaminD: 20,
  magnesium: 420,
  phosphorus: 1250,
  zinc: 11,
  selenium: 55,
  copper: 0.9,
  manganese: 2.3,
  // Vitamins
  vitaminA: 900,
  vitaminB6: 1.7,
  vitaminB12: 2.4,
  vitaminC: 90,
  vitaminE: 15,
  vitaminK: 120,
  thiamine: 1.2,
  riboflavin: 1.3,
  niacin: 16,
  folate: 400,
  choline: 550,
  pantothenicAcid: 5,
};

/** Empty totals — every key initialized to 0. */
export function emptyTotals(): NutritionTotals {
  const out = {} as NutritionTotals;
  for (const k of NUTRIENT_KEYS) out[k] = 0;
  return out;
}

/**
 * Scale every nutrition field of `food` by `quantity / food.perAmount`.
 * Returns numeric totals with 0 for any null/undefined source field.
 */
export function scaleNutrition(food: Food, quantity: number): NutritionTotals {
  const totals = emptyTotals();
  if (!food.perAmount || food.perAmount <= 0) return totals;
  const factor = quantity / food.perAmount;
  if (!isFinite(factor) || factor <= 0) return totals;

  const src = food as unknown as NutritionSource;
  for (const k of NUTRIENT_KEYS) {
    const v = src[k];
    if (typeof v === "number") totals[k] = v * factor;
  }
  return totals;
}

/** Sum an array of NutritionTotals into one. */
export function sumNutrition(items: NutritionTotals[]): NutritionTotals {
  const out = emptyTotals();
  for (const t of items) {
    for (const k of NUTRIENT_KEYS) out[k] += t[k];
  }
  return out;
}

/**
 * Daily Value % as an integer (e.g. 27). Returns null if there is no DV reference
 * for this nutrient, or if the amount is 0/negative.
 */
export function dailyValuePercent(
  nutrient: NutrientKey,
  amount: number
): number | null {
  const dv = DAILY_VALUES[nutrient];
  if (!dv || amount <= 0) return null;
  return Math.round((amount / dv) * 100);
}

/**
 * True if every value in `totals` for the given subset of keys is 0 — used to hide
 * empty sections in the client UI.
 */
export function allZero(totals: NutritionTotals, keys: readonly NutrientKey[]): boolean {
  for (const k of keys) if ((totals[k] ?? 0) > 0) return false;
  return true;
}

/** Format a numeric nutrient amount for display. */
export function fmtNutrient(value: number, decimals = 1): string {
  if (!isFinite(value) || value <= 0) return "0";
  if (value < 0.1) return value.toFixed(2);
  return value.toFixed(decimals);
}

/** Nutrient → unit string for display (g / mg / μg / IU / kcal). */
export const NUTRIENT_UNITS: Record<NutrientKey, string> = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fat: "g",
  netCarbs: "g",
  fiber: "g",
  sodium: "mg",
  cholesterol: "mg",
  calcium: "mg",
  iron: "mg",
  potassium: "mg",
  vitaminD: "μg",
  magnesium: "mg",
  phosphorus: "mg",
  zinc: "mg",
  selenium: "μg",
  copper: "mg",
  manganese: "mg",
  vitaminA: "μg",
  vitaminAIU: "IU",
  vitaminB6: "mg",
  vitaminB12: "μg",
  vitaminC: "mg",
  vitaminE: "mg",
  vitaminK: "μg",
  thiamine: "mg",
  riboflavin: "mg",
  niacin: "mg",
  pantothenicAcid: "mg",
  folate: "μg",
  choline: "mg",
  retinol: "μg",
  alphaCarotene: "μg",
  betaCarotene: "μg",
  lycopene: "μg",
  fluoride: "μg",
  vitaminD2: "μg",
  vitaminD3: "μg",
  vitaminDIU: "IU",
  caffeine: "mg",
  theobromine: "mg",
  sugar: "g",
  sucrose: "g",
  glucose: "g",
  fructose: "g",
  lactose: "g",
  maltose: "g",
  galactose: "g",
  starch: "g",
  saturatedFat: "g",
  monounsaturatedFat: "g",
  polyunsaturatedFat: "g",
  transFat: "g",
  omega3: "g",
  omega6: "g",
  ala: "g",
  dha: "g",
  epa: "g",
  dpa: "g",
  alanine: "g",
  arginine: "g",
  asparticAcid: "g",
  cystine: "g",
  glutamicAcid: "g",
  glycine: "g",
  histidine: "g",
  hydroxyproline: "g",
  isoleucine: "g",
  leucine: "g",
  lysine: "g",
  methionine: "g",
  phenylalanine: "g",
  proline: "g",
  serine: "g",
  threonine: "g",
  tryptophan: "g",
  tyrosine: "g",
  valine: "g",
};

/** Grouped nutrient keys for UI sections. */
export const NUTRIENT_GROUPS = {
  vitaminsMinerals: [
    "alphaCarotene",
    "betaCarotene",
    "caffeine",
    "calcium",
    "choline",
    "copper",
    "fluoride",
    "folate",
    "iron",
    "lycopene",
    "magnesium",
    "manganese",
    "niacin",
    "pantothenicAcid",
    "phosphorus",
    "potassium",
    "retinol",
    "riboflavin",
    "selenium",
    "sodium",
    "theobromine",
    "thiamine",
    "vitaminA",
    "vitaminAIU",
    "vitaminB12",
    "vitaminB6",
    "vitaminC",
    "vitaminD",
    "vitaminDIU",
    "vitaminD2",
    "vitaminD3",
    "vitaminE",
    "vitaminK",
    "zinc",
  ],
  sugars: ["sugar", "sucrose", "glucose", "fructose", "lactose", "maltose", "galactose", "starch"],
  fats: ["saturatedFat", "monounsaturatedFat", "polyunsaturatedFat", "transFat"],
  fattyAcids: ["omega3", "omega6", "ala", "dha", "epa", "dpa"],
  aminoAcids: [
    "alanine",
    "arginine",
    "asparticAcid",
    "cystine",
    "glutamicAcid",
    "glycine",
    "histidine",
    "hydroxyproline",
    "isoleucine",
    "leucine",
    "lysine",
    "methionine",
    "phenylalanine",
    "proline",
    "serine",
    "threonine",
    "tryptophan",
    "tyrosine",
    "valine",
  ],
} as const satisfies Record<string, readonly NutrientKey[]>;
