import { prisma } from "@/lib/prisma";
import FoodLibraryClient from "./FoodLibraryClient";

export const metadata = { title: "Food library — Admin" };
export const dynamic = "force-dynamic";

export default async function FoodLibraryPage() {
  const foods = await prisma.food.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="animate-fade-in">
      <FoodLibraryClient initial={foods} />
    </div>
  );
}
