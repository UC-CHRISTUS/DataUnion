'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkflowAlert from '@/components/WorkflowAlert';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [workflowAlert, setWorkflowAlert] = useState<{
    type: 'info' | 'warning' | 'error';
    message: string;
    grdId: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // 1. Obtener sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 2. Obtener rol del usuario
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();

        if (userError || !userData) {
          setLoading(false);
          return;
        }

        setRole(userData.role);

        // 3. Obtener estado del flujo según el rol
        if (userData.role === 'encoder') {
          // Encoder: verificar si hay archivo rechazado
          const { data: grdData } = await supabase
            .from('grd_fila')
            .select('id_grd_oficial, documentacion')
            .eq('estado', 'rechazado')
            .limit(1);

          if (grdData && grdData.length > 0) {
            setWorkflowAlert({
              type: 'error',
              message: `⚠️ Tu archivo fue rechazado. Razón: ${grdData[0].documentacion || 'Contacta al administrador'}`,
              grdId: grdData[0].id_grd_oficial,
            });
          }
        } else if (userData.role === 'finance') {
          // Finance: verificar si hay archivo pendiente
          const { data: grdData } = await supabase
            .from('grd_fila')
            .select('id_grd_oficial')
            .eq('estado', 'pendiente_finance')
            .limit(1);

          if (grdData && grdData.length > 0) {
            setWorkflowAlert({
              type: 'warning',
              message: '🔔 Tienes un archivo pendiente de validación y completado de datos',
              grdId: grdData[0].id_grd_oficial,
            });
          }
        } else if (userData.role === 'admin') {
          // Admin: verificar si hay archivo pendiente de aprobación
          const { data: grdData } = await supabase
            .from('grd_fila')
            .select('id_grd_oficial')
            .eq('estado', 'pendiente_admin')
            .limit(1);

          if (grdData && grdData.length > 0) {
            setWorkflowAlert({
              type: 'warning',
              message: '🔔 Tienes un archivo pendiente de aprobación',
              grdId: grdData[0].id_grd_oficial,
            });
          }
        }

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return <div className={styles.container}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>

      {/* Workflow Alert */}
      {workflowAlert && (
        <section className={styles.alertSection}>
          <WorkflowAlert 
            message={workflowAlert.message}
            type={workflowAlert.type}
            action={{
              label: 'Ver archivo',
              onClick: () => router.push('/visualizator')
            }}
            dismissible={true}
            onDismiss={() => setWorkflowAlert(null)}
          />
        </section>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div>
          <h1 className={styles.title}>Bienvenido/a</h1>
          <p className={styles.subtitle}>
            Plataforma de gestión, revisión y codificación de prestaciones médicas.
            Diseñada para optimizar flujos entre Administración, Codificación y Finanzas.
          </p>
        </div>
      </section>

      {/* Rol Explanation */}
      <section className={styles.rolesSection}>
        <h2 className={styles.sectionTitle}>¿Qué puedes hacer aquí?</h2>

        <div className={styles.rolesGrid}>

          <div className={styles.roleCard}>
            <h3 className={styles.roleTitle}>Administrador</h3>
            <p className={styles.roleText}>
              Gestiona usuarios, permisos y flujos internos. Supervisa el estado de los archivos 
              y la trazabilidad completa del proceso.
            </p>
          </div>

          <div className={styles.roleCard}>
            <h3 className={styles.roleTitle}>Codificador</h3>
            <p className={styles.roleText}>
              Sube, revisa y codifica archivos. Administra normas y asegura la correcta 
              preparación de la información para Finanzas.
            </p>
          </div>

          <div className={styles.roleCard}>
            <h3 className={styles.roleTitle}>Finanzas</h3>
            <p className={styles.roleText}>
              Revisa, valida y consolida los archivos codificados para su envío final 
              y liquidación correspondiente.
            </p>
          </div>

        </div>
      </section>

      {/* FAQ / Info */}
      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>Flujo General</h2>

        <ol className={styles.stepsList}>
          <li><strong>1)</strong> Codificador carga el archivo y completa GRD.</li>
          <li><strong>2)</strong> Finanzas valida y confirma.</li>
          <li><strong>3)</strong> Administrador aprueba y libera el archivo final.</li>
        </ol>
      </section>

    </div>
  );
}
