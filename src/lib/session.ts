import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/login");
  return session.user;
}

export async function requireClient() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "USER") redirect("/admin");
  return session.user;
}
