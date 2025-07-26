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
      // Add your table definitions here
      // Example:
      // profiles: {
      //   Row: {
      //     id: string
      //     username: string | null
      //     created_at: string
      //   }
      //   Insert: {
      //     id: string
      //     username?: string | null
      //     created_at?: string
      //   }
      //   Update: {
      //     id?: string
      //     username?: string | null
      //     created_at?: string
      //   }
      // }
    }
    Views: {
      // Add your view definitions here
    }
    Functions: {
      // Add your function definitions here
    }
    Enums: {
      // Add your enum definitions here
    }
    CompositeTypes: {
      // Add your composite type definitions here
    }
  }
}