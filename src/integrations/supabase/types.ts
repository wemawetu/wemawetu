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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          end_date: string | null
          id: string
          priority: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          end_date?: string | null
          id?: string
          priority?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          end_date?: string | null
          id?: string
          priority?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_donations: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          net_amount: number
          payment_method: string
          payment_reference: string | null
          payment_status: string
          platform_fee: number
          receipt_url: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          net_amount?: number
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          platform_fee?: number
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          net_amount?: number
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          platform_fee?: number
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          category: string
          created_at: string
          description: string
          donor_count: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          mpesa_phone: string
          raised_amount: number
          rejection_reason: string | null
          slug: string
          status: string
          story: string | null
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          donor_count?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          mpesa_phone: string
          raised_amount?: number
          rejection_reason?: string | null
          slug: string
          status?: string
          story?: string | null
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          donor_count?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          mpesa_phone?: string
          raised_amount?: number
          rejection_reason?: string | null
          slug?: string
          status?: string
          story?: string | null
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          active: boolean | null
          created_at: string
          icon: string | null
          id: string
          label: string
          sort_order: number | null
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          sort_order?: number | null
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number | null
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string | null
        }
        Relationships: []
      }
      crypto_config: {
        Row: {
          active: boolean | null
          coin_name: string
          coin_symbol: string
          contract_address: string
          created_at: string
          description: string | null
          how_to_buy: string | null
          id: string
          logo_url: string | null
          network: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          coin_name: string
          coin_symbol: string
          contract_address: string
          created_at?: string
          description?: string | null
          how_to_buy?: string | null
          id?: string
          logo_url?: string | null
          network?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          coin_name?: string
          coin_symbol?: string
          contract_address?: string
          created_at?: string
          description?: string | null
          how_to_buy?: string | null
          id?: string
          logo_url?: string | null
          network?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      email_config: {
        Row: {
          created_at: string
          enabled: boolean | null
          from_email: string | null
          from_name: string | null
          id: string
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      impact_stats: {
        Row: {
          active: boolean | null
          color: string
          created_at: string
          icon: string
          id: string
          label: string
          sort_order: number | null
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean | null
          color?: string
          created_at?: string
          icon: string
          id?: string
          label: string
          sort_order?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean | null
          color?: string
          created_at?: string
          icon?: string
          id?: string
          label?: string
          sort_order?: number | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      merchandise: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          impact_message: string | null
          name: string
          price: number
          sort_order: number | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          impact_message?: string | null
          name: string
          price: number
          sort_order?: number | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          impact_message?: string | null
          name?: string
          price?: number
          sort_order?: number | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_status: string
          payment_method: string
          payment_reference: string | null
          payment_status: string
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_fee: number
          subtotal: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          order_status?: string
          payment_method: string
          payment_reference?: string | null
          payment_status?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_fee?: number
          subtotal: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_status?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_fee?: number
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_config: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          display_name: string
          enabled: boolean | null
          icon: string | null
          id: string
          provider: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          enabled?: boolean | null
          icon?: string | null
          id?: string
          provider: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          enabled?: boolean | null
          icon?: string | null
          id?: string
          provider?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          icon: string
          id: string
          image_url: string | null
          link: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          icon?: string
          id?: string
          image_url?: string | null
          link?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          image_url?: string | null
          link?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          id: string
          mpesa_phone: string
          processed_at: string | null
          rejection_reason: string | null
          status: string
          transaction_reference: string | null
          user_id: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          id?: string
          mpesa_phone: string
          processed_at?: string | null
          rejection_reason?: string | null
          status?: string
          transaction_reference?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          id?: string
          mpesa_phone?: string
          processed_at?: string | null
          rejection_reason?: string | null
          status?: string
          transaction_reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
