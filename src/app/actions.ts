"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
const getSupabase = () => createClient();

export async function validateExpense(expenseId: string) {
  await (await getSupabase()).from("expenses").update({ status: "Validée" }).eq("id", expenseId);
  revalidatePath("/tableau-de-bord");
  revalidatePath("/depenses");
}

export async function rejectExpense(expenseId: string) {
  await (await getSupabase()).from("expenses").update({ status: "Rejetée" }).eq("id", expenseId);
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
    const { data: contributor } = await (await getSupabase()).from("contributors").select("*").eq("id", contributorId).single();
    
    const [startYear, startMonth] = startMonthStr.split("-").map(Number);
    const currentDate = new Date(startYear, startMonth - 1, 1);

    for (let i = 0; i < monthsCount; i++) {
      const iterYear = currentDate.getFullYear();
      const iterMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      const { error } = await (await getSupabase()).from("incomes").insert({
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
    const { error } = await (await getSupabase()).from("incomes").insert({
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
  
  const { error } = await (await getSupabase()).from("expenses").insert({
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
  
  const { data: contributor, error: insertError } = await (await getSupabase()).from("contributors").insert({
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
    await (await getSupabase()).from("pledges").insert({
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
  
  await (await getSupabase()).from("students").insert({
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
  await (await getSupabase()).from("organization").update({
    name: formData.get("name") as string,
    "openingBalance": Number(formData.get("openingBalance"))
  }).neq("id", "00000000-0000-0000-0000-000000000000"); // Update all or specific

  revalidatePath("/parametres");
  revalidatePath("/tableau-de-bord");
}

export async function deleteContributor(id: string) {
  await (await getSupabase()).from("contributors").delete().eq("id", id);
  revalidatePath("/contributeurs");
  revalidatePath("/cotisations");
}

export async function deleteStudent(id: string) {
  await (await getSupabase()).from("students").delete().eq("id", id);
  revalidatePath("/etudiants");
}

export async function deleteIncome(id: string) {
  await (await getSupabase()).from("incomes").delete().eq("id", id);
  revalidatePath("/entrees");
  revalidatePath("/tableau-de-bord");
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const [firstName, ...lastNameArr] = name.split(" ");
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  
  const { supabaseAdmin } = await import("@/lib/data/supabase");
  
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY n'est pas configuré. Impossible de créer un compte avec Auth.");
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password || "Password123!",
    email_confirm: true,
  });

  if (authError) throw authError;

  await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    "firstName": firstName,
    "lastName": lastNameArr.join(" "),
    email: email,
    phone: phone,
    role: role,
    "mustChangePassword": true
  });
  
  revalidatePath("/parametres");
}

export async function updateUser(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const [firstName, ...lastNameArr] = name.split(" ");
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;
  
  const { supabaseAdmin } = await import("@/lib/data/supabase");
  
  if (supabaseAdmin) {
    await supabaseAdmin.from("users").update({
      "firstName": firstName,
      "lastName": lastNameArr.join(" "),
      phone: phone,
      role: role
    }).eq("id", id);
  }
  
  revalidatePath("/parametres");
}

export async function updatePassword(userId: string, _newPassword: string) {
  await (await getSupabase()).from("users").update({ "mustChangePassword": false }).eq("id", userId);
  revalidatePath("/parametres");
}

export async function deleteUser(id: string) {
  const { supabaseAdmin } = await import("@/lib/data/supabase");
  if (supabaseAdmin) {
    await supabaseAdmin.auth.admin.deleteUser(id);
    await supabaseAdmin.from("users").delete().eq("id", id);
  } else {
    await (await getSupabase()).from("users").delete().eq("id", id);
  }
  revalidatePath("/parametres");
}

export async function signOutAction() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}

