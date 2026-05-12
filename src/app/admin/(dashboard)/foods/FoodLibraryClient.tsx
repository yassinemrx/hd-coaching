"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  SaladIcon,
  CloseIcon,
  ChevronDownIcon,
  CameraIcon,
} from "@/components/Icon";
import { useDict, useLocale } from "@/components/I18nProvider";
import { trFoodName, trCategory, trUnit } from "@/lib/i18n/dynamic";
import type { Food } from "@prisma/client";
import { NUTRIENT_UNITS, type NutrientKey } from "@/lib/nutrition";

const CATEGORIES = ["Protein", "Carbs", "Fats", "Vegetables", "Fruits", "Dairy", "Drinks", "Other"];
const UNITS = ["g", "ml", "piece", "cup", "scoop", "slice", "tbsp"];

/** Groups used inside the food form. Field names must match Food columns. */
const SECTIONS: { key: keyof typeof SECTION_LABELS; fields: NutrientKey[] }[] = [
  { key: "extendedCore", fields: ["netCarbs", "fiber", "sodium", "cholesterol"] },
  {
    key: "minerals",
    fields: [
      "calcium", "iron", "potassium", "vitaminD", "magnesium",
      "phosphorus", "zinc", "selenium", "copper", "manganese",
    ],
  },
  {
    key: "vitamins",
    fields: [
      "vitaminA", "vitaminAIU", "vitaminB6", "vitaminB12", "vitaminC", "vitaminE", "vitaminK",
      "thiamine", "riboflavin", "niacin", "pantothenicAcid", "folate", "choline",
      "retinol", "alphaCarotene", "betaCarotene", "lycopene",
      "fluoride", "vitaminD2", "vitaminD3", "vitaminDIU",
      "caffeine", "theobromine",
    ],
  },
  {
    key: "sugars",
    fields: ["sugar", "sucrose", "glucose", "fructose", "lactose", "maltose", "galactose", "starch"],
  },
  {
    key: "fatBreakdown",
    fields: ["saturatedFat", "monounsaturatedFat", "polyunsaturatedFat", "transFat"],
  },
  {
    key: "fattyAcids",
    fields: ["omega3", "omega6", "ala", "dha", "epa", "dpa"],
  },
  {
    key: "aminoAcids",
    fields: [
      "alanine", "arginine", "asparticAcid", "cystine", "glutamicAcid", "glycine",
      "histidine", "hydroxyproline", "isoleucine", "leucine", "lysine", "methionine",
      "phenylalanine", "proline", "serine", "threonine", "tryptophan", "tyrosine", "valine",
    ],
  },
];

const SECTION_LABELS = {
  extendedCore: "extendedCore",
  minerals: "minerals",
  vitamins: "vitamins",
  sugars: "sugars",
  fatBreakdown: "fatBreakdown",
  fattyAcids: "fattyAcids",
  aminoAcids: "aminoAcids",
} as const;

export default function FoodLibraryClient({ initial }: { initial: Food[] }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useDict();
  const [items, setItems] = useState<Food[]>(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (f) =>
        (filter === "All" || f.category === filter) &&
        (q === "" || f.name.toLowerCase().includes(q))
    );
  }, [items, search, filter]);

  const grouped = useMemo(() => {
    const map: Record<string, Food[]> = {};
    for (const f of filtered) (map[f.category] ||= []).push(f);
    return map;
  }, [filtered]);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(f: Food) {
    setEditing(f);
    setShowForm(true);
  }
  async function onDelete(id: string) {
    if (!confirm(t.admin.deleteFoodConfirm)) return;
    const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    if (res.ok) setItems((arr) => arr.filter((x) => x.id !== id));
    else alert(t.admin.couldNotDeleteFood);
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{t.admin.libraryKicker}</p>
          <h1 className="mt-1 h-page">{t.admin.foodsTitle}</h1>
          <p className="mt-1 text-muted">{t.admin.foodsBlurb}</p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <PlusIcon size={16} /> {t.admin.newFood}
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.searchFoodsShort}
            className="input pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "All"} onClick={() => setFilter("All")}>{t.admin.all}</FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {trCategory(c, locale)}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <SaladIcon size={28} className="text-ink-300" />
            <p className="mt-3 font-medium text-ink-700">{t.admin.noFoodsMatch}</p>
            <p className="mt-1 text-muted">{t.admin.addOrChangeFilter}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{trCategory(cat, locale)}</h2>
                <span className="text-xs text-ink-400">({list.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((f) => (
                  <article
                    key={f.id}
                    className="group rounded-xl bg-white p-4 ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft hover:ring-brand-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        {f.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.imageUrl}
                            alt={f.name}
                            className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-ink-200"
                          />
                        ) : (
                          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-400 ring-1 ring-ink-200">
                            <SaladIcon size={20} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-ink-900">{trFoodName(f.name, locale)}</h3>
                          <p className="mt-0.5 text-xs text-ink-400">
                            {f.perAmount} {trUnit(f.unit, locale)}
                          </p>
                          <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                            <Macro label={t.nutrition.kcal} value={Math.round(f.calories)} />
                            <Macro label="P" value={f.protein.toFixed(1)} />
                            <Macro label="C" value={f.carbs.toFixed(1)} />
                            <Macro label="F" value={f.fat.toFixed(1)} />
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button onClick={() => openEdit(f)} className="btn-icon" aria-label={t.common.edit}>
                          <PencilIcon size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(f.id)}
                          className="btn-icon hover:text-red-600"
                          aria-label={t.common.delete}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {showForm && (
        <FoodForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={(saved) => {
            setShowForm(false);
            setItems((arr) => {
              const idx = arr.findIndex((x) => x.id === saved.id);
              if (idx >= 0) {
                const copy = [...arr];
                copy[idx] = saved;
                return copy;
              }
              return [...arr, saved];
            });
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function Macro({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-ink-50 px-2 py-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "bg-brand-500 text-ink-50 shadow-glow"
          : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-100")
      }
    >
      {children}
    </button>
  );
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-ink-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-ink-800 hover:bg-ink-100/50"
      >
        <span>{title}</span>
        <ChevronDownIcon
          size={16}
          className={"text-ink-400 transition-transform " + (open ? "rotate-180" : "")}
        />
      </button>
      {open && <div className="border-t border-ink-200 p-3">{children}</div>}
    </div>
  );
}

/** Type-safe helper: get a numeric or null nutrient value from a Food row. */
function getNutrient(food: Food | null, key: NutrientKey): string {
  if (!food) return "";
  const v = (food as unknown as Record<string, number | null>)[key];
  return v == null ? "" : String(v);
}

function FoodForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Food | null;
  onClose: () => void;
  onSaved: (f: Food) => void;
}) {
  const locale = useLocale();
  const t = useDict();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Protein");
  const [unit, setUnit] = useState(initial?.unit ?? "g");
  const [perAmount, setPerAmount] = useState(String(initial?.perAmount ?? 100));
  const [calories, setCalories] = useState(String(initial?.calories ?? ""));
  const [protein, setProtein] = useState(String(initial?.protein ?? ""));
  const [carbs, setCarbs] = useState(String(initial?.carbs ?? ""));
  const [fat, setFat] = useState(String(initial?.fat ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [imageUploading, setImageUploading] = useState(false);

  // One big object for all extended fields, keyed by NutrientKey
  const [extra, setExtra] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const section of SECTIONS) {
      for (const key of section.fields) {
        out[key] = getNutrient(initial, key);
      }
    }
    return out;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-open sections that have a saved value
  const sectionOpenDefaults = useMemo(() => {
    const out: Record<string, boolean> = {};
    for (const section of SECTIONS) {
      out[section.key] = section.fields.some(
        (k) => initial && (initial as unknown as Record<string, number | null>)[k] != null
      );
    }
    return out;
  }, [initial]);

  function setExtraField(key: string, value: string) {
    setExtra((s) => ({ ...s, [key]: value }));
  }

  async function onPickImage(file: File) {
    setImageUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/foods/upload-image", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : "Upload failed");
      }
      const { url } = (await res.json()) as { url: string };
      setImageUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setImageUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const body: Record<string, unknown> = {
      name,
      category,
      unit,
      perAmount: parseFloat(perAmount || "0"),
      calories: parseFloat(calories || "0"),
      protein: parseFloat(protein || "0"),
      carbs: parseFloat(carbs || "0"),
      fat: parseFloat(fat || "0"),
      notes: notes || null,
      imageUrl: imageUrl || null,
    };
    // Pack extended fields — non-empty strings become numbers, empty become null
    for (const section of SECTIONS) {
      for (const key of section.fields) {
        const raw = (extra[key] ?? "").trim();
        body[key] = raw === "" ? null : parseFloat(raw);
      }
    }

    const url = initial ? `/api/foods/${initial.id}` : "/api/foods";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError(t.admin.saveFailed);
      return;
    }
    const saved = await res.json();
    onSaved(saved);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto animate-slide-in rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="h-section">{initial ? t.admin.editFoodTitle : t.admin.addFoodTitle}</h2>
            <p className="text-muted">{t.admin.foodFormBlurb}</p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label={t.common.close}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {/* Image */}
          <div>
            <label className="label">{t.diet.foodImage}</label>
            <div className="mt-1 flex items-center gap-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover ring-1 ring-ink-200"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-lg bg-ink-100 text-ink-400 ring-1 ring-ink-200">
                  <CameraIcon size={22} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickImage(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="btn btn-secondary text-xs"
                >
                  {imageUploading ? t.admin.savingDots : t.diet.uploadFoodImage}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-xs text-ink-500 hover:text-red-600"
                  >
                    {t.diet.removeImage}
                  </button>
                )}
                <p className="text-xs text-ink-400">{t.diet.imageHelp}</p>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div>
            <label className="label">{t.admin.namePh}</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              placeholder={t.admin.nameFoodPh}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.admin.categoryLabel}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{trCategory(c, locale)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.admin.unitLabel}</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input mt-1">
                {UNITS.map((u) => (
                  <option key={u} value={u}>{trUnit(u, locale)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t.admin.perAmountLabel}</label>
            <input
              type="number"
              step="0.1"
              min={0}
              required
              value={perAmount}
              onChange={(e) => setPerAmount(e.target.value)}
              className="input mt-1"
            />
            <p className="mt-1 text-xs text-ink-400">{t.admin.perAmountHint}</p>
          </div>

          {/* Core macros */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField label={t.admin.caloriesLabel} value={calories} onChange={setCalories} />
            <NumberField label={t.admin.proteinG} value={protein} onChange={setProtein} />
            <NumberField label={t.admin.carbsG} value={carbs} onChange={setCarbs} />
            <NumberField label={t.admin.fatG} value={fat} onChange={setFat} />
          </div>

          <div>
            <label className="label">{t.admin.notesOptional}</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input mt-1" />
          </div>

          {/* Collapsible extended sections */}
          {SECTIONS.map((section) => (
            <CollapsibleSection
              key={section.key}
              title={t.diet[section.key]}
              defaultOpen={sectionOpenDefaults[section.key]}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {section.fields.map((field) => (
                  <NumberField
                    key={field}
                    label={`${t.nutrients[field as keyof typeof t.nutrients]} (${NUTRIENT_UNITS[field]})`}
                    value={extra[field] ?? ""}
                    onChange={(v) => setExtraField(field, v)}
                  />
                ))}
              </div>
            </CollapsibleSection>
          ))}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? t.admin.savingDots : initial ? t.admin.saveChangesBtn : t.admin.addFoodBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        step="0.0001"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1"
      />
    </div>
  );
}
