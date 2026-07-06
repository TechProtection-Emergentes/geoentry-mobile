export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_inference_logs: {
        Row: {
          ai_confidence: number | null
          ai_response: Json
          context_snapshot: Json
          created_at: string | null
          id: string
          proximity_event_id: string | null
          raw_prompt: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_response: Json
          context_snapshot: Json
          created_at?: string | null
          id?: string
          proximity_event_id?: string | null
          raw_prompt: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_response?: Json
          context_snapshot?: Json
          created_at?: string | null
          id?: string
          proximity_event_id?: string | null
          raw_prompt?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_inference_logs_proximity_event_id_fkey"
            columns: ["proximity_event_id"]
            isOneToOne: false
            referencedRelation: "proximity_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_inference_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string | null
          id: string
          name: string
          profile_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          profile_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          profile_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          profile_id: string | null
          radius: number
        }
        Insert: {
          address?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name?: string
          profile_id?: string | null
          radius?: number
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          profile_id?: string | null
          radius?: number
        }
        Relationships: [
          {
            foreignKeyName: "locations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proximity_events: {
        Row: {
          created_at: string | null
          device_id: string | null
          distance: number
          home_location_id: string
          home_location_name: string
          id: string
          latitude: number
          longitude: number
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          distance: number
          home_location_id: string
          home_location_name: string
          id?: string
          latitude: number
          longitude: number
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          distance?: number
          home_location_id?: string
          home_location_name?: string
          id?: string
          latitude?: number
          longitude?: number
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_proximity_events_device"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_proximity_events_location"
            columns: ["home_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_proximity_events_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          created_at: string | null
          id: string
          isActive: boolean
          name: string
          sensor_type: Database["public"]["Enums"]["device_type_enum"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          isActive: boolean
          name: string
          sensor_type: Database["public"]["Enums"]["device_type_enum"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          isActive?: boolean
          name?: string
          sensor_type?: Database["public"]["Enums"]["device_type_enum"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback_loops: {
        Row: {
          created_at: string | null
          feedback_action: Database["public"]["Enums"]["feedback_action_enum"]
          id: string
          inference_log_id: string
          override_details: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_action: Database["public"]["Enums"]["feedback_action_enum"]
          id?: string
          inference_log_id: string
          override_details?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_action?: Database["public"]["Enums"]["feedback_action_enum"]
          id?: string
          inference_log_id?: string
          override_details?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_loops_inference_log_id_fkey"
            columns: ["inference_log_id"]
            isOneToOne: false
            referencedRelation: "ai_inference_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_loops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_tracking_data: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      get_latest_device_location: {
        Args: { device_uuid: string }
        Returns: {
          accuracy: number
          altitude: number
          created_at: string
          device_id: string
          heading: number
          id: string
          latitude: number
          location_timestamp: string
          longitude: number
          speed: number
          user_id: string
        }[]
      }
    }
    Enums: {
      device_type_enum:
      | "led_tv"
      | "smart_light"
      | "air_conditioner"
      | "coffee_maker"
      feedback_action_enum: "APPROVED" | "IGNORED" | "MANUAL_OVERRIDE"
      user_role: "USER" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      device_type_enum: [
        "led_tv",
        "smart_light",
        "air_conditioner",
        "coffee_maker",
      ],
      feedback_action_enum: ["APPROVED", "IGNORED", "MANUAL_OVERRIDE"],
      user_role: ["USER", "ADMIN"],
    },
  },
} as const
