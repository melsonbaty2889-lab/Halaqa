import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CurriculumStructure from './CurriculumStructure';
import CurriculumProgress from './CurriculumProgress';
import { Plus, BookOpen, Layers } from 'lucide-react';

export default function CurriculumManagement({ academyId, students = [], isRtl = true }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' or 'progress'

  useEffect(() => {
    if (academyId) fetchCurricula();
  }, [academyId]);

  const fetchCurricula = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curricula')
        .select('*')
        .eq('academy_id', academyId);

      if (error) throw error;
      
      // تحويل البيانات لشكل المستويات المطلوب لـ CurriculumStructure
      const formattedLevels = (data || []).map(item => ({
        id: item.id,
        level_name: item.name || item.title,
        items_count: item.items?.length || 0,
        items: item.items || []
      }));

      setLevels(formattedLevels);
    } catch (err) {
      console.error('🚨 Error fetching curricula:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = async (e) => {
    e.preventDefault();
    if (!newLevelName.trim() || !academyId) return;

    try {
      const { data, error } = await supabase
        .from('curricula')
        .insert([{ academy_id: academyId, name: newLevelName, items: [] }])
        .select();

      if (error) throw error;

      if (data) {
        setLevels(prev => [...prev, { id: data[0].id, level_name: data[0].name, items_count: 0, items: [] }]);
      }
      setNewLevelName('');
      setShowAddModal(false);
    } catch (err) {
      console.error('🚨 Error adding curriculum level:', err.message);
    }
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'} font-['Cairo',sans-serif]`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 gap-4">
        <button
          onClick={() => setActiveTab('structure')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'structure' 
              ? 'border-[#E07A00] text-[#E07A00]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>هيكل المناهج والمستويات</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
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
      {activeTab === 'structure' ? (
        <CurriculumStructure 
          levels={levels} 
          onAddLevel={() => setShowAddModal(true)}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-400 text-xs">لا يوجد طلاب مرتبطين بالأكاديمية حالياً</div>
          ) : (
            students.map(student => (
              <CurriculumProgress 
                key={student.id} 
                studentId={student.id} 
                dir={isRtl ? 'rtl' : 'ltr'} 
              />
            ))
          )}
        </div>
      )}

      {/* Modal إضافة مستوى جديد */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">إضافة مستوى منهج جديد</h3>
            <form onSubmit={handleAddLevel} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم المستوى أو المنهج</label>
                <input 
                  type="text" 
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  placeholder="مثال: المستوى الأول - جزء عم"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E07A00]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E07A00] text-white hover:bg-[#C66B00]"
                >
                  حفظ المستوى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
