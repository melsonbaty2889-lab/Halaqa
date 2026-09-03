import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import CurriculumStructure from './CurriculumStructure';
import CurriculumProgress from './CurriculumProgress';
import { Plus, BookOpen, Layers, Loader2 } from 'lucide-react';

export default function CurriculumManagement({ academyId, students = [], isRtl = true }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' or 'progress'

  const fetchCurricula = useCallback(async () => {
    if (!academyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curricula')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // تحويل البيانات لشكل المستويات المطلوب لـ CurriculumStructure
      const formattedLevels = (data || []).map(item => ({
        id: item.id,
        level_name: item.name || item.title || '',
        items_count: Array.isArray(item.items) ? item.items.length : 0,
        items: item.items || []
      }));

      setLevels(formattedLevels);
    } catch (err) {
      console.error('🚨 Error fetching curricula:', err.message);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchCurricula();
  }, [fetchCurricula]);

  const handleAddLevel = async (e) => {
    e.preventDefault();
    if (!newLevelName.trim() || !academyId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('curricula')
        .insert([{ academy_id: academyId, name: newLevelName.trim(), items: [] }]);

      if (error) throw error;

      setNewLevelName('');
      setShowAddModal(false);
      await fetchCurricula(); // إعادة جلب البيانات لضمان المزامنة
    } catch (err) {
      console.error('🚨 Error adding curriculum level:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'} font-['Cairo',sans-serif]`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('structure')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'structure' 
              ? 'border-[#E07A00] text-[#E07A00]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>هيكل المناهج والمستويات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'progress' 
              ? 'border-[#E07A00] text-[#E07A00]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>متابعة تقدم الطلاب</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#E07A00]" />
          <span className="text-xs">جاري تحميل المناهج...</span>
        </div>
      ) : activeTab === 'structure' ? (
        <CurriculumStructure 
          levels={levels} 
          onAddLevel={() => setShowAddModal(true)}
          onRefresh={fetchCurricula}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-400 text-xs bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
              لا يوجد طلاب مرتبطين بالأكاديمية حالياً
            </div>
          ) : (
            students.map(student => (
              <CurriculumProgress 
                key={student.id} 
                studentId={student.id} 
                student={student}
                dir={isRtl ? 'rtl' : 'ltr'} 
              />
            ))
          )}
        </div>
      )}

      {/* Modal إضافة مستوى جديد */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">إضافة مستوى منهج جديد</h3>
            <form onSubmit={handleAddLevel} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم المستوى أو المنهج *</label>
                <input 
                  type="text" 
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  placeholder="مثال: المستوى الأول - جزء عم"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E07A00] transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E07A00] text-white hover:bg-[#C66B00] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ المستوى'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
