"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/data/supabase";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      // Create a user profile in the "users" table manually for prototype if needed, 
      // though usually done via Supabase triggers. We'll do it manually to be safe.
      if (data.user) {
        await supabase.from("users").insert({
          id: data.user.id,
          firstName,
          lastName,
          email,
          role: "Administrateur",
        });
      }

      toast.success("Compte créé avec succès !");
      router.push("/tableau-de-bord");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[80vh] min-h-[600px]">
        
        {/* Left Side: Image */}
        <div className="relative hidden md:block md:w-1/2 h-full">
          <Image 
            src="/login_bg.jpg" 
            alt="Bible and lamp on a table" 
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
            <div className="flex items-center gap-2 mb-8 absolute top-8 left-8">
               <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                 <span className="text-black font-bold text-xl">C</span>
               </div>
               <span className="font-bold text-xl tracking-wide">CJEP</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">
               &quot;Rejoignez notre mission.&quot;
            </h2>
            <div>
              <p className="text-white/70 text-sm">Comité des Jeunes pour l&apos;Éducation et la Paix</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center overflow-y-auto relative">
          {/* Mobile watermark */}
          <div className="absolute inset-0 md:hidden opacity-5 pointer-events-none">
            <Image 
              src="/login_bg.jpg" 
              alt="Watermark" 
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="max-w-md w-full mx-auto relative z-10">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Créer un compte</h1>
              <p className="text-gray-500">Inscrivez-vous pour gérer les finances du comité.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cjep.org"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full mt-6 flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#635BFF] hover:bg-[#524ae3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {isPending ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Vous avez déjà un compte ? <Link href="/login" className="font-medium text-primary hover:text-primary-hover">Connectez-vous</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
