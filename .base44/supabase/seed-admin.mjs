// Base44 sandbox: create/reset the local development administrator account.
// Mirrors create_admin.js, but talks to the services by HTTP so it needs no npm install.
// Uses only the Node 22 global fetch.
const base = process.env.SUPABASE_INTERNAL_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!base || !serviceKey || !email || !password) {
  console.error("SUPABASE_INTERNAL_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApi() {
  for (let attempt = 0; attempt < 45; attempt++) {
    try {
      const res = await fetch(`${base}/auth/v1/health`, { headers });
      if (res.ok) return;
    } catch {
      // service still starting
    }
    await sleep(2000);
  }
  throw new Error("the auth service did not become reachable");
}

async function findUserId() {
  const res = await fetch(`${base}/auth/v1/admin/users?per_page=200`, { headers });
  if (!res.ok) throw new Error(`listing users failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const users = Array.isArray(data) ? data : data.users || [];
  return users.find((u) => u.email === email)?.id;
}

async function main() {
  await waitForApi();

  let userId = await findUserId();
  if (userId) {
    const res = await fetch(`${base}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error(`password reset failed (${res.status}): ${await res.text()}`);
    console.log(`Admin user already existed, password reset: ${email}`);
  } else {
    const res = await fetch(`${base}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`creating the admin user failed (${res.status}): ${JSON.stringify(data)}`);
    userId = data.id || data.user?.id;
    console.log(`Admin user created: ${email}`);
  }

  if (!userId) throw new Error("the auth service did not return a user id");

  const profile = await fetch(`${base}/rest/v1/users?on_conflict=id`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      id: userId,
      firstName: "Aimé Richard",
      lastName: "BOKO",
      email,
      role: "Admin",
      mustChangePassword: false,
    }),
  });
  if (!profile.ok) throw new Error(`writing the profile row failed (${profile.status}): ${await profile.text()}`);

  console.log("Admin profile is ready in public.users");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
