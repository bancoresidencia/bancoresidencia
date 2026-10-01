'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Award, CheckCircle2, XCircle, Flame, Clock } from 'lucide-react';
import { UserStats } from '@/types';

interface StatsDashboardProps {
  stats: UserStats;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const pieData = stats.bySpecialty.map((item) => ({
    name: item.specialty,
    value: item.total
  }));

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolvidas</span>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalAnswered}</div>
          <div className="text-xs text-slate-400 mt-1">questões no total</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Acerto</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-400 mt-1">{stats.totalCorrect} certas / {stats.totalIncorrect} erradas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sequência</span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{stats.streakDays} dias</div>
          <div className="text-xs text-slate-400 mt-1">foco diário ativo</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tempo de Estudo</span>
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400">{stats.studyTimeMinutes} min</div>
          <div className="text-xs text-slate-400 mt-1">produtividade registrada</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Evolução Diária */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-1">Evolução de Questões (Últimos Dias)</h3>
          <p className="text-xs text-slate-400 mb-4">Volume diário de questões resolvidas e acertos</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.historyByDay}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="answered" name="Resolvidas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="correct" name="Acertos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Desempenho por Especialidade */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-1">Distribuição por Grande Área</h3>
          <p className="text-xs text-slate-400 mb-4">Volume praticado por especialidade médica</p>
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length > 0 && stats.totalAnswered > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-sm">
                Resolva questões para visualizar a distribuição gráfica.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
