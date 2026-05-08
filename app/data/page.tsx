'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Database, FileSpreadsheet, Upload, Loader2, AlertTriangle, ShieldCheck, HardDrive, FileArchive, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InlineStatus } from '@/components/InlineStatus';
import { ConfirmPanel } from '@/components/ConfirmPanel';

type CurrentUser = {
    id: string;
    name: string;
    role: string;
};

export default function DataPage() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'export' | 'backup'>('export');

    // Export State
    const [exportDate, setExportDate] = useState(() => {
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('shared_selected_month') : null;
            if (stored) {
                const parsed = new Date(stored);
                if (!isNaN(parsed.getTime())) return format(parsed, 'yyyy-MM');
            }
        } catch { }
        return format(new Date(), 'yyyy-MM');
    });
    const [reportType, setReportType] = useState('SALARY_SLIP'); // Default to Salary Slip
    const [isExportingGeneral, setIsExportingGeneral] = useState(false);
    const [isExportingBatch, setIsExportingBatch] = useState(false);
    const [employees, setEmployees] = useState<{ id: string, name: string, role: string }[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Backup State
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);


    useEffect(() => {
        // Fetch User
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Not authenticated');
            })
            .then(userData => {
                if (userData.role !== 'MANAGER') {
                    router.push('/');
                    return;
                }
                setUser(userData);

                // Fetch employees for individual export
                fetch('/api/employees')
                    .then(res => {
                        if (!res.ok) throw new Error('Employees fetch failed');
                        return res.json();
                    })
                    .then(data => setEmployees(Array.isArray(data) ? data : []))
                    .catch(() => setOperationStatus({ type: 'error', message: 'Не удалось загрузить список сотрудников для экспорта.' }));

            })
            .catch(() => {
                router.push('/login');
            })
            .finally(() => setLoading(false));
    }, [router]);


    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    if (!user) return null;

    const isPersonalReport = reportType === 'SALARY_SLIP' || reportType === 'DETAILIZATION';
    const personalReportTitle = reportType === 'DETAILIZATION' ? 'Детализация' : 'Расчетный лист';
    const personalReportFilePrefix = reportType === 'DETAILIZATION' ? 'Детализация' : 'Расчетный_лист';

    const handleExport = async (mode: 'GENERAL' | 'INDIVIDUAL') => {
        setOperationStatus(null);
        if (mode === 'GENERAL') setIsExportingGeneral(true);
        else setIsExportingBatch(true);

        try {
            const date = exportDate + '-01'; // First day of month

            if (mode === 'GENERAL') {
                const res = await fetch('/api/reports/excel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date, type: reportType, mode: 'GENERAL' })
                });

                if (!res.ok) throw new Error('Export failed');

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Report_${reportType}_${exportDate}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                setOperationStatus({ type: 'success', message: 'Отчет сформирован и скачан.' });
            } else {
                // ZIP export for all employees
                const res = await fetch('/api/reports/batch-zip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date, type: reportType, employeeIds: employees.map(e => e.id) })
                });

                if (!res.ok) throw new Error('Batch export failed');

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Employees_${reportType}_${exportDate}.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                setOperationStatus({ type: 'success', message: 'ZIP-архив с отчетами сформирован и скачан.' });
            }
        } catch (e) {
            console.error(e);
            setOperationStatus({ type: 'error', message: 'Ошибка при экспорте. Проверьте данные за выбранный месяц.' });
        } finally {
            setIsExportingGeneral(false);
            setIsExportingBatch(false);
        }
    };

    const handleBackupDownload = async () => {
        setOperationStatus(null);
        setIsBackingUp(true);
        try {
            const res = await fetch('/api/backup');
            if (!res.ok) throw new Error('Backup failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setOperationStatus({ type: 'success', message: 'Резервная копия создана и скачана.' });
        } catch {
            setOperationStatus({ type: 'error', message: 'Ошибка создания бэкапа. Попробуйте еще раз.' });
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        if (!backupFile) return;

        setIsRestoring(true);
        setRestoreStatus(null);
        setOperationStatus(null);

        try {
            const text = await backupFile.text();
            const json = JSON.parse(text);

            const res = await fetch('/api/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json)
            });

            if (!res.ok) throw new Error('Restore failed');

            setRestoreStatus({ type: 'success', message: 'База данных успешно восстановлена!' });
            setBackupFile(null);
            setShowRestoreConfirm(false);
        } catch {
            setRestoreStatus({ type: 'error', message: 'Ошибка восстановления базы. Проверьте файл.' });
        } finally {
            setIsRestoring(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Управление данными</h1>
                    <p className="mt-2 max-w-2xl text-sm text-zinc-500">Экспорт отчетов, резервные копии и восстановление базы разделены по сценариям, чтобы обычные операции не смешивались с опасными.</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-amber-800">
                    <ShieldCheck className="h-4 w-4" />
                    Только руководитель
                </div>
            </div>

            {operationStatus && (
                <InlineStatus type={operationStatus.type} message={operationStatus.message} className="mb-5 px-4 py-3" />
            )}

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="relative overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white p-2 text-zinc-900 shadow-sm lg:col-span-2">
                    <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full border-[28px] border-zinc-100" />
                    <div className="relative">
                        <div className="hidden">
                            <Database className="mb-4 h-8 w-8 text-blue-300" />
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Разделы</div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('export')}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === 'export' ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-950/10' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'}`}
                            >
                                <FileSpreadsheet className="h-5 w-5" />
                                Экспорт отчетов
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('backup')}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === 'backup' ? 'bg-red-50 text-red-900 ring-1 ring-red-100' : 'text-zinc-500 hover:bg-red-50 hover:text-red-800'}`}
                            >
                                <HardDrive className="h-5 w-5" />
                                Архив и восстановление
                            </button>
                        </div>
                        <div className="hidden">
                            Экспорт можно запускать спокойно. Восстановление базы отделено визуально и требует отдельного подтверждения.
                        </div>
                    </div>
                </aside>

                <section className="min-h-[520px] rounded-[1.75rem] border border-zinc-200/80 bg-white/95 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)] sm:p-7 lg:col-span-2">
                {activeTab === 'export' ? (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-950">Сформировать отчет</h2>
                                <p className="mt-2 max-w-xl text-sm text-zinc-500">Выберите месяц, тип отчета и формат выгрузки. Для расчетных листов доступна индивидуальная выгрузка.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Отчетный месяц</label>
                                    <input
                                        type="month"
                                        value={exportDate}
                                        onChange={(e) => setExportDate(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-bold bg-zinc-50/60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Тип отчета</label>
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-bold bg-white"
                                    >
                                        <option value="SALARY_SLIP">Расчетный лист</option>
                                        <option value="DETAILIZATION">Детализация</option>
                                        <option value="ACCOUNTANT">Для бухгалтера</option>
                                        <option value="ACCOUNTANT_15">Для бухгалтера (1-15 число)</option>
                                        <option value="FULL">Полный отчет</option>
                                        <option value="SCHEDULE">Только График</option>
                                        <option value="SALES">Только Продажи</option>
                                        <option value="REGISTRATION">Только Оформления</option>
                                        <option value="KPI">KPI и Зарплата</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-5 border-t border-zinc-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isPersonalReport ? (
                                    <div className="p-5 sm:p-6 border border-blue-100 bg-gradient-to-br from-blue-50 to-white rounded-3xl flex flex-col justify-between">
                                        <div className="flex items-start gap-4 mb-4 text-blue-600">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                                                <Download className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-zinc-900">Индивидуально</div>
                                                <div className="text-sm text-zinc-500 mt-1">Один файл «{personalReportTitle}» для выбранного сотрудника</div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto flex flex-col gap-3">
                                            <select 
                                                id="employee-select"
                                                value={selectedEmployeeId}
                                                onChange={(e) => {
                                                    setSelectedEmployeeId(e.target.value);
                                                    setOperationStatus(null);
                                                }}
                                                className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-bold bg-white"
                                            >
                                                <option value="">-- Выбрать --</option>
                                                {employees.filter(e => e.role !== 'MANAGER').map(e => (
                                                    <option key={e.id} value={e.id}>{e.name}</option>
                                                ))}
                                            </select>
                                            
                                            <button
                                                onClick={async () => {
                                                    const empId = selectedEmployeeId;
                                                    setOperationStatus(null);
                                                    if (!empId) {
                                                        setOperationStatus({ type: 'error', message: 'Выберите сотрудника для индивидуального отчета.' });
                                                        return;
                                                    }
                                                    
                                                    setIsExportingGeneral(true);
                                                    try {
                                                        const date = exportDate + '-01';
                                                        const res = await fetch('/api/reports/excel', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ date, type: reportType, employeeId: empId })
                                                        });
                                                        if (!res.ok) throw new Error();
                                                        const blob = await res.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        const empName = employees.find(e => e.id === empId)?.name || 'Employee';
                                                        a.download = `${personalReportFilePrefix}_${empName.replace(/\\s+/g, '_')}_${exportDate}.xlsx`;
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                        setOperationStatus({ type: 'success', message: 'Индивидуальный отчет сформирован и скачан.' });
                                                    } catch {
                                                        setOperationStatus({ type: 'error', message: 'Ошибка при загрузке индивидуального отчета.' });
                                                    } finally {
                                                        setIsExportingGeneral(false);
                                                    }
                                                }}
                                                disabled={isExportingGeneral || isExportingBatch}
                                                className="w-full h-[52px] bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {isExportingGeneral ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                Скачать
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleExport('GENERAL')}
                                        disabled={isExportingGeneral || isExportingBatch}
                                        className="p-5 sm:p-6 border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white rounded-3xl hover:border-emerald-200 transition-colors text-left flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform">
                                                {isExportingGeneral ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileSpreadsheet className="w-6 h-6" />}
                                            </div>
                                            <div className="font-bold text-base sm:text-lg text-zinc-900">Общая таблица</div>
                                            <div className="text-sm text-zinc-500 mt-1">Единый файл со всеми выбранными данными на разных листах</div>
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={() => handleExport('INDIVIDUAL')}
                                    disabled={isExportingGeneral || isExportingBatch}
                                    className="p-5 sm:p-6 border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white rounded-3xl hover:border-blue-200 transition-colors text-left flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform">
                                            {isExportingBatch ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileArchive className="w-6 h-6" />}
                                        </div>
                                        <div className="font-bold text-base sm:text-lg text-zinc-900">По всем сотрудникам (ZIP)</div>
                                        <div className="text-sm text-zinc-500 mt-1">Отдельные файлы индивидуально для каждого сотрудника, упакованные в архив</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-950">Архив базы и восстановление</h2>
                            <p className="mt-2 max-w-xl text-sm text-zinc-500">Создание резервной копии безопасно. Восстановление заменяет текущую базу и вынесено в отдельную опасную зону.</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <b>Внимание:</b> Восстановление базы данных полностью очистит текущие данные и заменит их данными из файла бэкапа.
                                Рекомендуется создать актуальный бэкап перед восстановлением.
                            </div>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-zinc-50/60 p-5">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Server className="h-5 w-5 text-zinc-500" /> Создание резервной копии</h3>
                            <button
                                onClick={handleBackupDownload}
                                disabled={isBackingUp || isRestoring}
                                className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-500"
                            >
                                {isBackingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                Скачать полную базу данных (JSON)
                            </button>
                        </div>

                        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-5">
                            <h3 className="text-xl font-bold mb-4 text-red-950">Восстановление из файла</h3>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-red-200 bg-white/70 rounded-2xl p-6 sm:p-8 text-center hover:bg-white transition-colors relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => {
                                            setBackupFile(e.target.files?.[0] || null);
                                            setShowRestoreConfirm(false);
                                            setRestoreStatus(null);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <Upload className={`w-6 h-6 sm:w-8 sm:h-8 ${backupFile ? 'text-blue-500' : 'text-zinc-400'}`} />
                                        {backupFile ? (
                                            <span className="font-bold text-blue-600 text-sm">{backupFile.name}</span>
                                        ) : (
                                            <span className="text-zinc-500 font-medium text-sm">Нажмите или перетащите файл бэкапа сюда</span>
                                        )}
                                    </div>
                                </div>

                                {backupFile && (
                                    <button
                                        onClick={() => setShowRestoreConfirm(true)}
                                        disabled={isRestoring}
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                    >
                                        <Database className="w-5 h-5" />
                                        Восстановить базу данных
                                    </button>
                                )}

                                {showRestoreConfirm && backupFile && (
                                    <ConfirmPanel
                                        title="Подтвердите восстановление базы"
                                        description={<>Текущая база будет полностью заменена данными из файла “{backupFile.name}”.</>}
                                        confirmLabel={isRestoring ? 'Восстановление...' : 'Да, восстановить'}
                                        onConfirm={handleRestore}
                                        onCancel={() => setShowRestoreConfirm(false)}
                                        isBusy={isRestoring}
                                    />
                                )}

                                {restoreStatus && (
                                    <InlineStatus type={restoreStatus.type} message={restoreStatus.message} className="p-4" />
                                )}
                            </div>
                        </div>

                    </div>
                )}
                </section>
            </div>
        </div>
    );
}
