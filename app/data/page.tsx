'use client';

import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Download, Database, FileSpreadsheet, Archive, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DataPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'export' | 'backup'>('export');

    // Export State
    const [exportDate, setExportDate] = useState(format(new Date(), 'yyyy-MM'));
    const [reportType, setReportType] = useState('FULL'); // FULL, SCHEDULE, SALES, REGISTRATION, KPI
    const [isExportingGeneral, setIsExportingGeneral] = useState(false);
    const [isExportingBatch, setIsExportingBatch] = useState(false);
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([]);

    // Backup State
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Snapshots State
    const [snapshots, setSnapshots] = useState<any[]>([]);
    const [isSnaploading, setIsSnaploading] = useState(false);

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
                fetch('/api/employees').then(res => res.json()).then(setEmployees);

                // Fetch snapshots
                fetchSnapshots();
            })
            .catch(() => {
                router.push('/login');
            })
            .finally(() => setLoading(false));
    }, [router]);

    const fetchSnapshots = async () => {
        try {
            const res = await fetch('/api/backup/snapshots');
            if (res.ok) {
                const data = await res.json();
                setSnapshots(data);
            }
        } catch (e) {
            console.error('Failed to fetch snapshots', e);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    if (!user) return null;

    const session = { employee: user }; // mimic session structure if needed, or just use user

    const handleExport = async (mode: 'GENERAL' | 'INDIVIDUAL') => {
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
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка при экспорте');
        } finally {
            setIsExportingGeneral(false);
            setIsExportingBatch(false);
        }
    };

    const handleBackupDownload = async () => {
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
        } catch (e) {
            alert('Ошибка создания бэкапа');
        }
    };

    const handleRestore = async () => {
        if (!backupFile || !confirm('ВНИМАНИЕ! Это действие полностью заменит текущую базу данных данными из файла. Продолжить?')) return;

        setIsRestoring(true);
        setRestoreStatus(null);

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
            fetchSnapshots(); // Refresh list because restore creates an auto-snapshot
        } catch (e) {
            setRestoreStatus({ type: 'error', message: 'Ошибка восстановления базы. Проверьте файл.' });
        } finally {
            setIsRestoring(false);
        }
    };

    const handleCreateSnapshot = async () => {
        setIsSnaploading(true);
        try {
            const res = await fetch('/api/backup/snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CREATE' })
            });
            if (!res.ok) throw new Error('Failed to create snapshot');
            await fetchSnapshots();
        } catch (e) {
            alert('Ошибка создания снимка');
        } finally {
            setIsSnaploading(false);
        }
    };

    const handleRestoreSnapshot = async (name: string) => {
        if (!confirm(`Восстановить базу из снимка "${name}"? Текущее состояние будет сохранено в авто-снимке.`)) return;
        setIsSnaploading(true);
        try {
            const res = await fetch('/api/backup/snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'RESTORE', name })
            });
            if (!res.ok) throw new Error('Restore failed');
            alert('База данных успешно восстановлена из снимка!');
            await fetchSnapshots();
        } catch (e) {
            alert('Ошибка восстановления');
        } finally {
            setIsSnaploading(false);
        }
    };

    const handleDeleteSnapshot = async (name: string) => {
        if (!confirm('Удалить этот снимок?')) return;
        try {
            const res = await fetch('/api/backup/snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'DELETE', name })
            });
            if (res.ok) await fetchSnapshots();
        } catch (e) {
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Управление данными</h1>

            {/* Tabs */}
            <div className="flex gap-4 p-1 bg-zinc-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('export')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'export' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        Экспорт в Excel
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('backup')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'backup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Резервное копирование
                    </div>
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 min-h-[400px]">
                {activeTab === 'export' ? (
                    <div className="space-y-8 max-w-2xl">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Параметры выгрузки</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 mb-2">Отчетный месяц</label>
                                    <input
                                        type="month"
                                        value={exportDate}
                                        onChange={(e) => setExportDate(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 mb-2">Тип отчета</label>
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-zinc-100 rounded-xl focus:border-blue-500 outline-none font-bold bg-white"
                                    >
                                        <option value="FULL">Полный отчет (Всё включено)</option>
                                        <option value="SCHEDULE">Только График</option>
                                        <option value="SALES">Только Продажи</option>
                                        <option value="REGISTRATION">Только Оформления</option>
                                        <option value="KPI">KPI и Зарплата</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <h2 className="text-xl font-bold">Действия</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleExport('GENERAL')}
                                    disabled={isExportingGeneral || isExportingBatch}
                                    className="p-6 border-2 border-zinc-100 rounded-2xl hover:border-green-200 hover:bg-green-50 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600 group-hover:scale-110 transition-transform">
                                        {isExportingGeneral ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileSpreadsheet className="w-6 h-6" />}
                                    </div>
                                    <div className="font-bold text-lg text-zinc-900">Общая таблица</div>
                                    <div className="text-sm text-zinc-500 mt-1">Единый файл со всеми данными на разных листах</div>
                                </button>

                                <button
                                    onClick={() => handleExport('INDIVIDUAL')}
                                    disabled={isExportingGeneral || isExportingBatch}
                                    className="p-6 border-2 border-zinc-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                                        {isExportingBatch ? <Loader2 className="w-6 h-6 animate-spin" /> : <Archive className="w-6 h-6" />}
                                    </div>
                                    <div className="font-bold text-lg text-zinc-900">По сотрудникам (ZIP)</div>
                                    <div className="text-sm text-zinc-500 mt-1">Отдельные файлы для каждого сотрудника в архиве</div>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-2xl">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <b>Внимание:</b> Восстановление базы данных полностью очистит текущие данные и заменит их данными из файла бэкапа.
                                Рекомендуется создать актуальный бэкап перед восстановлением.
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4">Создание резервной копии</h2>
                            <button
                                onClick={handleBackupDownload}
                                className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                            >
                                <Download className="w-5 h-5" />
                                Скачать полную базу данных (JSON)
                            </button>
                        </div>

                        <div className="pt-4 border-t border-zinc-100">
                            <h2 className="text-xl font-bold mb-4">Восстановление из файла</h2>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <Upload className={`w-8 h-8 ${backupFile ? 'text-blue-500' : 'text-zinc-400'}`} />
                                        {backupFile ? (
                                            <span className="font-bold text-blue-600">{backupFile.name}</span>
                                        ) : (
                                            <span className="text-zinc-500 font-medium">Нажмите или перетащите файл бэкапа сюда</span>
                                        )}
                                    </div>
                                </div>

                                {backupFile && (
                                    <button
                                        onClick={handleRestore}
                                        disabled={isRestoring}
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                    >
                                        {isRestoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                                        Восстановить базу данных
                                    </button>
                                )}

                                {restoreStatus && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${restoreStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {restoreStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        {restoreStatus.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Snapshots Section */}
                        <div className="pt-8 border-t border-zinc-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">Снимки системы (Local Snapshots)</h2>
                                    <p className="text-sm text-zinc-500 mt-1">Резервные копии файла базы данных на сервере</p>
                                </div>
                                <button
                                    onClick={handleCreateSnapshot}
                                    disabled={isSnaploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {isSnaploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                    Создать снимок
                                </button>
                            </div>

                            <div className="space-y-3">
                                {snapshots.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-400 border-2 border-dashed border-zinc-100 rounded-2xl">
                                        Снимков пока нет
                                    </div>
                                ) : (
                                    snapshots.map((snap) => (
                                        <div key={snap.name} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-zinc-400 shadow-sm">
                                                    <Archive className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 flex items-center gap-2">
                                                        {snap.name}
                                                        {snap.name.startsWith('auto_') && (
                                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Auto</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 mt-0.5">
                                                        {format(new Date(snap.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })} • {(snap.size / 1024).toFixed(1)} KB
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRestoreSnapshot(snap.name)}
                                                    disabled={isSnaploading}
                                                    title="Восстановить"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Database className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSnapshot(snap.name)}
                                                    disabled={isSnaploading}
                                                    title="Удалить"
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <AlertTriangle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
