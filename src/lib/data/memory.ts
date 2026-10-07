import { Contributor, Expense, Income, Organization, Student, Pledge, User } from "../domain/models";

// Define the global database structure
type MockDatabase = {
  organization: Organization;
  contributors: Contributor[];
  pledges: Pledge[];
  students: Student[];
  incomes: Income[];
  expenses: Expense[];
  users: User[];
};

// Initialize the global store (survives Next.js fast refresh)
const globalForDb = globalThis as unknown as { mockDb: MockDatabase };

if (!globalForDb.mockDb) {
  globalForDb.mockDb = {
    organization: {
      id: "org-1",
      name: "CJEP Asso",
      currency: "FCFA",
      dueDay: 10,
      openingBalance: 0,
    },
    contributors: [
      { id: "c1", firstName: "Jean", lastName: "Dupont", phone: "01 02 03 04 05", email: "jean@example.com", isActive: true },
      { id: "c2", firstName: "Marie", lastName: "Curie", phone: "02 03 04 05 06", email: "marie@example.com", isActive: true },
    ],
    pledges: [
      { id: "p1", contributorId: "c1", monthlyAmount: 10000, startMonth: "2026-01", endMonth: null },
      { id: "p2", contributorId: "c2", monthlyAmount: 5000, startMonth: "2026-01", endMonth: null },
    ],
    students: [
      { id: "s1", fullName: "Marc Antoine", school: "Faculté de Théologie", program: "Licence 1", cohort: "2024-2027", status: "Actif" },
    ],
    incomes: [
      { id: "inc1", ref: "ENT-2026-0001", type: "Cotisation", contributorId: "c1", sourceName: null, amount: 20000, receivedOn: "2026-10-01", status: "Actif" },
      { id: "inc2", ref: "ENT-2026-0002", type: "Don", contributorId: null, sourceName: "Anonyme", amount: 50000, receivedOn: "2026-10-05", status: "Actif" },
    ],
    expenses: [
      { id: "exp1", ref: "DEP-2026-0001", category: "Frais de scolarité", studentId: "s1", amount: 10000, spentOn: "2026-10-02", status: "Validée" },
      { id: "exp2", ref: "DEP-2026-0002", category: "Transport", studentId: null, amount: 5000, spentOn: "2026-10-06", status: "En attente" },
    ],
    users: [
      { id: "u1", name: "Daniel Morales", email: "daniel@example.com", role: "Admin" }
    ]
  };
}

// Ensure users array exists for hot reloads where db was already initialized
if (!globalForDb.mockDb.users) {
  globalForDb.mockDb.users = [
    { id: "u1", name: "Daniel Morales", email: "daniel@example.com", role: "Admin" }
  ];
}

export const db = globalForDb.mockDb;
