// This file is kept for type definitions but Supabase functionality is disabled

// Mock types for compatibility
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          color: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          color?: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          color?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
          priority: 'low' | 'medium' | 'high' | 'critical';
          start_date: string | null;
          due_date: string | null;
          assignee_id: string | null;
          project_id: string;
          progress: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          start_date?: string | null;
          due_date?: string | null;
          assignee_id?: string | null;
          project_id: string;
          progress?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          start_date?: string | null;
          due_date?: string | null;
          assignee_id?: string | null;
          progress?: number;
          updated_at?: string;
        };
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          completed?: boolean;
        };
      };
      task_tags: {
        Row: {
          id: string;
          task_id: string;
          tag: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          tag: string;
        };
        Update: {
          id?: string;
          tag?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Subtask = Database['public']['Tables']['subtasks']['Row'];
export type TaskTag = Database['public']['Tables']['task_tags']['Row'];

// Mock supabase client for compatibility
export const supabase = {
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Database disabled') }),
    getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Database disabled') }),
    updateUser: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
    onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
        maybeSingle: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
      }),
      order: () => Promise.resolve({ data: [], error: new Error('Database disabled') }),
      limit: () => Promise.resolve({ data: [], error: new Error('Database disabled') }),
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: new Error('Database disabled') }),
    }),
  }),
};