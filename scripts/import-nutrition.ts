/**
 * Backfill detailed nutrition data for every food in the DB by querying USDA
 * FoodData Central (https://fdc.nal.usda.gov/).
 *
 * Usage (run on the server, after schema migration):
 *   USDA_API_KEY=... npx tsx scripts/import-nutrition.ts
 *
 * Get a free key (60 s, no card): https://api.data.gov/signup/
 * The DEMO_KEY can be used but is rate-limited to 30 req/hr — too slow for ~70 foods.
 *
 * For each food in the DB, the script:
 *   1. Searches USDA for the food name (Foundation + SR Legacy preferred)
 *   2. Takes the first match
 *   3. Maps USDA's nutrient list to our schema fields
 *   4. Writes the values into the food row (skips fields already filled out)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
const SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

if (API_KEY === "DEMO_KEY") {
  console.warn(
    "⚠  Using DEMO_KEY — limited to 30 requests/hour. Set USDA_API_KEY in .env for full speed."
  );
}

/** USDA nutrient names → our Food column names. */
const NUTRIENT_MAP: Record<string, string> = {
  // Core (kept here for safety; existing values won't be overwritten unless null)
  Energy: "calories",
  "Energy (Atwater General Factors)": "calories",
  Protein: "protein",
  "Carbohydrate, by difference": "carbs",
  "Total lipid (fat)": "fat",
  // Extended core
  "Fiber, total dietary": "fiber",
  "Sodium, Na": "sodium",
  Cholesterol: "cholesterol",
  // Minerals
  "Calcium, Ca": "calcium",
  "Iron, Fe": "iron",
  "Potassium, K": "potassium",
  "Magnesium, Mg": "magnesium",
  "Phosphorus, P": "phosphorus",
  "Zinc, Zn": "zinc",
  "Selenium, Se": "selenium",
  "Copper, Cu": "copper",
  "Manganese, Mn": "manganese",
  "Fluoride, F": "fluoride",
  // Vitamins
  "Vitamin D (D2 + D3)": "vitaminD",
  "Vitamin D (D2 + D3), International Units": "vitaminDIU",
  "Vitamin D2 (ergocalciferol)": "vitaminD2",
  "Vitamin D3 (cholecalciferol)": "vitaminD3",
  "Vitamin A, RAE": "vitaminA",
  "Vitamin A, IU": "vitaminAIU",
  "Vitamin B-6": "vitaminB6",
  "Vitamin B-12": "vitaminB12",
  "Vitamin C, total ascorbic acid": "vitaminC",
  "Vitamin E (alpha-tocopherol)": "vitaminE",
  "Vitamin K (phylloquinone)": "vitaminK",
  Thiamin: "thiamine",
  Riboflavin: "riboflavin",
  Niacin: "niacin",
  "Pantothenic acid": "pantothenicAcid",
  "Folate, total": "folate",
  "Choline, total": "choline",
  Retinol: "retinol",
  "Carotene, alpha": "alphaCarotene",
  "Carotene, beta": "betaCarotene",
  Lycopene: "lycopene",
  Caffeine: "caffeine",
  Theobromine: "theobromine",
  // Sugars
  "Sugars, total including NLEA": "sugar",
  "Sugars, Total": "sugar",
  Sucrose: "sucrose",
  "Glucose (dextrose)": "glucose",
  Fructose: "fructose",
  Lactose: "lactose",
  Maltose: "maltose",
  Galactose: "galactose",
  Starch: "starch",
  // Fat breakdown
  "Fatty acids, total saturated": "saturatedFat",
  "Fatty acids, total monounsaturated": "monounsaturatedFat",
  "Fatty acids, total polyunsaturated": "polyunsaturatedFat",
  "Fatty acids, total trans": "transFat",
  // Amino acids
  Alanine: "alanine",
  Arginine: "arginine",
  "Aspartic acid": "asparticAcid",
  Cystine: "cystine",
  "Glutamic acid": "glutamicAcid",
  Glycine: "glycine",
  Histidine: "histidine",
  Hydroxyproline: "hydroxyproline",
  Isoleucine: "isoleucine",
  Leucine: "leucine",
  Lysine: "lysine",
  Methionine: "methionine",
  Phenylalanine: "phenylalanine",
  Proline: "proline",
  Serine: "serine",
  Threonine: "threonine",
  Tryptophan: "tryptophan",
  Tyrosine: "tyrosine",
  Valine: "valine",
};

/** Map USDA n-3/n-6 totals to omega3/omega6 by summing. We compute these manually. */
function maybeAddFattyAcids(
  output: Record<string, number>,
  foodNutrients: Array<{ nutrientName: string; value: number }>
) {
  let n3 = 0;
  let n6 = 0;
  let ala = 0;
  let dha = 0;
  let epa = 0;
  let dpa = 0;
  for (const n of foodNutrients) {
    const name = (n.nutrientName ?? "").toLowerCase();
    const v = n.value;
    if (!v) continue;
    if (name.includes("18:3") && name.includes("n-3")) {
      ala += v;
      n3 += v;
    } else if (name.includes("22:6 n-3")) {
      dha += v;
      n3 += v;
    } else if (name.includes("20:5 n-3")) {
      epa += v;
      n3 += v;
    } else if (name.includes("22:5 n-3")) {
      dpa += v;
      n3 += v;
    } else if (name.includes("n-3")) {
      n3 += v;
    } else if (name.includes("n-6") || name.includes("18:2 n-6")) {
      n6 += v;
    }
  }
  if (n3 > 0) output.omega3 = n3;
  if (n6 > 0) output.omega6 = n6;
  if (ala > 0) output.ala = ala;
  if (dha > 0) output.dha = dha;
  if (epa > 0) output.epa = epa;
  if (dpa > 0) output.dpa = dpa;
}

async function searchFood(name: string) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    query: name,
    pageSize: "5",
    dataType: "Foundation,SR Legacy,Survey (FNDDS)",
  });
  const url = `${SEARCH_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`USDA search failed for "${name}": ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as {
    foods: Array<{
      fdcId: number;
      description: string;
      dataType: string;
      foodNutrients: Array<{ nutrientName: string; value: number; unitName: string }>;
    }>;
  };
  return json.foods?.[0] ?? null;
}

function extractNutrition(
  foodNutrients: Array<{ nutrientName: string; value: number }>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of foodNutrients) {
    const field = NUTRIENT_MAP[n.nutrientName];
    if (field && typeof n.value === "number" && n.value > 0) {
      out[field] = n.value;
    }
  }
  maybeAddFattyAcids(out, foodNutrients);
  // netCarbs = carbs - fiber (if both present and we don't already have netCarbs)
  if (out.carbs && out.fiber && !out.netCarbs) {
    out.netCarbs = Math.max(0, out.carbs - out.fiber);
  }
  return out;
}

async function main() {
  const foods = await prisma.food.findMany();
  console.log(`Found ${foods.length} foods in DB. Fetching USDA data…`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const food of foods) {
    // Skip if this food was already enriched (any extended nutrient is set)
    if (food.fiber != null || food.iron != null || food.vitaminC != null) {
      console.log(`  ↪  ${food.name}: already enriched, skipping`);
      skipped++;
      continue;
    }

    try {
      const match = await searchFood(food.name);
      if (!match) {
        console.warn(`  ✗  ${food.name}: no USDA match`);
        failed++;
        continue;
      }
      const data = extractNutrition(match.foodNutrients);
      if (Object.keys(data).length === 0) {
        console.warn(`  ✗  ${food.name}: USDA match found but no mapped nutrients`);
        failed++;
        continue;
      }
      await prisma.food.update({ where: { id: food.id }, data });
      console.log(
        `  ✓  ${food.name} → "${match.description}" (${Object.keys(data).length} fields)`
      );
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${food.name}: ${msg}`);
      failed++;
    }

    // Rate-limit politeness: 200 ms between requests (well under the 1000/hr limit)
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nDone. enriched=${ok}  skipped=${skipped}  failed=${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
