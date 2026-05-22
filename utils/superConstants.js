export const SUPER_APP_NAME = 'AgendaPro Control';

export const SUPER_NAV = [
  { href: '/superadmin/dashboard', label: 'Dashboard', icon: 'layout' },
  { href: '/superadmin/tenants', label: 'Clientes SaaS', icon: 'building' },
  { href: '/superadmin/plans', label: 'Planos', icon: 'layers' },
  { href: '/superadmin/subscriptions', label: 'Assinaturas', icon: 'credit' },
  { href: '/superadmin/billing', label: 'Financeiro', icon: 'dollar' },
  { href: '/superadmin/logs', label: 'Logs', icon: 'file' },
  { href: '/superadmin/settings', label: 'Configurações', icon: 'settings' },
];

export const TENANT_STATUS = {
  ACTIVE: 'Ativa',
  PENDING: 'Pendente',
  SUSPENDED: 'Suspensa',
  CANCELLED: 'Cancelada',
};

export const SUB_STATUS = {
  TRIAL: 'Trial',
  ACTIVE: 'Ativa',
  PENDING: 'Pendente',
  SUSPENDED: 'Suspensa',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
};

export const SUPER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  DEVELOPER: 'Desenvolvedor',
  SUPPORT: 'Suporte',
};

export const MODULES = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'servicos', label: 'Serviços' },
  { key: 'horarios', label: 'Horários' },
  { key: 'configuracoes', label: 'Configurações' },
  { key: 'relatorios', label: 'Relatórios' },
  { key: 'api', label: 'API' },
  { key: 'suporte', label: 'Suporte prioritário' },
];
