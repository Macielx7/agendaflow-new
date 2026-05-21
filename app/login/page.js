import LoginForm from '@/components/LoginForm/LoginForm';
import { APP_NAME } from '@/utils/constants';
import s from '@/styles/saas.module.css';

export const metadata = { title: `Login | ${APP_NAME}` };

export default function LoginPage() {
  return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.2rem', boxShadow: 'var(--shadow-glow)',
          }}>A</div>
          <h1 className={s.loginTitle}>{APP_NAME}</h1>
          <p className={s.loginSubtitle}>Acesse o painel de gestão</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
