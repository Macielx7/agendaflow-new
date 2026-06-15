export const INCOME_CATEGORIES = [
  { name: 'Consulta', slug: 'consulta' },
  { name: 'Implante', slug: 'implante' },
  { name: 'Lente Dental', slug: 'lente-dental' },
  { name: 'Clareamento', slug: 'clareamento' },
  { name: 'Ortodontia', slug: 'ortodontia' },
  { name: 'Outros', slug: 'outros-receita' },
];

export const EXPENSE_CATEGORIES = [
  { name: 'Aluguel', slug: 'aluguel' },
  { name: 'Água', slug: 'agua' },
  { name: 'Energia', slug: 'energia' },
  { name: 'Funcionários', slug: 'funcionarios' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Materiais', slug: 'materiais' },
  { name: 'Impostos', slug: 'impostos' },
  { name: 'Outros', slug: 'outros-despesa' },
];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de débito' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'OTHER', label: 'Outro' },
];

export const STATUS_LABELS = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
  PARTIAL: 'Parcialmente pago',
};

export const STATUS_COLORS = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'muted',
  PARTIAL: 'info',
};

export const FINANCE_NAV = [
  { href: '/financeiro', label: 'Dashboard', icon: 'layout' },
  { href: '/financeiro/receber', label: 'Contas a Receber', icon: 'arrow-down' },
  { href: '/financeiro/pagar', label: 'Contas a Pagar', icon: 'arrow-up' },
  { href: '/financeiro/fluxo', label: 'Fluxo de Caixa', icon: 'activity' },
  { href: '/financeiro/parcelamentos', label: 'Parcelamentos', icon: 'layers' },
  { href: '/financeiro/orcamentos', label: 'Orçamentos', icon: 'file' },
  { href: '/financeiro/comissoes', label: 'Comissões', icon: 'percent' },
  { href: '/financeiro/categorias', label: 'Categorias', icon: 'tag' },
  { href: '/financeiro/relatorios', label: 'Relatórios', icon: 'chart' },
  { href: '/financeiro/inadimplencia', label: 'Inadimplência', icon: 'alert' },
];
