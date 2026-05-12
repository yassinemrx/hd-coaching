import { z } from "zod";

/**
 * Zod schema covering every nutrition column on the Food model.
 * Each extended field is `optional().nullable()` — the coach fills only what is known.
 * Used by /api/foods (POST/PATCH).
 */

const optFloat = z.coerce
  .number()
  .min(0)
  .max(1_000_000)
  .optional()
  .nullable();

export const foodCoreSchema = {
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(50),
  unit: z.string().min(1).max(20),
  perAmount: z.coerce.number().positive().max(100000),
  imageUrl: z.string().max(500).optional().nullable(),
  calories: z.coerce.number().min(0).max(100000),
  protein: z.coerce.number().min(0).max(10000),
  carbs: z.coerce.number().min(0).max(10000),
  fat: z.coerce.number().min(0).max(10000),
  notes: z.string().max(500).optional().nullable(),
};

export const foodExtendedSchema = {
  // Extended core
  netCarbs: optFloat,
  fiber: optFloat,
  sodium: optFloat,
  cholesterol: optFloat,
  // Minerals
  calcium: optFloat,
  iron: optFloat,
  potassium: optFloat,
  vitaminD: optFloat,
  magnesium: optFloat,
  phosphorus: optFloat,
  zinc: optFloat,
  selenium: optFloat,
  copper: optFloat,
  manganese: optFloat,
  // Vitamins
  vitaminA: optFloat,
  vitaminAIU: optFloat,
  vitaminB6: optFloat,
  vitaminB12: optFloat,
  vitaminC: optFloat,
  vitaminE: optFloat,
  vitaminK: optFloat,
  thiamine: optFloat,
  riboflavin: optFloat,
  niacin: optFloat,
  pantothenicAcid: optFloat,
  folate: optFloat,
  choline: optFloat,
  retinol: optFloat,
  alphaCarotene: optFloat,
  betaCarotene: optFloat,
  lycopene: optFloat,
  fluoride: optFloat,
  vitaminD2: optFloat,
  vitaminD3: optFloat,
  vitaminDIU: optFloat,
  caffeine: optFloat,
  theobromine: optFloat,
  // Sugars
  sugar: optFloat,
  sucrose: optFloat,
  glucose: optFloat,
  fructose: optFloat,
  lactose: optFloat,
  maltose: optFloat,
  galactose: optFloat,
  starch: optFloat,
  // Fat breakdown
  saturatedFat: optFloat,
  monounsaturatedFat: optFloat,
  polyunsaturatedFat: optFloat,
  transFat: optFloat,
  // Fatty acids
  omega3: optFloat,
  omega6: optFloat,
  ala: optFloat,
  dha: optFloat,
  epa: optFloat,
  dpa: optFloat,
  // Amino acids
  alanine: optFloat,
  arginine: optFloat,
  asparticAcid: optFloat,
  cystine: optFloat,
  glutamicAcid: optFloat,
  glycine: optFloat,
  histidine: optFloat,
  hydroxyproline: optFloat,
  isoleucine: optFloat,
  leucine: optFloat,
  lysine: optFloat,
  methionine: optFloat,
  phenylalanine: optFloat,
  proline: optFloat,
  serine: optFloat,
  threonine: optFloat,
  tryptophan: optFloat,
  tyrosine: optFloat,
  valine: optFloat,
};

/** Field names of all extended (optional) nutrition columns. */
export const EXTENDED_FIELDS = Object.keys(foodExtendedSchema) as Array<
  keyof typeof foodExtendedSchema
>;

export const foodCreateSchema = z.object({
  ...foodCoreSchema,
  ...foodExtendedSchema,
});

export const foodUpdateSchema = z.object({
  name: foodCoreSchema.name.optional(),
  category: foodCoreSchema.category.optional(),
  unit: foodCoreSchema.unit.optional(),
  perAmount: foodCoreSchema.perAmount.optional(),
  imageUrl: foodCoreSchema.imageUrl,
  calories: foodCoreSchema.calories.optional(),
  protein: foodCoreSchema.protein.optional(),
  carbs: foodCoreSchema.carbs.optional(),
  fat: foodCoreSchema.fat.optional(),
  notes: foodCoreSchema.notes,
  ...foodExtendedSchema,
});

export type FoodCreateInput = z.infer<typeof foodCreateSchema>;
export type FoodUpdateInput = z.infer<typeof foodUpdateSchema>;
