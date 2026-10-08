const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  const email = "richaimb@gmail.com";
  const password = "SuperPassword123!";
  const firstName = "Aimé Richard";
  const lastName = "BOKO";
  
  console.log("Creating user in Auth...");
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
  }

  let userId = authData?.user?.id;
  if (!userId) {
    console.log("Fetching existing user ID...");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === email);
    if (existingUser) {
      userId = existingUser.id;
      console.log("Updating password for existing user...");
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: password });
      await insertIntoUsersTable(userId, firstName, lastName, email);
    } else {
      console.error("User not found!");
    }
  } else {
    await insertIntoUsersTable(userId, firstName, lastName, email);
  }
}

async function insertIntoUsersTable(id, firstName, lastName, email) {
  console.log("Inserting user into public.users table as Admin...");
  const { error } = await supabaseAdmin.from("users").upsert({
    id: id,
    firstName: firstName,
    lastName: lastName,
    email: email,
    role: "Admin",
    mustChangePassword: false
  });

  if (error) {
    console.error("Database Error:", error.message);
  } else {
    console.log("SuperAdmin account created successfully!");
  }
}

createSuperAdmin();
