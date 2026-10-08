export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          firstName: string
          lastName: string
          email: string
          phone?: string
          role: string
          mustChangePassword?: boolean
        }
        Insert: {
          id?: string
          firstName: string
          lastName: string
          email: string
          phone?: string
          role: string
          mustChangePassword?: boolean
        }
        Update: {
          id?: string
          firstName?: string
          lastName?: string
          email?: string
          phone?: string
          role?: string
          mustChangePassword?: boolean
        }
        Relationships: []
      }
      contributors: {
        Row: {
          id: string
          firstName: string
          lastName: string
          role: string
          status: string
          joinedAt: string
          email?: string
          phone?: string
          avatar?: string
        }
        Insert: {
          id?: string
          firstName: string
          lastName: string
          role: string
          status: string
          joinedAt: string
          email?: string
          phone?: string
          avatar?: string
        }
        Update: {
          id?: string
          firstName?: string
          lastName?: string
          role?: string
          status?: string
          joinedAt?: string
          email?: string
          phone?: string
          avatar?: string
        }
        Relationships: []
      }
      pledges: {
        Row: {
          id: string
          contributorId: string
          monthlyAmount: number
          startMonth: string
          createdAt: string
        }
        Insert: {
          id?: string
          contributorId: string
          monthlyAmount: number
          startMonth: string
          createdAt?: string
        }
        Update: {
          id?: string
          contributorId?: string
          monthlyAmount?: number
          startMonth?: string
          createdAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledges_contributorId_fkey"
            columns: ["contributorId"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          }
        ]
      }
      students: {
        Row: {
          id: string
          firstName: string
          lastName: string
          field: string
          level: string
          status: string
          scholarshipAmount: number
          avatar?: string
        }
        Insert: {
          id?: string
          firstName: string
          lastName: string
          field: string
          level: string
          status: string
          scholarshipAmount: number
          avatar?: string
        }
        Update: {
          id?: string
          firstName?: string
          lastName?: string
          field?: string
          level?: string
          status?: string
          scholarshipAmount?: number
          avatar?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          id: string
          ref: string
          sourceName: string
          contributorId?: string
          type: string
          amount: number
          receivedOn: string
          status: string
          createdBy: string
        }
        Insert: {
          id?: string
          ref: string
          sourceName: string
          contributorId?: string
          type: string
          amount: number
          receivedOn: string
          status: string
          createdBy: string
        }
        Update: {
          id?: string
          ref?: string
          sourceName?: string
          contributorId?: string
          type?: string
          amount?: number
          receivedOn?: string
          status?: string
          createdBy?: string
        }
        Relationships: [
          {
            foreignKeyName: "incomes_contributorId_fkey"
            columns: ["contributorId"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          ref: string
          category: string
          studentId?: string
          amount: number
          spentOn: string
          status: string
          createdBy: string
        }
        Insert: {
          id?: string
          ref: string
          category: string
          studentId?: string
          amount: number
          spentOn: string
          status: string
          createdBy: string
        }
        Update: {
          id?: string
          ref?: string
          category?: string
          studentId?: string
          amount?: number
          spentOn?: string
          status?: string
          createdBy?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          }
        ]
      }
      organization: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          openingBalance: number
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          openingBalance: number
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          openingBalance?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
