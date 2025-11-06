import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>

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
