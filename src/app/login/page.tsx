"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/data/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user must change password
      const { data: userData } = await supabase
        .from('users')
        .select('mustChangePassword')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (userData?.mustChangePassword) {
        toast.info("Vous devez changer votre mot de passe.");
        router.push("/change-password");
      } else {
        toast.success("Connexion réussie !");
        router.push("/tableau-de-bord");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Email ou mot de passe incorrect");
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
          {/* Overlay gradient & text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
            <div className="flex items-center gap-2 mb-8 absolute top-8 left-8">
               <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                 <span className="text-black font-bold text-xl">C</span>
               </div>
               <span className="font-bold text-xl tracking-wide">COMITÉ JOSEPH</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 leading-tight">
               &quot;Ta parole est une lampe à mes pieds,&quot;<br/>
               &quot;Et une lumière sur mon sentier.&quot;
            </h2>
            <div>
              <p className="font-medium text-lg">Psaumes 119:105</p>
              <p className="text-white/70 text-sm">Pour les Etudes Pastorales</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
          
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
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bienvenue</h1>
              <p className="text-gray-500">Gérez vos contributeurs, étudiants et flux financiers facilement.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
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
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                  Se souvenir de moi
                </label>
                <Link href="#" className="text-sm font-medium text-primary hover:text-primary-hover">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#635BFF] hover:bg-[#524ae3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {isPending ? "Connexion en cours..." : "Se connecter"}
              </button>

              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OU</span>
                </div>
              </div>

              <button type="button" className="mt-8 w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all">
                <Image className="mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
                Continuer avec Google
              </button>

            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Vous n&apos;avez pas de compte ? <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">Créez-en un</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
