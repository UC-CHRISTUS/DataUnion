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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ajustes_tecnologias: {
        Row: {
          AT: string | null
          codigo: string | null
          codigo_convenio: string | null
          id: number
          valor: number | null
          valor_reajuste_1: number | null
          valor_reajuste_2: number | null
        }
        Insert: {
          AT?: string | null
          codigo?: string | null
          codigo_convenio?: string | null
          id?: number
          valor?: number | null
          valor_reajuste_1?: number | null
          valor_reajuste_2?: number | null
        }
        Update: {
          AT?: string | null
          codigo?: string | null
          codigo_convenio?: string | null
          id?: number
          valor?: number | null
          valor_reajuste_1?: number | null
          valor_reajuste_2?: number | null
        }
        Relationships: []
      }
      episodio_AT: {
        Row: {
          id: number
          id_AT: number
          n_episodio: number
        }
        Insert: {
          id?: number
          id_AT: number
          n_episodio: number
        }
        Update: {
          id?: number
          id_AT?: number
          n_episodio?: number
        }
        Relationships: [
          {
            foreignKeyName: "episodio_AT_id_AT_fkey"
            columns: ["id_AT"]
            isOneToOne: false
            referencedRelation: "ajustes_tecnologias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodio_AT_n_episodio_fkey"
            columns: ["n_episodio"]
            isOneToOne: false
            referencedRelation: "grd_fila"
            referencedColumns: ["episodio"]
          },
        ]
      }
      grd_fila: {
        Row: {
          AT: boolean | null
          AT_detalle: string | null
          centro: string | null
          convenio: string | null
          dias_demora_rescate_hospital: number | null
          dias_estadia: number | null
          documentacion: string | null
          episodio: number
          estado: Database["public"]["Enums"]["workflow_estado"]
          estado_rn: string | null
          fecha_alta: string | null
          fecha_ingreso: string | null
          grupo_dentro_norma: boolean | null
          id: number
          id_grd_oficial: number
          "inlier/outlier": string | null
          "IR-GRD": string | null
          monto_AT: number | null
          monto_final: number | null
          monto_rn: number | null
          n_folio: string | null
          nombre_paciente: string | null
          pago_demora_rescate: number | null
          pago_outlier_superior: number | null
          peso: number | null
          precio_base_tramo: number | null
          rut_paciente: string | null
          servicios_alta: string | null
          tipo_alta: string | null
          tipo_episodio: string | null
          validado: boolean | null
          valor_GRD: number | null
        }
        Insert: {
          AT?: boolean | null
          AT_detalle?: string | null
          centro?: string | null
          convenio?: string | null
          dias_demora_rescate_hospital?: number | null
          dias_estadia?: number | null
          documentacion?: string | null
          episodio: number
          estado?: Database["public"]["Enums"]["workflow_estado"]
          estado_rn?: string | null
          fecha_alta?: string | null
          fecha_ingreso?: string | null
          grupo_dentro_norma?: boolean | null
          id?: number
          id_grd_oficial: number
          "inlier/outlier"?: string | null
          "IR-GRD"?: string | null
          monto_AT?: number | null
          monto_final?: number | null
          monto_rn?: number | null
          n_folio?: string | null
          nombre_paciente?: string | null
          pago_demora_rescate?: number | null
          pago_outlier_superior?: number | null
          peso?: number | null
          precio_base_tramo?: number | null
          rut_paciente?: string | null
          servicios_alta?: string | null
          tipo_alta?: string | null
          tipo_episodio?: string | null
          validado?: boolean | null
          valor_GRD?: number | null
        }
        Update: {
          AT?: boolean | null
          AT_detalle?: string | null
          centro?: string | null
          convenio?: string | null
          dias_demora_rescate_hospital?: number | null
          dias_estadia?: number | null
          documentacion?: string | null
          episodio?: number
          estado?: Database["public"]["Enums"]["workflow_estado"]
          estado_rn?: string | null
          fecha_alta?: string | null
          fecha_ingreso?: string | null
          grupo_dentro_norma?: boolean | null
          id?: number
          id_grd_oficial?: number
          "inlier/outlier"?: string | null
          "IR-GRD"?: string | null
          monto_AT?: number | null
          monto_final?: number | null
          monto_rn?: number | null
          n_folio?: string | null
          nombre_paciente?: string | null
          pago_demora_rescate?: number | null
          pago_outlier_superior?: number | null
          peso?: number | null
          precio_base_tramo?: number | null
          rut_paciente?: string | null
          servicios_alta?: string | null
          tipo_alta?: string | null
          tipo_episodio?: string | null
          validado?: boolean | null
          valor_GRD?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grd_fila_episodio_fkey"
            columns: ["episodio"]
            isOneToOne: true
            referencedRelation: "sigesa_fila"
            referencedColumns: ["episodio_CMBD"]
          },
          {
            foreignKeyName: "grd_fila_id_grd_oficial_fkey"
            columns: ["id_grd_oficial"]
            isOneToOne: false
            referencedRelation: "grd_oficial"
            referencedColumns: ["id"]
          },
        ]
      }
      grd_oficial: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      montos_dias_espera: {
        Row: {
          codigo_convenio: string | null
          fecha_admision: string | null
          fecha_fin: string | null
          id: number
          precio: number | null
        }
        Insert: {
          codigo_convenio?: string | null
          fecha_admision?: string | null
          fecha_fin?: string | null
          id?: number
          precio?: number | null
        }
        Update: {
          codigo_convenio?: string | null
          fecha_admision?: string | null
          fecha_fin?: string | null
          id?: number
          precio?: number | null
        }
        Relationships: []
      }
      norma_minsal: {
        Row: {
          altas_depu: number | null
          est_media: number | null
          exitus: number | null
          gravedad: number | null
          GRD: number
          id: number
          n_outliers_sup: number | null
          percentil_25: number | null
          percentil_75: number | null
          peso_total: number | null
          peso_total_depu: number | null
          punto_corte_inferior: number | null
          punto_corte_superior: number | null
          tab_1430_d_est_med_depu_g: number | null
          tab_1430_d_num_out_inf_g: number | null
          tab_1430_d_perct_50_g: number | null
          tipo_GRD: string | null
          total_altas: number | null
          total_est: number | null
          total_est_depu: number | null
        }
        Insert: {
          altas_depu?: number | null
          est_media?: number | null
          exitus?: number | null
          gravedad?: number | null
          GRD: number
          id?: number
          n_outliers_sup?: number | null
          percentil_25?: number | null
          percentil_75?: number | null
          peso_total?: number | null
          peso_total_depu?: number | null
          punto_corte_inferior?: number | null
          punto_corte_superior?: number | null
          tab_1430_d_est_med_depu_g?: number | null
          tab_1430_d_num_out_inf_g?: number | null
          tab_1430_d_perct_50_g?: number | null
          tipo_GRD?: string | null
          total_altas?: number | null
          total_est?: number | null
          total_est_depu?: number | null
        }
        Update: {
          altas_depu?: number | null
          est_media?: number | null
          exitus?: number | null
          gravedad?: number | null
          GRD?: number
          id?: number
          n_outliers_sup?: number | null
          percentil_25?: number | null
          percentil_75?: number | null
          peso_total?: number | null
          peso_total_depu?: number | null
          punto_corte_inferior?: number | null
          punto_corte_superior?: number | null
          tab_1430_d_est_med_depu_g?: number | null
          tab_1430_d_num_out_inf_g?: number | null
          tab_1430_d_perct_50_g?: number | null
          tipo_GRD?: string | null
          total_altas?: number | null
          total_est?: number | null
          total_est_depu?: number | null
        }
        Relationships: []
      }
      precios_convenios_grd: {
        Row: {
          aseguradora: number | null
          convenio: string | null
          descr_convenio: string | null
          fecha_admision: string | null
          fecha_fin: string | null
          id: number
          nombre_aseguradora: string | null
          precio: number | null
          tipo_aseguradora: string | null
          tipo_convenio: string | null
          tramo: string | null
        }
        Insert: {
          aseguradora?: number | null
          convenio?: string | null
          descr_convenio?: string | null
          fecha_admision?: string | null
          fecha_fin?: string | null
          id?: number
          nombre_aseguradora?: string | null
          precio?: number | null
          tipo_aseguradora?: string | null
          tipo_convenio?: string | null
          tramo?: string | null
        }
        Update: {
          aseguradora?: number | null
          convenio?: string | null
          descr_convenio?: string | null
          fecha_admision?: string | null
          fecha_fin?: string | null
          id?: number
          nombre_aseguradora?: string | null
          precio?: number | null
          tipo_aseguradora?: string | null
          tipo_convenio?: string | null
          tramo?: string | null
        }
        Relationships: []
      }
      sigesa: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      sigesa_fila: {
        Row: {
          año: number | null
          casos_norma_ir: number | null
          conjunto_dx: string | null
          conjunto_procedimientos_secundarios: string | null
          conjunto_servicios_traslado: string | null
          convenio_des: string | null
          convenios_cod: string | null
          created_at: string
          diagnostico_principal: string | null
          edad: number | null
          em_norma_ir: number | null
          em_post_quirurgica: number | null
          em_pre_quirurgica: number | null
          em_traslados_servicios: number | null
          emaf_ir_bruta: string | null
          episodio_CMBD: number
          especialidad_medica_intervencion: string | null
          especialidad_servicio_egreso: string | null
          estancia_episodio: number | null
          estancia_media: number | null
          estancia_real_episodio: number | null
          estancias_norma_ir: number | null
          estancias_postquirurgicas_int: number | null
          "estancias_prequirurgicas_int _episodio": number | null
          facturacion_total_episodio: number | null
          fecha_completa_egreso: string | null
          fecha_ingreso_completa: string | null
          fecha_tr1: string | null
          fecha_tr10: string | null
          fecha_tr2: string | null
          fecha_tr3: string | null
          fecha_tr4: string | null
          fecha_tr5: string | null
          fecha_tr6: string | null
          fecha_tr7: string | null
          fecha_tr8: string | null
          fecha_tr9: string | null
          horas_estancia: number | null
          hospital_descripcion: string | null
          id: number
          id_archivo_sigesa: number
          id_derivacion: string | null
          iema_ir_bruto: number | null
          impacto_estancias_evitables_brutas: number | null
          ir_alta_inlier_outlier: string | null
          ir_gravedad_desc: string | null
          ir_grd: string | null
          ir_grd_codigo: number | null
          ir_mortalidad_desc: string | null
          ir_punto_corte_inferior: number | null
          ir_punto_corte_superior: number | null
          ir_tipo_grd: string | null
          ley_cod: string | null
          ley_desc: string | null
          medico_alta_id: string | null
          medico_egreso: string | null
          mes_numero: number | null
          motivo_egreso: string | null
          nombre: string | null
          peso_grd_medio_todos: number | null
          peso_medio_norma_ir: number | null
          prevision_2_cod: string | null
          prevision_2_desc: string | null
          prevision_codigo: string | null
          prevision_desc: string | null
          proced_01_principal: number | null
          rut: string | null
          "servicio_cod_ tr1": string | null
          "servicio_cod_ tr10": string | null
          "servicio_cod_ tr2": string | null
          "servicio_cod_ tr3": string | null
          "servicio_cod_ tr4": string | null
          "servicio_cod_ tr5": string | null
          "servicio_cod_ tr6": string | null
          "servicio_cod_ tr7": string | null
          "servicio_cod_ tr8": string | null
          "servicio_cod_ tr9": string | null
          servicio_egreso_codigo: string | null
          servicio_egreso_codigo_3: string | null
          servicio_egreso_descripcion: string | null
          servicio_ingreso_codigo: string | null
          servicio_ingreso_codigo_2: string | null
          servicio_ingreso_descripcion: string | null
          servicio_salud_cod: string | null
          servicio_salud_des: string | null
          sexo: string | null
          tipo_actividad: string | null
          tipo_actividad_1: string | null
          tipo_ingreso_descripcion: string | null
        }
        Insert: {
          año?: number | null
          casos_norma_ir?: number | null
          conjunto_dx?: string | null
          conjunto_procedimientos_secundarios?: string | null
          conjunto_servicios_traslado?: string | null
          convenio_des?: string | null
          convenios_cod?: string | null
          created_at?: string
          diagnostico_principal?: string | null
          edad?: number | null
          em_norma_ir?: number | null
          em_post_quirurgica?: number | null
          em_pre_quirurgica?: number | null
          em_traslados_servicios?: number | null
          emaf_ir_bruta?: string | null
          episodio_CMBD: number
          especialidad_medica_intervencion?: string | null
          especialidad_servicio_egreso?: string | null
          estancia_episodio?: number | null
          estancia_media?: number | null
          estancia_real_episodio?: number | null
          estancias_norma_ir?: number | null
          estancias_postquirurgicas_int?: number | null
          "estancias_prequirurgicas_int _episodio"?: number | null
          facturacion_total_episodio?: number | null
          fecha_completa_egreso?: string | null
          fecha_ingreso_completa?: string | null
          fecha_tr1?: string | null
          fecha_tr10?: string | null
          fecha_tr2?: string | null
          fecha_tr3?: string | null
          fecha_tr4?: string | null
          fecha_tr5?: string | null
          fecha_tr6?: string | null
          fecha_tr7?: string | null
          fecha_tr8?: string | null
          fecha_tr9?: string | null
          horas_estancia?: number | null
          hospital_descripcion?: string | null
          id?: number
          id_archivo_sigesa: number
          id_derivacion?: string | null
          iema_ir_bruto?: number | null
          impacto_estancias_evitables_brutas?: number | null
          ir_alta_inlier_outlier?: string | null
          ir_gravedad_desc?: string | null
          ir_grd?: string | null
          ir_grd_codigo?: number | null
          ir_mortalidad_desc?: string | null
          ir_punto_corte_inferior?: number | null
          ir_punto_corte_superior?: number | null
          ir_tipo_grd?: string | null
          ley_cod?: string | null
          ley_desc?: string | null
          medico_alta_id?: string | null
          medico_egreso?: string | null
          mes_numero?: number | null
          motivo_egreso?: string | null
          nombre?: string | null
          peso_grd_medio_todos?: number | null
          peso_medio_norma_ir?: number | null
          prevision_2_cod?: string | null
          prevision_2_desc?: string | null
          prevision_codigo?: string | null
          prevision_desc?: string | null
          proced_01_principal?: number | null
          rut?: string | null
          "servicio_cod_ tr1"?: string | null
          "servicio_cod_ tr10"?: string | null
          "servicio_cod_ tr2"?: string | null
          "servicio_cod_ tr3"?: string | null
          "servicio_cod_ tr4"?: string | null
          "servicio_cod_ tr5"?: string | null
          "servicio_cod_ tr6"?: string | null
          "servicio_cod_ tr7"?: string | null
          "servicio_cod_ tr8"?: string | null
          "servicio_cod_ tr9"?: string | null
          servicio_egreso_codigo?: string | null
          servicio_egreso_codigo_3?: string | null
          servicio_egreso_descripcion?: string | null
          servicio_ingreso_codigo?: string | null
          servicio_ingreso_codigo_2?: string | null
          servicio_ingreso_descripcion?: string | null
          servicio_salud_cod?: string | null
          servicio_salud_des?: string | null
          sexo?: string | null
          tipo_actividad?: string | null
          tipo_actividad_1?: string | null
          tipo_ingreso_descripcion?: string | null
        }
        Update: {
          año?: number | null
          casos_norma_ir?: number | null
          conjunto_dx?: string | null
          conjunto_procedimientos_secundarios?: string | null
          conjunto_servicios_traslado?: string | null
          convenio_des?: string | null
          convenios_cod?: string | null
          created_at?: string
          diagnostico_principal?: string | null
          edad?: number | null
          em_norma_ir?: number | null
          em_post_quirurgica?: number | null
          em_pre_quirurgica?: number | null
          em_traslados_servicios?: number | null
          emaf_ir_bruta?: string | null
          episodio_CMBD?: number
          especialidad_medica_intervencion?: string | null
          especialidad_servicio_egreso?: string | null
          estancia_episodio?: number | null
          estancia_media?: number | null
          estancia_real_episodio?: number | null
          estancias_norma_ir?: number | null
          estancias_postquirurgicas_int?: number | null
          "estancias_prequirurgicas_int _episodio"?: number | null
          facturacion_total_episodio?: number | null
          fecha_completa_egreso?: string | null
          fecha_ingreso_completa?: string | null
          fecha_tr1?: string | null
          fecha_tr10?: string | null
          fecha_tr2?: string | null
          fecha_tr3?: string | null
          fecha_tr4?: string | null
          fecha_tr5?: string | null
          fecha_tr6?: string | null
          fecha_tr7?: string | null
          fecha_tr8?: string | null
          fecha_tr9?: string | null
          horas_estancia?: number | null
          hospital_descripcion?: string | null
          id?: number
          id_archivo_sigesa?: number
          id_derivacion?: string | null
          iema_ir_bruto?: number | null
          impacto_estancias_evitables_brutas?: number | null
          ir_alta_inlier_outlier?: string | null
          ir_gravedad_desc?: string | null
          ir_grd?: string | null
          ir_grd_codigo?: number | null
          ir_mortalidad_desc?: string | null
          ir_punto_corte_inferior?: number | null
          ir_punto_corte_superior?: number | null
          ir_tipo_grd?: string | null
          ley_cod?: string | null
          ley_desc?: string | null
          medico_alta_id?: string | null
          medico_egreso?: string | null
          mes_numero?: number | null
          motivo_egreso?: string | null
          nombre?: string | null
          peso_grd_medio_todos?: number | null
          peso_medio_norma_ir?: number | null
          prevision_2_cod?: string | null
          prevision_2_desc?: string | null
          prevision_codigo?: string | null
          prevision_desc?: string | null
          proced_01_principal?: number | null
          rut?: string | null
          "servicio_cod_ tr1"?: string | null
          "servicio_cod_ tr10"?: string | null
          "servicio_cod_ tr2"?: string | null
          "servicio_cod_ tr3"?: string | null
          "servicio_cod_ tr4"?: string | null
          "servicio_cod_ tr5"?: string | null
          "servicio_cod_ tr6"?: string | null
          "servicio_cod_ tr7"?: string | null
          "servicio_cod_ tr8"?: string | null
          "servicio_cod_ tr9"?: string | null
          servicio_egreso_codigo?: string | null
          servicio_egreso_codigo_3?: string | null
          servicio_egreso_descripcion?: string | null
          servicio_ingreso_codigo?: string | null
          servicio_ingreso_codigo_2?: string | null
          servicio_ingreso_descripcion?: string | null
          servicio_salud_cod?: string | null
          servicio_salud_des?: string | null
          sexo?: string | null
          tipo_actividad?: string | null
          tipo_actividad_1?: string | null
          tipo_ingreso_descripcion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sigesa_fila_id_archivo_sigesa_fkey"
            columns: ["id_archivo_sigesa"]
            isOneToOne: false
            referencedRelation: "sigesa"
            referencedColumns: ["id"]
          },
        ]
      }
      tramos_peso_grd: {
        Row: {
          id: number
          limite_inferior: number | null
          limite_superior: number | null
          tramo: string | null
        }
        Insert: {
          id?: number
          limite_inferior?: number | null
          limite_superior?: number | null
          tramo?: string | null
        }
        Update: {
          id?: number
          limite_inferior?: number | null
          limite_superior?: number | null
          tramo?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          must_change_password: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          must_change_password?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          must_change_password?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      user_role: "admin" | "encoder" | "finance"
      workflow_estado:
        | "borrador_encoder"
        | "pendiente_finance"
        | "borrador_finance"
        | "pendiente_admin"
        | "aprobado"
        | "exportado"
        | "rechazado"
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
      user_role: ["admin", "encoder", "finance"],
      workflow_estado: [
        "borrador_encoder",
        "pendiente_finance",
        "borrador_finance",
        "pendiente_admin",
        "aprobado",
        "exportado",
        "rechazado",
      ],
    },
  },
} as const
