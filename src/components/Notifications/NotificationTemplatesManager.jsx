import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // اضبط المسار حسب هيكلة مشروعك
import { LayoutTemplate, Plus, Save, History, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import colors from '@/theme/colors';

export default function NotificationTemplatesManager({ dir = 'rtl' }) {
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('whatsapp');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setTemplates(data);
    } catch (err) {
      console.error('خطأ في جلب القوالب:', err.message);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.error('خطأ في جلب السجلات:', err.message);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!name || !body) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم القالب ونصه.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('notification_templates')
        .insert([{ name, type, template_body: body, created_at: new Date().toISOString() }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'تم إضافة قالب الإشعار بنجاح!' });
      setName('');
      setBody('');
      fetchTemplates();
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      dir={dir} 
      style={{ backgroundColor: colors.surface || '#0F172A' }}
      className="w-full max-w-4xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <LayoutTemplate className="w-6 h-6 text-[#FBBF24]" />
          <h2 className="text-lg font-bold">إدارة قوالب وسجلات الإشعارات</h2>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form: Add New Template */}
      <form onSubmit={handleSaveTemplate} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FBBF24]">
          <Plus className="w-4 h-4" />
          <span>إنشاء قالب إشعار جديد</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">اسم القالب</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: تذكير بموعد الحلقة"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">قناة الإرسال</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="whatsapp">WhatsApp (واتساب)</option>
              <option value="email">Email (بريد إلكتروني)</option>
              <option value="system">System (إشعار نظام)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">محتوى القالب</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="السلام عليكم {student_name}، نود تذكيرك..."
            rows="3"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FBBF24] text-[#0F172A] text-xs font-bold rounded-xl hover:bg-[#FBBF24]/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'جاري الحفظ...' : 'حفظ القالب'}</span>
        </button>
      </form>

      {/* Templates Cards Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400">القوالب المسجلة ({templates.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-2 text-center">لا توجد قوالب مضافة بعد.</p>
          ) : (
            templates.map((tmpl) => (
              <div key={tmpl.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{tmpl.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#FBBF24] uppercase font-mono">{tmpl.type}</span>
                </div>
                <p className="text-xs text-slate-400 bg-black/20 p-2 rounded-lg font-mono leading-relaxed">{tmpl.template_body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
