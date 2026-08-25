export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          position: number;
          updated_at: string;
        };
        Insert: {
          color: string;
          created_at?: string;
          id: string;
          name: string;
          position: number;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          position?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          about: string | null;
          color: string;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          name: string;
          position: number | null;
          priority: string | null;
          search_vector: unknown;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          about?: string | null;
          color?: string;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id: string;
          name: string;
          position?: number | null;
          priority?: string | null;
          search_vector?: unknown;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          about?: string | null;
          color?: string;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          name?: string;
          position?: number | null;
          priority?: string | null;
          search_vector?: unknown;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      subtasks: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          done: boolean;
          id: string;
          label: string;
          position: number | null;
          task_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          done?: boolean;
          id: string;
          label: string;
          position?: number | null;
          task_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          done?: boolean;
          id?: string;
          label?: string;
          position?: number | null;
          task_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subtasks_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          category_id: string | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          due_date: string | null;
          end_time: string | null;
          id: string;
          position: number | null;
          priority: string | null;
          project_id: string | null;
          search_vector: unknown;
          start_time: string | null;
          status: Database['public']['Enums']['task_status'];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          end_time?: string | null;
          id: string;
          position?: number | null;
          priority?: string | null;
          project_id?: string | null;
          search_vector?: unknown;
          start_time?: string | null;
          status?: Database['public']['Enums']['task_status'];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          end_time?: string | null;
          id?: string;
          position?: number | null;
          priority?: string | null;
          project_id?: string | null;
          search_vector?: unknown;
          start_time?: string | null;
          status?: Database['public']['Enums']['task_status'];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'project_stats';
            referencedColumns: ['project_id'];
          },
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          theme: string;
          updated_at: string;
          week_start_day: number;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          theme?: string;
          updated_at?: string;
          week_start_day?: number;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          theme?: string;
          updated_at?: string;
          week_start_day?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      project_stats: {
        Row: {
          done_count: number | null;
          due_this_week: number | null;
          progress: number | null;
          project_id: string | null;
          task_count: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      changes_since: {
        Args: { cursor: string };
        Returns: {
          data: Json;
          deleted_at: string;
          id: string;
          kind: string;
          updated_at: string;
        }[];
      };
      purge_soft_deleted: { Args: never; Returns: number };
      search_all: {
        Args: { query: string };
        Returns: {
          id: string;
          kind: string;
          project_id: string;
          rank: number;
          status: string;
          title: string;
        }[];
      };
    };
    Enums: {
      task_status: 'todo' | 'progress' | 'done';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      task_status: ['todo', 'progress', 'done'],
    },
  },
} as const;
