import SuperAdminLoginForm from '@/components/superadmin/SuperAdminLoginForm';
import { SUPER_APP_NAME } from '@/utils/superConstants';
import s from '@/styles/superadmin.module.css';

export const metadata = { title: `Login | ${SUPER_APP_NAME}`, robots: { index: false } };

export default function SuperAdminLoginPage() {
  return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', background: 'linear-gradient(135deg, #22d3ee, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#050508' }}>SA</div>
          <h1 className={s.loginTitle}>{SUPER_APP_NAME}</h1>
          <p className={s.loginSubtitle}>Acesso exclusivo da equipe</p>
        </div>
        <SuperAdminLoginForm />
      </div>
    </div>
  );
}
