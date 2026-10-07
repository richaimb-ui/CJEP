import { supabase } from "../data/supabase";

export async function getDashboardStats() {
  const [
    { data: incomesData },
    { data: expensesData },
    { data: orgData },
    { data: pendingData },
    { data: contributorsData },
    { data: pledgesData }
  ] = await Promise.all([
    supabase.from('incomes').select('*').eq('status', 'Actif'),
    supabase.from('expenses').select('*').eq('status', 'Validée'),
    supabase.from('organization').select('*').limit(1).maybeSingle(),
    supabase.from('expenses').select('*, students(firstName, lastName)').eq('status', 'En attente'),
    supabase.from('contributors').select('*').eq('status', 'Actif'),
    supabase.from('pledges').select('*')
  ]);

  const incomes = incomesData || [];
  const expenses = expensesData || [];
  const openingBalance = orgData?.openingBalance || 0;

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalIncomesWithOpening = incomes.reduce((sum, inc) => sum + inc.amount, 0) + openingBalance;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const currentBalance = totalIncomesWithOpening - totalExpenses;

  const thisMonthIncomes = incomes
    .filter(i => i.receivedOn && i.receivedOn.startsWith(currentMonthPrefix))
    .reduce((sum, inc) => sum + inc.amount, 0);
    
  const thisMonthExpenses = expenses
    .filter(i => i.spentOn && i.spentOn.startsWith(currentMonthPrefix))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const pendingExpenses = (pendingData || []).map(e => {
    const student = e.students;
    return {
      ...e,
      beneficiary: student ? `${student.firstName} ${student.lastName}` : "Général"
    };
  });

  const contributors = contributorsData || [];
  const pledges = pledgesData || [];
  const cotisations = incomes.filter(i => i.type === 'Cotisation');
  const currentDate = new Date();
  
  const lateContributors: { id: string; name: string; role: string; monthsStr: string; amountOwed: number }[] = [];
  const moisNoms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  contributors.forEach(c => {
    const pledge = pledges.find(p => p.contributorId === c.id);
    if (!pledge) return;
    
    const startD = new Date(`${pledge.startMonth}-01`);
    const monthsOwed: string[] = [];
    let amountOwed = 0;
    
    // Check from start month up to current month
    while (startD <= currentDate) {
      const iterYear = startD.getFullYear();
      const iterMonth = String(startD.getMonth() + 1).padStart(2, '0');
      const monthPrefix = `${iterYear}-${iterMonth}`;
      
      const paid = cotisations.some(inc => inc.contributorId === c.id && inc.receivedOn.startsWith(monthPrefix));
      
      if (!paid) {
        monthsOwed.push(moisNoms[startD.getMonth()]);
        amountOwed += pledge.monthlyAmount;
      }
      
      startD.setMonth(startD.getMonth() + 1);
    }

    if (monthsOwed.length > 0) {
      lateContributors.push({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        role: c.role,
        monthsStr: monthsOwed.slice(-3).join(', ') + (monthsOwed.length > 3 ? '...' : ''), // show at most 3
        amountOwed
      });
    }
  });

  // Taux de recouvrement
  const totalCotisationsRecues = cotisations.reduce((acc, c) => acc + c.amount, 0);
  const totalExpected = pledges.reduce((acc, p) => acc + (p.monthlyAmount * (currentDate.getMonth() + 1)), 0); // Simplified expected computation
  const recoveryRate = totalExpected > 0 ? Math.round((totalCotisationsRecues / totalExpected) * 100) : 0;

  return {
    currentBalance,
    totalIncomes: totalIncomesWithOpening,
    thisMonthIncomes,
    thisMonthExpenses,
    pendingExpenses,
    lateContributors,
    recoveryRate,
    rawIncomes: incomes,
    rawExpenses: expenses
  };
}
