import LoginForm from '@/components/LoginForm/LoginForm';
import styles from '@/styles/admin.module.css';

export const metadata = {
  title: 'Login | Painel Dr. João Marcos',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #1a4d7a, #4a9fd4)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              margin: '0 auto 16px',
            }}
          >
            DJ
          </div>
        </div>
        <h1 className={styles.loginTitle}>Painel Administrativo</h1>
        <p className={styles.loginSubtitle}>
          Acesse sua conta para gerenciar agendamentos da clínica
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
