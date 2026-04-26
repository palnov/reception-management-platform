'use client';

type ScheduleNormModalProps = {
    tempNorm: string;
    onChangeTempNorm: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
};

export function ScheduleNormModal({
    tempNorm,
    onChangeTempNorm,
    onClose,
    onSave,
}: ScheduleNormModalProps) {
    return (
        <div className="fixed inset-0 h-dvh min-h-dvh w-dvw bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4 overflow-y-auto" onMouseDown={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300" onMouseDown={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-zinc-900">Норма часов</h2>
                <input
                    type="number"
                    value={tempNorm}
                    onChange={(e) => onChangeTempNorm(e.target.value)}
                    className="w-full text-4xl font-bold text-center py-6 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 focus:ring-0 transition-all mb-8 bg-zinc-50/50"
                />
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border-2 border-zinc-100 rounded-xl text-zinc-500 font-bold hover:bg-zinc-50 transition-all"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}
