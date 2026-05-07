import type { Locale } from "./dict";

// ─── Exercise names ───────────────────────────────────────────────
const EXERCISE: Record<string, { ar: string; fr: string }> = {
  // Push
  "Barbell Bench Press": { ar: "بنش بريس بالبار", fr: "Développé couché à la barre" },
  "Incline Barbell Bench Press": { ar: "بنش بريس مائل بالبار", fr: "Développé incliné à la barre" },
  "Decline Barbell Bench Press": { ar: "بنش بريس منحدر بالبار", fr: "Développé décliné à la barre" },
  "Dumbbell Bench Press": { ar: "بنش بريس بالدمبل", fr: "Développé couché aux haltères" },
  "Incline Dumbbell Press": { ar: "بنش بريس مائل بالدمبل", fr: "Développé incliné aux haltères" },
  "Dumbbell Fly": { ar: "تفتيح صدر بالدمبل", fr: "Écarté aux haltères" },
  "Cable Crossover": { ar: "تفتيح بالكابل", fr: "Écarté à la poulie" },
  "Pec Deck Machine": { ar: "جهاز الباك ديك", fr: "Pec deck (machine)" },
  "Push-Ups": { ar: "تمرين الضغط", fr: "Pompes" },
  "Dips": { ar: "غطسات (ديبس)", fr: "Dips" },
  "Overhead Barbell Press": { ar: "ضغط أكتاف بالبار", fr: "Développé militaire à la barre" },
  "Seated Dumbbell Shoulder Press": { ar: "ضغط أكتاف جالس بالدمبل", fr: "Développé épaules assis aux haltères" },
  "Arnold Press": { ar: "ضغط أرنولد", fr: "Développé Arnold" },
  "Lateral Raises": { ar: "رفرفة جانبية", fr: "Élévations latérales" },
  "Front Raises": { ar: "رفرفة أمامية", fr: "Élévations frontales" },
  "Cable Lateral Raise": { ar: "رفرفة جانبية بالكابل", fr: "Élévations latérales à la poulie" },
  "Reverse Pec Deck": { ar: "باك ديك عكسي", fr: "Pec deck inversé" },
  "Tricep Rope Pushdown": { ar: "تراي سيبس بالحبل", fr: "Triceps à la corde" },
  "Skullcrushers": { ar: "تراي سيبس مستلقي", fr: "Barre au front" },
  "Overhead Tricep Extension": { ar: "تمديد تراي سيبس فوق الرأس", fr: "Extension triceps au-dessus de la tête" },
  "Close-Grip Bench Press": { ar: "بنش بريس قبضة ضيقة", fr: "Développé couché prise serrée" },
  "Tricep Dips": { ar: "ديبس تراي سيبس", fr: "Dips triceps" },

  // Pull
  "Deadlift": { ar: "الرفعة الميتة", fr: "Soulevé de terre" },
  "Romanian Deadlift": { ar: "رفعة ميتة رومانية", fr: "Soulevé de terre roumain" },
  "Pull-Ups": { ar: "العقلة", fr: "Tractions" },
  "Chin-Ups": { ar: "عقلة قبضة عكسية", fr: "Tractions supination" },
  "Lat Pulldown": { ar: "سحب علوي بالكابل", fr: "Tirage vertical" },
  "Barbell Row": { ar: "تجديف بالبار", fr: "Rowing barre" },
  "Pendlay Row": { ar: "تجديف بندلي", fr: "Rowing Pendlay" },
  "Dumbbell Row": { ar: "تجديف بالدمبل", fr: "Rowing haltère" },
  "T-Bar Row": { ar: "تجديف تي بار", fr: "Rowing T-bar" },
  "Seated Cable Row": { ar: "تجديف جالس بالكابل", fr: "Rowing assis à la poulie" },
  "Face Pulls": { ar: "سحب للوجه", fr: "Face pulls" },
  "Shrugs": { ar: "هز الكتفين", fr: "Shrugs (haussements d'épaules)" },
  "Hyperextensions": { ar: "تمديد ظهر", fr: "Extensions lombaires" },
  "Barbell Curl": { ar: "بايسبس بالبار", fr: "Curl à la barre" },
  "Dumbbell Curl": { ar: "بايسبس بالدمبل", fr: "Curl aux haltères" },
  "Hammer Curl": { ar: "بايسبس مطرقة", fr: "Curl marteau" },
  "Preacher Curl": { ar: "بايسبس بريتشر", fr: "Curl pupitre" },
  "Cable Curl": { ar: "بايسبس بالكابل", fr: "Curl à la poulie" },
  "Concentration Curl": { ar: "بايسبس مركّز", fr: "Curl concentré" },

  // Legs
  "Back Squat": { ar: "سكوات خلفي", fr: "Squat barre arrière" },
  "Front Squat": { ar: "سكوات أمامي", fr: "Squat avant" },
  "Hack Squat": { ar: "هاك سكوات", fr: "Hack squat" },
  "Leg Press": { ar: "ضغط أرجل", fr: "Presse à cuisses" },
  "Bulgarian Split Squat": { ar: "سكوات بلغاري", fr: "Squat bulgare" },
  "Walking Lunges": { ar: "خطوات اندفاعية", fr: "Fentes marchées" },
  "Goblet Squat": { ar: "سكوات جوبليت", fr: "Goblet squat" },
  "Leg Extension": { ar: "تمديد الفخذ", fr: "Leg extension" },
  "Leg Curl": { ar: "ثني الفخذ الخلفي", fr: "Leg curl" },
  "Stiff-Leg Deadlift": { ar: "رفعة ميتة بأرجل مستقيمة", fr: "Soulevé jambes tendues" },
  "Glute Bridge": { ar: "جسر الأرداف", fr: "Pont fessier" },
  "Hip Thrust": { ar: "هيب ثرست", fr: "Hip thrust" },
  "Cable Kickback": { ar: "ركلة خلفية بالكابل", fr: "Kickback à la poulie" },
  "Standing Calf Raise": { ar: "رفع السمانة واقفًا", fr: "Mollets debout" },
  "Seated Calf Raise": { ar: "رفع السمانة جالسًا", fr: "Mollets assis" },

  // Core
  "Plank": { ar: "بلانك", fr: "Planche" },
  "Side Plank": { ar: "بلانك جانبي", fr: "Planche latérale" },
  "Crunches": { ar: "تمارين البطن", fr: "Crunchs" },
  "Hanging Leg Raises": { ar: "رفع الأرجل معلق", fr: "Relevés de jambes suspendu" },
  "Cable Crunch": { ar: "كرنش بالكابل", fr: "Crunch à la poulie" },
  "Russian Twist": { ar: "اللف الروسي", fr: "Russian twist" },
  "Ab Wheel Rollout": { ar: "عجلة البطن", fr: "Roue abdominale" },
  "Mountain Climbers": { ar: "متسلقي الجبال", fr: "Mountain climbers" },

  // Cardio
  "Treadmill Run": { ar: "جري على التريدميل", fr: "Course sur tapis" },
  "Stationary Bike": { ar: "دراجة ثابتة", fr: "Vélo d'appartement" },
  "Elliptical": { ar: "جهاز الإليبتيكال", fr: "Elliptique" },
  "Stair Climber": { ar: "جهاز الدرج", fr: "Stair climber" },
  "Rowing Machine": { ar: "جهاز التجديف", fr: "Rameur" },
  "Jump Rope": { ar: "نط الحبل", fr: "Corde à sauter" },
  "HIIT Sprints": { ar: "تمارين هيت العالية الكثافة", fr: "Sprints HIIT" },

  // Olympic / Full Body
  "Power Clean": { ar: "باور كلين", fr: "Épaulé power" },
  "Clean and Jerk": { ar: "كلين آند جيرك", fr: "Épaulé-jeté" },
  "Snatch": { ar: "أرّيشيه (سناتش)", fr: "Arraché" },
  "Kettlebell Swing": { ar: "أرجحة الكيتل بيل", fr: "Swing kettlebell" },
  "Turkish Get-Up": { ar: "النهوض التركي", fr: "Turkish get-up" },
  "Burpees": { ar: "بربيز", fr: "Burpees" },
  "Thrusters": { ar: "ثرسترز", fr: "Thrusters" },
  "Farmer's Walk": { ar: "مشية المزارع", fr: "Marche du fermier" },
};

// ─── Food names ───────────────────────────────────────────────────
const FOOD: Record<string, { ar: string; fr: string }> = {
  // Proteins
  "Chicken breast (cooked)": { ar: "صدر دجاج (مطبوخ)", fr: "Blanc de poulet (cuit)" },
  "Chicken thigh (cooked)": { ar: "فخذ دجاج (مطبوخ)", fr: "Cuisse de poulet (cuite)" },
  "Beef sirloin (cooked)": { ar: "لحم بقر سيرلوين (مطبوخ)", fr: "Aloyau de bœuf (cuit)" },
  "Lean ground beef 95/5 (cooked)": { ar: "لحم بقر مفروم خالي الدهن 95/5 (مطبوخ)", fr: "Bœuf haché maigre 95/5 (cuit)" },
  "Salmon (cooked)": { ar: "سلمون (مطبوخ)", fr: "Saumon (cuit)" },
  "Tuna (canned in water)": { ar: "تونة (معلبة في الماء)", fr: "Thon (au naturel)" },
  "Tilapia (cooked)": { ar: "بلطي (مطبوخ)", fr: "Tilapia (cuit)" },
  "Shrimp (cooked)": { ar: "جمبري (مطبوخ)", fr: "Crevettes (cuites)" },
  "Whole egg": { ar: "بيضة كاملة", fr: "Œuf entier" },
  "Egg white": { ar: "بياض البيض", fr: "Blanc d'œuf" },
  "Whey protein (scoop)": { ar: "بروتين واي (سكوب)", fr: "Whey protéine (dose)" },
  "Casein protein (scoop)": { ar: "بروتين كازين (سكوب)", fr: "Caséine (dose)" },
  "Turkey breast (cooked)": { ar: "صدر ديك رومي (مطبوخ)", fr: "Blanc de dinde (cuit)" },
  "Lamb (cooked)": { ar: "لحم ضأن (مطبوخ)", fr: "Agneau (cuit)" },
  "Cod (cooked)": { ar: "سمك القد (مطبوخ)", fr: "Cabillaud (cuit)" },
  "Tofu (firm)": { ar: "توفو (متماسك)", fr: "Tofu (ferme)" },

  // Carbs
  "White rice (cooked)": { ar: "أرز أبيض (مطبوخ)", fr: "Riz blanc (cuit)" },
  "Brown rice (cooked)": { ar: "أرز بني (مطبوخ)", fr: "Riz complet (cuit)" },
  "Basmati rice (cooked)": { ar: "أرز بسمتي (مطبوخ)", fr: "Riz basmati (cuit)" },
  "Oats (dry)": { ar: "شوفان (جاف)", fr: "Avoine (sèche)" },
  "Quinoa (cooked)": { ar: "كينوا (مطبوخة)", fr: "Quinoa (cuit)" },
  "Sweet potato (cooked)": { ar: "بطاطا حلوة (مطبوخة)", fr: "Patate douce (cuite)" },
  "White potato (cooked)": { ar: "بطاطس بيضاء (مطبوخة)", fr: "Pomme de terre (cuite)" },
  "Pasta (cooked)": { ar: "مكرونة (مطبوخة)", fr: "Pâtes (cuites)" },
  "Whole wheat bread": { ar: "خبز قمح كامل", fr: "Pain complet" },
  "White bread": { ar: "خبز أبيض", fr: "Pain blanc" },
  "Corn tortilla": { ar: "خبز ذرة (تورتيلا)", fr: "Tortilla de maïs" },
  "Rice cake": { ar: "كعكة أرز", fr: "Galette de riz" },
  "Couscous (cooked)": { ar: "كسكس (مطبوخ)", fr: "Couscous (cuit)" },
  "Bulgur (cooked)": { ar: "برغل (مطبوخ)", fr: "Boulgour (cuit)" },

  // Fats
  "Olive oil": { ar: "زيت زيتون", fr: "Huile d'olive" },
  "Coconut oil": { ar: "زيت جوز الهند", fr: "Huile de coco" },
  "Almonds": { ar: "لوز", fr: "Amandes" },
  "Cashews": { ar: "كاجو", fr: "Noix de cajou" },
  "Walnuts": { ar: "جوز", fr: "Noix" },
  "Peanut butter": { ar: "زبدة فول سوداني", fr: "Beurre de cacahuète" },
  "Almond butter": { ar: "زبدة لوز", fr: "Beurre d'amande" },
  "Avocado": { ar: "أفوكادو", fr: "Avocat" },
  "Chia seeds": { ar: "بذور شيا", fr: "Graines de chia" },
  "Flax seeds": { ar: "بذور كتان", fr: "Graines de lin" },

  // Vegetables
  "Broccoli (cooked)": { ar: "بروكلي (مطبوخ)", fr: "Brocoli (cuit)" },
  "Spinach (raw)": { ar: "سبانخ (نيئة)", fr: "Épinards (crus)" },
  "Carrots (raw)": { ar: "جزر (نيء)", fr: "Carottes (crues)" },
  "Bell pepper": { ar: "فلفل رومي", fr: "Poivron" },
  "Tomato": { ar: "طماطم", fr: "Tomate" },
  "Cucumber": { ar: "خيار", fr: "Concombre" },
  "Lettuce": { ar: "خس", fr: "Laitue" },
  "Asparagus (cooked)": { ar: "هليون (مطبوخ)", fr: "Asperges (cuites)" },
  "Green beans (cooked)": { ar: "فاصوليا خضراء (مطبوخة)", fr: "Haricots verts (cuits)" },
  "Zucchini (cooked)": { ar: "كوسة (مطبوخة)", fr: "Courgette (cuite)" },
  "Cauliflower (cooked)": { ar: "قرنبيط (مطبوخ)", fr: "Chou-fleur (cuit)" },
  "Mushrooms (cooked)": { ar: "فطر (مطبوخ)", fr: "Champignons (cuits)" },

  // Fruits
  "Banana": { ar: "موز", fr: "Banane" },
  "Apple": { ar: "تفاح", fr: "Pomme" },
  "Orange": { ar: "برتقال", fr: "Orange" },
  "Strawberries": { ar: "فراولة", fr: "Fraises" },
  "Blueberries": { ar: "توت أزرق", fr: "Myrtilles" },
  "Grapes": { ar: "عنب", fr: "Raisin" },
  "Pineapple": { ar: "أناناس", fr: "Ananas" },
  "Mango": { ar: "مانجو", fr: "Mangue" },
  "Watermelon": { ar: "بطيخ", fr: "Pastèque" },
  "Kiwi": { ar: "كيوي", fr: "Kiwi" },
  "Dates": { ar: "تمر", fr: "Dattes" },

  // Dairy
  "Greek yogurt (plain, low-fat)": { ar: "زبادي يوناني (سادة، قليل الدسم)", fr: "Yaourt grec (nature, allégé)" },
  "Cottage cheese (low-fat)": { ar: "جبن قريش (قليل الدسم)", fr: "Cottage cheese (allégé)" },
  "Skim milk": { ar: "حليب خالي الدسم", fr: "Lait écrémé" },
  "Whole milk": { ar: "حليب كامل الدسم", fr: "Lait entier" },
  "Cheddar cheese": { ar: "جبن شيدر", fr: "Cheddar" },
  "Mozzarella": { ar: "موزاريلا", fr: "Mozzarella" },
  "Feta cheese": { ar: "جبن فيتا", fr: "Feta" },
  "Butter": { ar: "زبدة", fr: "Beurre" },

  // Drinks
  "Black coffee": { ar: "قهوة سوداء", fr: "Café noir" },
  "Green tea": { ar: "شاي أخضر", fr: "Thé vert" },
  "Almond milk (unsweetened)": { ar: "حليب لوز (بدون سكر)", fr: "Lait d'amande (non sucré)" },
  "Coconut water": { ar: "ماء جوز الهند", fr: "Eau de coco" },
  "Orange juice": { ar: "عصير برتقال", fr: "Jus d'orange" },

  // Other
  "Honey": { ar: "عسل", fr: "Miel" },
  "Hummus": { ar: "حمص", fr: "Houmous" },
  "Dark chocolate (85%)": { ar: "شوكولاتة داكنة (85%)", fr: "Chocolat noir (85%)" },
};

// ─── Categories ───────────────────────────────────────────────────
const CATEGORY: Record<string, { ar: string; fr: string }> = {
  // Exercise categories
  "Push": { ar: "دفع", fr: "Pousser" },
  "Pull": { ar: "سحب", fr: "Tirer" },
  "Legs": { ar: "أرجل", fr: "Jambes" },
  "Core": { ar: "بطن وحوض", fr: "Gainage" },
  "Cardio": { ar: "كارديو", fr: "Cardio" },
  "Olympic": { ar: "أولمبي", fr: "Olympique" },
  "Full Body": { ar: "كامل الجسم", fr: "Corps entier" },
  "Other": { ar: "أخرى", fr: "Autre" },
  // Food categories
  "Protein": { ar: "بروتينات", fr: "Protéines" },
  "Carbs": { ar: "كربوهيدرات", fr: "Glucides" },
  "Fats": { ar: "دهون", fr: "Lipides" },
  "Vegetables": { ar: "خضروات", fr: "Légumes" },
  "Fruits": { ar: "فواكه", fr: "Fruits" },
  "Dairy": { ar: "ألبان", fr: "Produits laitiers" },
  "Drinks": { ar: "مشروبات", fr: "Boissons" },
};

// ─── Muscle groups ────────────────────────────────────────────────
const MUSCLE: Record<string, { ar: string; fr: string }> = {
  "chest": { ar: "صدر", fr: "pectoraux" },
  "back": { ar: "ظهر", fr: "dos" },
  "shoulders": { ar: "أكتاف", fr: "épaules" },
  "biceps": { ar: "بايسبس", fr: "biceps" },
  "triceps": { ar: "تراي سيبس", fr: "triceps" },
  "traps": { ar: "تراب", fr: "trapèzes" },
  "lower back": { ar: "أسفل الظهر", fr: "lombaires" },
  "abs": { ar: "بطن", fr: "abdominaux" },
  "obliques": { ar: "جانبية البطن", fr: "obliques" },
  "quads": { ar: "أمامية الفخذ", fr: "quadriceps" },
  "hamstrings": { ar: "خلفية الفخذ", fr: "ischio-jambiers" },
  "glutes": { ar: "أرداف", fr: "fessiers" },
  "calves": { ar: "سمانة", fr: "mollets" },
  "full": { ar: "كامل الجسم", fr: "corps entier" },
};

// ─── Equipment ────────────────────────────────────────────────────
const EQUIPMENT: Record<string, { ar: string; fr: string }> = {
  "Barbell": { ar: "بار", fr: "Barre" },
  "Dumbbell": { ar: "دمبل", fr: "Haltère" },
  "Machine": { ar: "جهاز", fr: "Machine" },
  "Cable": { ar: "كابل", fr: "Poulie" },
  "Bodyweight": { ar: "وزن الجسم", fr: "Poids du corps" },
  "Kettlebell": { ar: "كيتل بيل", fr: "Kettlebell" },
  "Band": { ar: "حبل مطاطي", fr: "Élastique" },
};

// ─── Units ────────────────────────────────────────────────────────
const UNIT: Record<string, { ar: string; fr: string }> = {
  "g": { ar: "جم", fr: "g" },
  "ml": { ar: "مل", fr: "ml" },
  "piece": { ar: "حبة", fr: "pièce" },
  "slice": { ar: "شريحة", fr: "tranche" },
  "scoop": { ar: "سكوب", fr: "dose" },
  "cup": { ar: "كوب", fr: "tasse" },
  "tbsp": { ar: "ملعقة", fr: "c. à soupe" },
};

function pick(map: Record<string, { ar: string; fr: string }>, key: string, locale: Locale): string {
  if (locale === "en") return key;
  const e = map[key];
  if (!e) return key;
  return locale === "ar" ? e.ar : e.fr;
}

export const trExerciseName = (name: string, locale: Locale) => pick(EXERCISE, name, locale);
export const trFoodName = (name: string, locale: Locale) => pick(FOOD, name, locale);
export const trCategory = (name: string, locale: Locale) => pick(CATEGORY, name, locale);
export const trMuscleGroup = (name: string, locale: Locale) => pick(MUSCLE, name, locale);
export const trEquipment = (name: string, locale: Locale) => pick(EQUIPMENT, name, locale);
export const trUnit = (name: string, locale: Locale) => pick(UNIT, name, locale);
