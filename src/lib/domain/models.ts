export type Organization = {
  id: string;
  name: string;
  currency: string;
  dueDay: number;
  openingBalance: number;
};

export type Contributor = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isActive: boolean;
};

export type Pledge = {
  id: string;
  contributorId: string;
  monthlyAmount: number;
  startMonth: string; // YYYY-MM
  endMonth: string | null;
};

export type Student = {
  id: string;
  fullName: string;
  school: string;
  program: string;
  cohort: string;
  status: 'Actif' | 'Diplômé' | 'Suspendu' | 'Abandon';
};

export type Income = {
  id: string;
  ref: string;
  type: string;
  contributorId?: string | null;
  sourceName?: string | null;
  amount: number;
  receivedOn: string; // YYYY-MM-DD
  status: string;
  createdBy?: string;
};

export type Expense = {
  id: string;
  ref: string;
  category: string;
  studentId?: string | null;
  amount: number;
  spentOn: string;
  status: string;
  createdBy?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Membre' | 'Observateur';
  password?: string;
  mustChangePassword?: boolean;
};
