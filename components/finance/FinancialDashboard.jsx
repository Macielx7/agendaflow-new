'use client';

import FinancialCard from './FinancialCard';
import FinancialChart, { BarChart, HorizontalBarChart, CashFlowChart } from './FinancialChart';
import { formatCurrency } from '@/utils/format';
import f from '@/styles/finance.module.css';

export default function FinancialDashboard({ data, loading }) {
  const kpis = data?.kpis;
  const charts = data?.charts;

  if (loading) {
    return (
      <div className={f.financeWrap}>
        <div className={f.kpiGrid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <FinancialCard key={i} loading />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={f.financeWrap}>
      <div className={f.kpiGrid}>
        <FinancialCard label="Receita do mês" value={formatCurrency(kpis?.monthRevenue)} variant="positive" />
        <FinancialCard label="Receita do dia" value={formatCurrency(kpis?.dayRevenue)} />
        <FinancialCard label="Receita anual" value={formatCurrency(kpis?.yearRevenue)} />
        <FinancialCard label="Despesas do mês" value={formatCurrency(kpis?.monthExpenses)} variant="negative" />
        <FinancialCard label="Lucro líquido" value={formatCurrency(kpis?.netProfit)} variant={kpis?.netProfit >= 0 ? 'positive' : 'negative'} />
        <FinancialCard label="Ticket médio" value={formatCurrency(kpis?.ticketMedio)} />
        <FinancialCard label="Clientes ativos" value={kpis?.activeClients ?? 0} />
        <FinancialCard label="Inadimplentes" value={kpis?.delinquentClients ?? 0} variant="warning" />
        <FinancialCard label="Contas vencidas" value={kpis?.overdueCount ?? 0} variant="negative" />
        <FinancialCard label="A vencer (7 dias)" value={kpis?.dueSoon ?? 0} variant="warning" />
      </div>

      <div className={f.chartGrid}>
        <BarChart
          title="Receita mensal"
          data={(charts?.monthlyRevenue || []).map((m) => ({
            label: m.label,
            value: m.revenue,
          }))}
        />
        <HorizontalBarChart
          title="Receita por procedimento"
          data={charts?.revenueByProcedure || []}
        />
        <HorizontalBarChart
          title="Receita por dentista"
          data={charts?.revenueByDentist || []}
        />
        <CashFlowChart title="Fluxo de caixa (30 dias)" data={charts?.cashflow || []} />
      </div>

      <BarChart
        title="Evolução financeira (saldo acumulado)"
        data={(charts?.evolution || []).slice(-14).map((e) => ({
          label: e.date?.slice(5),
          value: Math.abs(e.cumulative),
        }))}
      />
    </div>
  );
}
