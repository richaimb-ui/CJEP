"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function YearSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear().toString();
  const selectedYear = searchParams.get("annee") || currentYear;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("annee", year);
    router.push(`?${params.toString()}`);
  };

  return (
    <select 
      value={selectedYear} 
      onChange={handleChange}
      className="bg-card border border-border rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
    >
      <option value="2024">Année 2024</option>
      <option value="2025">Année 2025</option>
      <option value="2026">Année 2026</option>
      <option value="2027">Année 2027</option>
    </select>
  );
}
