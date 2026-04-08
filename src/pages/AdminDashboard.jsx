import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardAPI } from '../api/dashboard.api';

const currency = (value) => `${Number(value || 0).toFixed(2)} TND`;

const chartColors = {
  primary: '#4f46e5',
  secondary: '#8b5cf6',
  mint: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  slate: '#64748b',
};

const piePalette = ['#4f46e5', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];

function StatCard({ title, value, subtitle, accent }) {
  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-slate-500'>{title}</p>
          <p className='mt-3 text-3xl font-semibold tracking-tight text-slate-950'>{value}</p>
          <p className='mt-2 text-sm text-slate-500'>{subtitle}</p>
        </div>
        <div className={`h-11 w-11 rounded-2xl ${accent} shadow-inner`} />
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, action }) {
  return (
    <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60'>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-slate-950'>{title}</h2>
          {subtitle ? <p className='mt-1 text-sm text-slate-500'>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    DashboardAPI.summary()
      .then((data) => {
        if (!active) return;
        setSummary(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError('Impossible de charger les statistiques du dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const statCards = useMemo(() => {
    if (!summary) return [];
    return [
      {
        title: 'Orders',
        value: String(summary.totals.orders ?? 0),
        subtitle: `${summary.month.ordersCount ?? 0} this month`,
        accent: 'bg-indigo-100',
      },
      {
        title: 'Revenue',
        value: currency(summary.totals.revenue),
        subtitle: `${currency(summary.today.revenue)} today`,
        accent: 'bg-emerald-100',
      },
      {
        title: 'Products',
        value: String(summary.totals.products ?? 0),
        subtitle: `${summary.productTests?.testedProducts ?? 0} top tracked`,
        accent: 'bg-sky-100',
      },
      {
        title: 'Users',
        value: String(summary.totals.users ?? 0),
        subtitle: `${summary.pipeline?.totalLeads ?? 0} leads captured`,
        accent: 'bg-violet-100',
      },
    ];
  }, [summary]);

  const salesSeries = useMemo(() => {
    if (!summary) return [];
    return summary.dailySeries.map((item) => ({
      name: item.label,
      revenue: Number(item.revenue || 0),
      leads: Number(item.leads || 0),
    }));
  }, [summary]);

  const ordersSeries = useMemo(() => {
    if (!summary) return [];
    return summary.dailySeries.map((item) => ({
      name: item.label,
      orders: Number(item.orders || 0),
      abandoned: Number(item.abandoned || 0),
    }));
  }, [summary]);

  const categorySeries = useMemo(() => summary?.categoryDistribution || [], [summary]);

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 px-6 py-10 text-slate-900'>
        <div className='mx-auto max-w-7xl animate-pulse space-y-6'>
          <div className='h-16 rounded-3xl bg-white shadow-sm' />
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='h-36 rounded-3xl bg-white shadow-sm' />
            ))}
          </div>
          <div className='grid gap-6 xl:grid-cols-[1.7fr_1fr]'>
            <div className='h-96 rounded-3xl bg-white shadow-sm' />
            <div className='h-96 rounded-3xl bg-white shadow-sm' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className='min-h-screen bg-slate-50 px-6 py-10'>
        <div className='mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm'>
          <h1 className='text-2xl font-semibold text-slate-950'>Dashboard analytics</h1>
          <p className='mt-4 text-slate-500'>{error || 'Aucune donnée disponible.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      <div className='mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6'>
        <aside className='flex w-full shrink-0 flex-col rounded-[32px] bg-slate-950 px-6 py-7 text-slate-100 shadow-2xl shadow-slate-900/10 lg:w-72'>
          <div>
            <div className='inline-flex rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300'>
              Analytics Suite
            </div>
            <h1 className='mt-5 text-3xl font-semibold tracking-tight'>Commerce OS</h1>
            <p className='mt-3 text-sm leading-6 text-slate-400'>
              A complete operational cockpit for revenue, orders, abandoned leads and catalogue performance.
            </p>
          </div>

          <div className='mt-10 space-y-3'>
            {[
              { label: 'Overview', value: `${summary.totals.orders} orders` },
              { label: 'Revenue', value: currency(summary.totals.revenue) },
              { label: 'Conversion', value: `${summary.pipeline.conversionRate}%` },
              { label: 'Abandoned leads', value: `${summary.pipeline.abandonedLeads}` },
            ].map((item) => (
              <div key={item.label} className='rounded-2xl border border-white/10 bg-white/5 px-4 py-4'>
                <p className='text-sm text-slate-400'>{item.label}</p>
                <p className='mt-2 text-lg font-semibold text-white'>{item.value}</p>
              </div>
            ))}
          </div>

          <div className='mt-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white shadow-lg shadow-indigo-500/20'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100'>Monthly focus</p>
            <p className='mt-3 text-2xl font-semibold'>{summary.month.ordersCount} orders</p>
            <p className='mt-2 text-sm text-indigo-50/90'>
              {summary.month.abandonedCount} abandoned leads and {currency(summary.month.revenue)} revenue this month.
            </p>
          </div>
        </aside>

        <main className='flex-1 space-y-6'>
          <header className='rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-200/60'>
            <div className='flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'>
              <div>
                <p className='text-sm font-medium text-indigo-600'>Professional analytics dashboard</p>
                <h2 className='mt-2 text-3xl font-semibold tracking-tight text-slate-950'>Business performance overview</h2>
                <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-500'>
                  Monitor revenue, orders, abandoned leads, category balance and commercial performance in a clean SaaS layout designed for everyday operations.
                </p>
              </div>

              <div className='grid w-full gap-3 sm:grid-cols-3 xl:w-auto'>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Today</p>
                  <p className='mt-2 text-xl font-semibold text-slate-950'>{currency(summary.today.revenue)}</p>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Week</p>
                  <p className='mt-2 text-xl font-semibold text-slate-950'>{currency(summary.week.revenue)}</p>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Month</p>
                  <p className='mt-2 text-xl font-semibold text-slate-950'>{currency(summary.month.revenue)}</p>
                </div>
              </div>
            </div>
          </header>

          <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </section>

          <section className='grid gap-6 xl:grid-cols-[1.7fr_1fr]'>
            <Panel title='Sales trend' subtitle='Line chart of revenue and captured leads over the last 10 days.'>
              <div className='h-80 w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={salesSeries}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                    <XAxis dataKey='name' stroke='#94a3b8' tickLine={false} axisLine={false} />
                    <YAxis stroke='#94a3b8' tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 18, borderColor: '#e2e8f0', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}
                      formatter={(value, name) => [name === 'revenue' ? currency(value) : value, name === 'revenue' ? 'Revenue' : 'Leads']}
                    />
                    <Legend />
                    <Line type='monotone' dataKey='revenue' stroke={chartColors.primary} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name='Revenue' />
                    <Line type='monotone' dataKey='leads' stroke={chartColors.mint} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name='Leads' />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title='Category mix' subtitle='Pie chart of products distributed by category.'>
              <div className='h-80 w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie data={categorySeries} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={68} outerRadius={112} paddingAngle={4}>
                      {categorySeries.map((entry, index) => (
                        <Cell key={entry.name} fill={piePalette[index % piePalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 18, borderColor: '#e2e8f0' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </section>

          <section className='grid gap-6 xl:grid-cols-[1.35fr_1fr]'>
            <Panel title='Orders activity' subtitle='Bar chart comparing validated orders and abandoned leads by day.'>
              <div className='h-80 w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={ordersSeries} barGap={12}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                    <XAxis dataKey='name' stroke='#94a3b8' tickLine={false} axisLine={false} />
                    <YAxis stroke='#94a3b8' tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 18, borderColor: '#e2e8f0' }} />
                    <Legend />
                    <Bar dataKey='orders' name='Orders' fill={chartColors.secondary} radius={[10, 10, 0, 0]} />
                    <Bar dataKey='abandoned' name='Abandoned' fill={chartColors.amber} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title='Pipeline snapshot' subtitle='Key conversion and delivery indicators.'>
              <div className='space-y-4'>
                {[
                  { label: 'Conversion rate', value: `${summary.pipeline.conversionRate}%`, color: 'bg-indigo-500' },
                  { label: 'Abandonment rate', value: `${summary.pipeline.abandonmentRate}%`, color: 'bg-amber-500' },
                  { label: 'Delivered rate', value: `${summary.tracking.deliveredPercent}%`, color: 'bg-emerald-500' },
                  { label: 'Returned rate', value: `${summary.tracking.returnedPercent}%`, color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.label} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <p className='text-sm font-medium text-slate-500'>{item.label}</p>
                      <span className='text-sm font-semibold text-slate-950'>{item.value}</span>
                    </div>
                    <div className='h-2 rounded-full bg-slate-200'>
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className='grid gap-6 xl:grid-cols-[1.2fr_1fr]'>
            <Panel title='Top product categories & cities' subtitle='Commercial concentration by catalogue and geography.'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <h3 className='text-sm font-semibold text-slate-900'>Top cities</h3>
                  <div className='mt-4 space-y-4'>
                    {summary.topCities.map((city) => (
                      <div key={city.city} className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-medium text-slate-900'>{city.city}</p>
                          <p className='text-xs text-slate-500'>{city.leads} leads · {city.orders} orders</p>
                        </div>
                        <p className='font-semibold text-indigo-600'>{currency(city.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <h3 className='text-sm font-semibold text-slate-900'>Top products</h3>
                  <div className='mt-4 space-y-4'>
                    {summary.productTests.topProducts.map((product) => (
                      <div key={product.name} className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-medium text-slate-900'>{product.name}</p>
                          <p className='text-xs text-slate-500'>{product.orders} sold / tested</p>
                        </div>
                        <p className='font-semibold text-emerald-600'>{currency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title='Operational status' subtitle='A clean overview of the current order workflow.'>
              <div className='space-y-3'>
                {[
                  ['Pending', summary.statuses.pending],
                  ['Attempt 1', summary.statuses.attempt1],
                  ['Confirmed', summary.statuses.confirmed],
                  ['Packed', summary.statuses.packed],
                  ['Delivered', summary.statuses.delivered],
                  ['Rejected', summary.statuses.rejected],
                  ['Returned', summary.statuses.returned],
                ].map(([label, value], index) => (
                  <div key={label} className='flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm'>
                        {index + 1}
                      </span>
                      <span className='font-medium text-slate-700'>{label}</span>
                    </div>
                    <span className='text-lg font-semibold text-slate-950'>{value}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        </main>
      </div>
    </div>
  );
}
