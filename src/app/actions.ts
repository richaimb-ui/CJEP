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

const getDb = async () => {
  const { supabaseAdmin } = await import("@/lib/data/supabase");
  return supabaseAdmin || (await getSupabase());
};

export async function createContributor(formData: FormData) {
  try {
    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const engagement = Number(formData.get("engagement") || 0);

    if (!firstName || !lastName) {
      return { success: false, error: "Le prénom et le nom sont obligatoires." };
    }

    const db = await getDb();
    
    // First attempt: insert with all provided fields
    const fullPayload: Record<string, any> = {
      firstName,
      lastName,
      role: "Membre",
      status: "Actif",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    if (email) fullPayload.email = email;
    if (phone) fullPayload.phone = phone;

    let { data: contributor, error: insertError } = await db
      .from("contributors")
      .insert(fullPayload)
      .select()
      .single();

    // If schema cache says column email or phone doesn't exist (PGRST204)
    if (insertError && (insertError.code === "PGRST204" || insertError.message.includes("column") || insertError.message.includes("schema cache"))) {
      const basicPayload = {
        firstName,
        lastName,
        role: "Membre",
        status: "Actif",
        joinedAt: new Date().toISOString().split("T")[0],
      };
      const retryResult = await db
        .from("contributors")
        .insert(basicPayload)
        .select()
        .single();
      
      contributor = retryResult.data;
      insertError = retryResult.error;
    }

    if (insertError) {
      console.error("Contributor insert error:", insertError);
      return { success: false, error: insertError.message };
    }

    if (engagement > 0 && contributor) {
      const { error: pledgeError } = await db.from("pledges").insert({
        contributorId: contributor.id,
        monthlyAmount: engagement,
        startMonth: new Date().toISOString().slice(0, 7),
      });
      if (pledgeError) {
        console.warn("Could not insert pledge:", pledgeError.message);
      }
    }

    revalidatePath("/contributeurs");
    revalidatePath("/cotisations");
    revalidatePath("/tableau-de-bord");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createContributor:", error);
    return { success: false, error: error.message || "Une erreur est survenue lors de l'enregistrement." };
  }
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
  try {
    const db = await getDb();
    await db.from("pledges").delete().eq("contributorId", id);
    const { error } = await db.from("contributors").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/contributeurs");
    revalidatePath("/cotisations");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteContributor:", error);
    return { success: false, error: error.message };
  }
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
  try {
    const name = (formData.get("name") as string)?.trim() || "";
    const [firstName, ...lastNameArr] = name.split(" ");
    const email = (formData.get("email") as string)?.trim();
    const role = formData.get("role") as string;
    const phone = (formData.get("phone") as string)?.trim() || undefined;
    const password = (formData.get("password") as string)?.trim() || "Cjep2026!";
    
    const { supabaseAdmin } = await import("@/lib/data/supabase");
    
    if (supabaseAdmin) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });

      if (authError) return { success: false, error: authError.message };

      const { error: dbError } = await supabaseAdmin.from("users").insert({
        id: authData.user.id,
        "firstName": firstName,
        "lastName": lastNameArr.join(" "),
        email: email,
        phone: phone,
        role: role,
        "mustChangePassword": true
      });
      if (dbError) return { success: false, error: dbError.message };
    } else {
      const id = crypto.randomUUID();
      const db = await getSupabase();
      const { error: dbError } = await db.from("users").insert({
        id,
        "firstName": firstName,
        "lastName": lastNameArr.join(" "),
        email: email,
        phone: phone,
        role: role,
        "mustChangePassword": true
      });
      if (dbError) return { success: false, error: dbError.message };
    }
    
    revalidatePath("/parametres");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createUser:", error);
    return { success: false, error: error.message || "Erreur lors de la création du membre." };
  }
}

export async function updateUser(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string)?.trim() || "";
    const [firstName, ...lastNameArr] = name.split(" ");
    const role = formData.get("role") as string;
    const phone = (formData.get("phone") as string)?.trim() || undefined;
    
    const db = await getDb();
    
    const { error } = await db.from("users").update({
      "firstName": firstName,
      "lastName": lastNameArr.join(" "),
      phone: phone,
      role: role
    }).eq("id", id);
    
    if (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
    
    revalidatePath("/parametres");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateUser:", error);
    return { success: false, error: error.message || "Erreur lors de la mise à jour." };
  }
}

export async function updatePassword(userId: string, _newPassword: string) {
  await (await getSupabase()).from("users").update({ "mustChangePassword": false }).eq("id", userId);
  revalidatePath("/parametres");
}

export async function deleteUser(id: string) {
  try {
    const { supabaseAdmin } = await import("@/lib/data/supabase");
    if (supabaseAdmin) {
      await supabaseAdmin.auth.admin.deleteUser(id);
      await supabaseAdmin.from("users").delete().eq("id", id);
    } else {
      await (await getSupabase()).from("users").delete().eq("id", id);
    }
    revalidatePath("/parametres");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUser:", error);
    return { success: false, error: error.message };
  }
}

export async function signOutAction() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Veuillez renseigner votre email et mot de passe." };
  }

  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message };
  }

  // Check if user must change password
  const { data: userData } = await supabase
    .from("users")
    .select("mustChangePassword")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (userData?.mustChangePassword) {
    return { success: true, redirectUrl: "/change-password" };
  }

  return { success: true, redirectUrl: "/tableau-de-bord" };
}

export async function changePasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const userEmail = formData.get("email") as string;

  const supabase = await getSupabase();
  const { error: authError } = await supabase.auth.updateUser({
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (userEmail) {
    await supabase
      .from("users")
      .update({ mustChangePassword: false })
      .eq("email", userEmail);
  }

  return { success: true };
}


