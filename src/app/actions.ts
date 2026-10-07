"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/data/supabase";

export async function validateExpense(expenseId: string) {
  await supabase.from("expenses").update({ status: "Validée" }).eq("id", expenseId);
  revalidatePath("/tableau-de-bord");
  revalidatePath("/depenses");
}

export async function rejectExpense(expenseId: string) {
  await supabase.from("expenses").update({ status: "Rejetée" }).eq("id", expenseId);
  revalidatePath("/tableau-de-bord");
  revalidatePath("/depenses");
}

export async function createIncome(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const type = formData.get("type") as string;
  const sourceName = formData.get("sourceName") as string;
  const contributorId = formData.get("contributorId") as string | null;
  const startMonthStr = formData.get("startMonth") as string;
  const monthsCount = Number(formData.get("monthsCount") || 1);
  
  if (type === "Cotisation" && contributorId && startMonthStr && monthsCount > 0) {
    const amountPerMonth = amount / monthsCount;
    const { data: contributor } = await supabase.from("contributors").select("*").eq("id", contributorId).single();
    
    const [startYear, startMonth] = startMonthStr.split("-").map(Number);
    const currentDate = new Date(startYear, startMonth - 1, 1);

    for (let i = 0; i < monthsCount; i++) {
      const iterYear = currentDate.getFullYear();
      const iterMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      const { error } = await supabase.from("incomes").insert({
        ref: `ENT-${iterYear}-${Math.floor(Math.random() * 10000)}`,
        type,
        "contributorId": contributorId,
        "sourceName": contributor ? `${contributor.firstName} ${contributor.lastName}` : sourceName,
        amount: amountPerMonth,
        "receivedOn": `${iterYear}-${iterMonth}-01`,
        status: "Actif",
        "createdBy": "Daniel Morales",
      });
      if (error) throw new Error(error.message);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else {
    const { error } = await supabase.from("incomes").insert({
      ref: `ENT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      type,
      "contributorId": contributorId || undefined,
      "sourceName": sourceName || "Source inconnue",
      amount,
      "receivedOn": new Date().toISOString().split("T")[0],
      status: "Actif",
      "createdBy": "Daniel Morales",
    });
    if (error) throw new Error(error.message);
  }
  
  revalidatePath("/tableau-de-bord");
  revalidatePath("/entrees");
  revalidatePath("/cotisations");
}

export async function createExpense(formData: FormData) {
  const amount = Number(formData.get("amount"));
  let category = formData.get("category") as string;
  const customCategory = formData.get("customCategory") as string;
  
  if (category === "Divers" && customCategory) {
    category = customCategory.trim();
  }
  
  const { error } = await supabase.from("expenses").insert({
    ref: `DEP-2026-${Math.floor(Math.random() * 10000)}`,
    category,
    amount,
    "spentOn": new Date().toISOString().split("T")[0],
    status: "En attente",
    "createdBy": "Daniel Morales",
  });
  if (error) throw new Error(error.message);
  
  revalidatePath("/tableau-de-bord");
  revalidatePath("/depenses");
}

export async function createContributor(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  
  const { data: contributor, error: insertError } = await supabase.from("contributors").insert({
    "firstName": firstName,
    "lastName": lastName,
    email: email,
    phone: phone,
    role: "Membre",
    status: "Actif",
    "joinedAt": new Date().toISOString().split("T")[0],
  }).select().single();
  if (insertError) throw new Error(insertError.message);

  const engagement = Number(formData.get("engagement"));
  if (engagement > 0 && contributor) {
    await supabase.from("pledges").insert({
      "contributorId": contributor.id,
      "monthlyAmount": engagement,
      "startMonth": new Date().toISOString().slice(0, 7),
    });
  }

  revalidatePath("/contributeurs");
  revalidatePath("/cotisations");
}

export async function createStudent(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const [firstName, ...lastNameArr] = fullName.split(" ");
  const lastName = lastNameArr.join(" ") || "Inconnu";
  const school = formData.get("school") as string;
  const program = formData.get("program") as string;
  
  await supabase.from("students").insert({
    "firstName": firstName,
    "lastName": lastName,
    field: school,
    level: program,
    status: 'Actif',
    "scholarshipAmount": 0
  });

  revalidatePath("/etudiants");
}

export async function updateSettings(formData: FormData) {
  await supabase.from("organization").update({
    name: formData.get("name") as string,
    "openingBalance": Number(formData.get("openingBalance"))
  }).neq("id", "00000000-0000-0000-0000-000000000000"); // Update all or specific

  revalidatePath("/parametres");
  revalidatePath("/tableau-de-bord");
}

export async function deleteContributor(id: string) {
  await supabase.from("contributors").delete().eq("id", id);
  revalidatePath("/contributeurs");
  revalidatePath("/cotisations");
}

export async function deleteStudent(id: string) {
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/etudiants");
}

export async function deleteIncome(id: string) {
  await supabase.from("incomes").delete().eq("id", id);
  revalidatePath("/entrees");
  revalidatePath("/tableau-de-bord");
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const [firstName, ...lastNameArr] = name.split(" ");
  
  await supabase.from("users").insert({
    "firstName": firstName,
    "lastName": lastNameArr.join(" "),
    email: formData.get("email") as string,
    role: formData.get("role") as string,
    "mustChangePassword": true
  });
  
  revalidatePath("/parametres");
}

export async function updatePassword(userId: string, _newPassword: string) {
  await supabase.from("users").update({ "mustChangePassword": false }).eq("id", userId);
  revalidatePath("/parametres");
}

export async function deleteUser(id: string) {
  await supabase.from("users").delete().eq("id", id);
  revalidatePath("/parametres");
}
