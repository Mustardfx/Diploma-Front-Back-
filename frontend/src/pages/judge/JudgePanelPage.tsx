import { useState, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { competitionService, compRegistrationService, compResultService } from '../../services/competitionService';
import { authService } from '../../services/authService';

const PLACE_COLORS = ['', 'bg-yellow-500 text-slate-950', 'bg-slate-400 text-slate-950', 'bg-amber-700 text-white'];

export function JudgePanelPage() {
  const { user } = useAuth();
  const [selectedComp, setSelectedComp] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [scores, setScores] = useState<Record<string, { place: string; score: string; notes: string }>>({});
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!user) return null;

  const competitions = useMemo(() =>
    competitionService.getAll().filter(c => c.status === 'ongoing' || c.status === 'completed'),
    []
  );

  const competition = competitions.find(c => c.id === selectedComp);
  const registrations = selectedComp ? compRegistrationService.getCompetitionRegistrations(selectedComp).filter(r => r.status === 'approved') : [];
  const filteredRegs = selectedCat ? registrations.filter(r => r.categoryId === selectedCat) : registrations;
  const existingResults = selectedComp ? compResultService.getCompetitionResults(selectedComp) : [];

  const initScores = () => {
    const init: Record<string, { place: string; score: string; notes: string }> = {};
    filteredRegs.forEach(reg => {
      const existing = existingResults.find(r => r.registrationId === reg.id);
      init[reg.id] = {
        place: existing?.place?.toString() ?? '',
        score: existing?.score?.toString() ?? '',
        notes: existing?.notes ?? '',
      };
    });
    return init;
  };

  const currentScores = Object.keys(scores).length > 0 ? scores : initScores();

  const handleChange = (regId: string, field: 'place' | 'score' | 'notes', val: string) => {
    setSaved(false);
    setScores(p => ({ ...initScores(), ...p, [regId]: { ...currentScores[regId], [field]: val } }));
  };

  const handleSave = () => {
    if (!competition || !user) return;
    try {
      filteredRegs.forEach(reg => {
        const s = currentScores[reg.id];
        if (!s) return;
        compResultService.saveResult({
          competitionId: competition.id,
          registrationId: reg.id,
          userId: reg.userId,
          categoryId: reg.categoryId,
          place: s.place ? parseInt(s.place) : undefined,
          score: s.score ? parseFloat(s.score) : undefined,
          notes: s.notes || undefined,
          judgeId: user.id,
        });
      });
      setSaved(true);
      setNotification({ msg: 'Результаты сохранены!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setNotification({ msg: (e as Error).message, type: 'error' });
    }
  };

  const handleCompChange = (id: string) => {
    setSelectedComp(id);
    setSelectedCat('');
    setScores({});
    setSaved(false);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Судейская панель</h1>
          <p className="text-slate-400 mt-1">Ввод результатов соревнований</p>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Соревнование</label>
              <select value={selectedComp} onChange={e => handleCompChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 text-sm">
                <option value="">Выберите соревнование</option>
                {competitions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Категория</label>
              <select value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setScores({}); }}
                disabled={!selectedComp}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 text-sm disabled:opacity-40">
                <option value="">Все категории</option>
                {competition?.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!selectedComp ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <div className="text-4xl mb-3">⊖</div>
            <p>Выберите соревнование для ввода результатов</p>
          </div>
        ) : filteredRegs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <p>Нет одобренных заявок{selectedCat ? ' в этой категории' : ''}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">Участников: <span className="text-white font-medium">{filteredRegs.length}</span></p>
              <button onClick={() => {
                const auto: Record<string, { place: string; score: string; notes: string }> = {};
                const sorted = [...filteredRegs].sort((a, b) => {
                  const sa = parseFloat(currentScores[a.id]?.score ?? '0');
                  const sb = parseFloat(currentScores[b.id]?.score ?? '0');
                  return sb - sa;
                });
                sorted.forEach((reg, i) => {
                  auto[reg.id] = { ...currentScores[reg.id], place: String(i + 1) };
                });
                setScores(auto); setSaved(false);
              }} className="px-3 py-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors">
                Авторасстановка мест
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {filteredRegs.map(reg => {
                const u = authService.getUserById(reg.userId);
                const cat = competition?.categories.find(c => c.id === reg.categoryId);
                const s = currentScores[reg.id] ?? { place: '', score: '', notes: '' };
                const placeNum = parseInt(s.place);
                const placeColor = PLACE_COLORS[placeNum] ?? 'bg-slate-700 text-slate-300';

                return (
                  <div key={reg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${s.place ? placeColor : 'bg-slate-700 text-slate-400'}`}>
                        {s.place || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{u ? `${u.lastName} ${u.firstName}` : '—'}</div>
                        <div className="text-slate-500 text-xs">{cat?.name} · {u?.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Место</label>
                        <input
                          type="number" min={1} value={s.place}
                          onChange={e => handleChange(reg.id, 'place', e.target.value)}
                          placeholder="1"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Очки / Результат</label>
                        <input
                          type="number" step="0.1" value={s.score}
                          onChange={e => handleChange(reg.id, 'score', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Примечание</label>
                        <input
                          value={s.notes}
                          onChange={e => handleChange(reg.id, 'notes', e.target.value)}
                          placeholder="Дисквалификация..."
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={handleSave} className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-colors">
              {saved ? '✓ Результаты сохранены' : 'Сохранить результаты'}
            </button>
          </>
        )}
      </div>
    </MainLayout>
  );
}
