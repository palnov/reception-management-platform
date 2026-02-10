
import Link from 'next/link';
import { Calendar, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 py-10">
        <h1 className="text-4xl font-extrabold text-zinc-900 mb-4 tracking-tight">
          Добро пожаловать в <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Администраторы ДМЦ</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Управляйте графиком сотрудников, отслеживайте KPI и автоматически рассчитывайте зарплату в одной системе.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/schedule" className="group block p-6 bg-white rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-blue-200 transition-all">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">График смен</h2>
          <p className="text-zinc-500 text-sm mb-4">Планирование смен на месяц, назначение сотрудников и учет часов.</p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            Перейти к графику <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/employees" className="group block p-6 bg-white rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-purple-200 transition-all">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Сотрудники</h2>
          <p className="text-zinc-500 text-sm mb-4">Управление персоналом, настройка должностей и ставок заработной платы.</p>
          <div className="flex items-center text-purple-600 text-sm font-medium">
            Управление персоналом <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/kpi" className="group block p-6 bg-white rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-green-200 transition-all">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">KPI и Зарплата</h2>
          <p className="text-zinc-500 text-sm mb-4">Ежедневный ввод показателей, расчет бонусов и итоговой зарплаты.</p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            Отчеты и KPI <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
