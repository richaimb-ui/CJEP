import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { MembreModal } from "@/components/ui/MembreModal";
import { ParametresForm } from "@/components/ui/ParametresForm";

export default async function ParametresPage() {
  const supabase = await createClient();
  const { data: orgData } = await supabase.from('organization').select('*').single();
  const { data: usersData } = await supabase.from('users').select('*');
  
  const settings = orgData || {
    name: "Organisation Inconnue",
    dueDay: 10,
    openingBalance: 0
  };
  const users = usersData || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">Paramètres de l'Organisation</h1>
      </div>

      <ParametresForm settings={settings} />

      {/* Moved outside the main form to prevent nested form submissions */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Membres du Comité (Comptes d'accès)</h2>
        <div className="overflow-x-auto border border-border rounded-xl mb-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-2 font-normal whitespace-nowrap">Nom</th>
                <th className="px-4 py-2 font-normal whitespace-nowrap">Email</th>
                <th className="px-4 py-2 font-normal whitespace-nowrap">Téléphone</th>
                <th className="px-4 py-2 font-normal whitespace-nowrap">Rôle</th>
                <th className="px-4 py-2 font-normal whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border/50 group hover:bg-gray-50 dark:hover:bg-gray-800/20">
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{user.phone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      user.role === 'Admin' ? 'bg-primary-light text-primary' :
                      user.role === 'Observateur' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-10 whitespace-nowrap">
                    <div className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <MembreModal user={{ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role as any, phone: user.phone || '' }} />
                      <form action={async () => {
                        "use server";
                        const { deleteUser } = await import("@/app/actions");
                        await deleteUser(user.id);
                      }}>
                        <button type="submit" className="text-gray-400 hover:text-red-500" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">Aucun membre trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <MembreModal />
        </div>
      </section>
    </div>
  );
}
