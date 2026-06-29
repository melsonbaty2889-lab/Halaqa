/* src/components/AdminDashboard.jsx */
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { supabase } from '../lib/supabase'; // اتصال السوبابيس المباشر
import { 
  FaCalendarAlt, 
  FaBuilding, 
  FaClock, 
  FaCheckCircle, 
  FaShieldAlt,
  FaBan,
  FaHourglassHalf,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

export default function AdminDashboard({ 
  isRtl = true, 
  academyName,
  onLogout
}) {
  
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [activeAcademies, setActiveAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // 🔍 حالات البحث والفلترة الذكية
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('academies')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;
      setPendingAcademies(pendingData || []);

      const { data: activeData, error: activeError } = await supabase
        .from('academies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;
      setActiveAcademies(activeData || []);

      const { count, error: countError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (!countError && count !== null) {
        setTotalAcademiesCount(count);
      }

    } catch (error) {
      console.error("Error fetching admin dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onActivateClick = async (id) => {
    if (processingId) return;
    setProcessingId(`activate-${id}`);
    try {
      const { error } = await supabase
        .from('academies')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;

      const activatedAcademy = pendingAcademies.find(a => a.id === id);
      setPendingAcademies(prev => prev.filter(a => a.id !== id));
      if (activatedAcademy) {
        setActiveAcademies(prev => [{ ...activatedAcademy, is_active: true }, ...prev]);
      }
      
      setProcessingId(null);
      alert(isRtl ? 'تم تفعيل واعتماد الأكاديمية بنجاح! 🎉' : 'Academy activated successfully! 🎉');
    } catch (error) {
      console.error("Activation failed:", error);
      setProcessingId(null);
      alert(isRtl ? 'حدث خطأ أثناء التفعيل: ' + error.message : 'Activation error: ' + error.message);
    }
  };

  const onDeactivateClick = async (id) => {
    if (processingId) return;
    
    const confirmAction = window.confirm(
      isRtl ? 'هل أنت متأكد من رغبتك في إيقاف تفعيل هذه الأكاديمية وحظر وصولها؟' : 'Are you sure you want to deactivate this academy?'
    );
    if (!confirmAction) return;

    setProcessingId(`deactivate-${id}`);
    try {
      const { error } = await supabase
        .from('academies')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      const deactivatedAcademy = activeAcademies.find(a => a.id === id);
      if (activeAcademies) {
        setActiveAcademies(prev => prev.filter(a => a.id !== id));
      }
      if (deactivatedAcademy) {
        setPendingAcademies(prev => [{ ...deactivatedAcademy, is_active: false }, ...prev]);
      }

      setProcessingId(null);
      alert(isRtl ? 'تم إيقاف تفعيل الأكاديمية ونقلها لطابور الانتظار.' : 'Academy deactivated.');
    } catch (error) {
      console.error("Deactivation failed:", error);
      setProcessingId(null);
      alert(error.message);
    }
  };

  const onExtendTrialClick = async (id, currentTrialEnds, daysToAdd) => {
    if (processingId) return;
    setProcessingId(`extend-${daysToAdd}-${id}`);
    try {
      const current = currentTrialEnds ? new Date(currentTrialEnds) : new Date();
      const baseDate = current > new Date() ? current : new Date();
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      const newExtensionDate = baseDate.toISOString();

      const { error } = await supabase
        .from('academies')
        .update({ trial_ends_at: newExtensionDate })
        .eq('id', id);

      if (error) throw error;

      setActiveAcademies(prev => prev.map(a => a.id === id ? { ...a, trial_ends_at: newExtensionDate } : a));
      setPendingAcademies(prev => prev.map(a => a.id === id ? { ...a, trial_ends_at: newExtensionDate } : a));

      setProcessingId(null);
      
      alert(isRtl 
        ? `تم تمديد الفترة التجريبية ${daysToAdd} يوماً إضافياً بنجاح! 📅` 
        : `Trial extended by ${daysToAdd} days successfully!`
      );
    } catch (error) {
      console.error("Extension failed:", error);
      setProcessingId(null);
      alert(error.message);
    }
  };

  const getTrialStatusBadge = (trialEndsAt) => {
    if (!trialEndsAt) return { text: isRtl ? 'حساب دائم' : 'Lifetime Account', color: '#94a3b8' };
    
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: isRtl ? 'منتهية التجربة ⚠️' : 'Trial Expired ⚠️', color: '#EF4444' };
    } else if (diffDays === 0) {
      return { text: isRtl ? 'تنتهي اليوم ⏳' : 'Expires Today ⏳', color: '#F59E0B' };
    } else {
      return { text: isRtl ? `متبقي ${diffDays} أيام تجريبية` : `${diffDays} days left`, color: '#10B981' };
    }
  };

  const getHijriDateInternal = () => {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  };

  const getGregorianDateInternal = () => {
    return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRequestDate = (dateString) => {
    try {
      if (!dateString) return '---';
      return new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) {
      return '---';
    }
  };

  const formatExpiryDate = (dateString) => {
    try {
      if (!dateString) return '---';
      return new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return '---';
    }
  };

  // 🎯 منطق التصفية الذكي واللحظي بناءً على نص البحث
  const filteredPendingAcademies = pendingAcademies.filter(academy => 
    academy.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActiveAcademies = activeAcademies.filter(academy => 
    academy.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr', padding: '20px', minHeight: '100vh' }}>
      
      <header className={styles.adminHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.adminTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaShieldAlt size={22} style={{ color: '#FBBF24' }} />
            <span>{isRtl ? 'لوحة التحكم العامة (السوبر أدمن)' : 'Super-Admin Dashboard'}</span>
          </h1>
          <p className={styles.adminSubtitle}>
            {academyName || (isRtl ? "إدارة الأكاديميات والاشتراكات" : "Academies & Subscriptions Management")}
          </p>
        </div>

        {onLogout && (
          <button 
            onClick={onLogout}
            style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isRtl ? 'تسجيل الخروج' : 'Logout'}
          </button>
        )}

        <div className={styles.dateTimeBadge}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24', fontSize: '0.85rem', fontWeight: '600' }}>
            <FaCalendarAlt size={12} style={{ color: '#3B82F6' }} />
            <span>{getHijriDateInternal()}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '2px' }}>
            {getGregorianDateInternal()}
          </div>
        </div>
      </header>

      <div className={styles.statsGrid} style={{ marginBottom: '25px', marginTop: '20px' }}>
        <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'إجمالي الأكاديميات المسجلة' : 'Total Registered Academies'}</p>
            <h2 className={styles.statNumber}>{loading ? '...' : totalAcademiesCount}</h2>
          </div>
          <div className={styles.statIcon}><FaBuilding /></div>
        </div>

        <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'طلبات التفعيل المعلقة' : 'Pending Activation Requests'}</p>
            <h2 className={styles.statNumber} style={{ color: pendingAcademies.length > 0 ? '#F87171' : 'inherit' }}>
              {loading ? '...' : pendingAcademies.length}
            </h2>
          </div>
          <div className={styles.statIcon}><FaClock /></div>
        </div>
      </div>

      {/* 🔍 شريط البحث الذكي الاحترافي المضاف */}
      <div style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 20px',
        marginBottom: '35px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <FaSearch style={{ color: '#94A3B8', fontSize: '1.1rem' }} />
        <input 
          type="text"
          placeholder={isRtl ? "ابحث عن الأكاديمية بالاسم فورا..." : "Search academy by name instantly..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#F8FAFC',
            fontSize: '0.95rem',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
        {searchQuery && (
          <FaTimes 
            onClick={() => setSearchQuery('')}
            style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '1rem' }} 
          />
        )}
      </div>

      {/* القسم 1: طلبات الانضمام المعلقة */}
      <section className={styles.superAdminView} style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className={styles.listTitle} style={{ margin: 0 }}>
            <span>📋</span> {isRtl ? 'طلبات الأكاديميات بانتظار التفعيل' : 'Academies Awaiting Activation'}
          </h2>
          <button onClick={fetchDashboardData} style={{ background: '#1E293B', color: '#FBBF24', border: '1px solid #374151', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            🔄 {isRtl ? 'تحديث البيانات' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}><p>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p></div>
        ) : filteredPendingAcademies.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? (
              <p style={{ margin: 0, color: '#94A3B8' }}>{isRtl ? 'لا توجد طلبات معلقة تطابق بحثك.' : 'No pending requests match your search.'}</p>
            ) : (
              <>
                <FaCheckCircle size={32} style={{ color: '#10B981', marginBottom: '12px', display: 'block', margin: '0 auto 12px auto' }} />
                <p style={{ margin: 0 }}>{isRtl ? 'المنظومة مستقرة. لا توجد طلبات تفعيل معلقة حالياً.' : 'System stable. No pending activation requests.'}</p>
              </>
            )}
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {filteredPendingAcademies.map((academy) => {
              const isActivateLoading = processingId === `activate-${academy.id}`;
              const badge = getTrialStatusBadge(academy.trial_ends_at);
              return (
                <div key={academy.id} className={styles.requestCard}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName}>{academy.name}</h3>
                    <p className={styles.requestEmail}>{isRtl ? 'تقديم:' : 'Date:'} {formatRequestDate(academy.created_at)}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: badge.color, fontWeight: 'bold' }}>
                        {badge.text}
                      </span>
                      {academy.trial_ends_at && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {isRtl ? `تنتهي في: ${formatExpiryDate(academy.trial_ends_at)}` : `Expires on: ${formatExpiryDate(academy.trial_ends_at)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => onActivateClick(academy.id)}
                    disabled={processingId !== null}
                    className={`${styles.approveBtn} ${styles.approveBtnActive}`}
                    style={{ minWidth: '110px' }}
                  >
                    {isActivateLoading ? (isRtl ? 'جاري...' : 'Activating...') : (isRtl ? 'تفعيل واعتماد' : 'Activate')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* القسم 2: الأكاديميات النشطة حالياً */}
      <section className={styles.superAdminView}>
        <h2 className={styles.listTitle} style={{ marginBottom: '15px' }}>
          <span>✅</span> {isRtl ? 'الأكاديميات النشطة على المنصة' : 'Active Platform Academies'}
        </h2>

        {loading ? (
          <div className={styles.emptyState}><p>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p></div>
        ) : filteredActiveAcademies.length === 0 ? (
          <div className={styles.emptyState}>
            <p style={{ margin: 0, color: '#94A3B8' }}>
              {searchQuery ? (isRtl ? 'لا توجد أكاديميات نشطة تطابق بحثك.' : 'No active academies match your search.') : (isRtl ? 'لا توجد أكاديميات نشطة حالياً.' : 'No active academies found.')}
            </p>
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {filteredActiveAcademies.map((academy) => {
              const isDeactivateLoading = processingId === `deactivate-${academy.id}`;
              const isExtend7Loading = processingId === `extend-7-${academy.id}`;
              const isExtend30Loading = processingId === `extend-30-${academy.id}`;
              const badge = getTrialStatusBadge(academy.trial_ends_at);
              return (
                <div key={academy.id} className={styles.requestCard} style={{ borderRight: '4px solid #10B981' }}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName}>{academy.name}</h3>
                    <p className={styles.requestEmail}>{isRtl ? 'تاريخ البدء:' : 'Started:'} {formatRequestDate(academy.created_at)}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: badge.color, fontWeight: 'bold' }}>
                        {badge.text}
                      </span>
                      {academy.trial_ends_at && (
                        <span style={{ fontSize: '0.72rem', color: '#e2e8f0', background: '#1e293b', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '2px' }}>
                          {isRtl ? `📅 ينتهي بتاريخ: ${formatExpiryDate(academy.trial_ends_at)}` : `📅 Expires: ${formatExpiryDate(academy.trial_ends_at)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* زر تمديد 7 أيام */}
                    <button
                      onClick={() => onExtendTrialClick(academy.id, academy.trial_ends_at, 7)}
                      disabled={processingId !== null}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #475569',
                        color: '#FBBF24',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaHourglassHalf size={10} />
                      <span>{isExtend7Loading ? (isRtl ? 'جاري...' : 'Extending...') : (isRtl ? '+7 أيام' : '+7 Days')}</span>
                    </button>

                    {/* زر تمديد 30 يوم */}
                    <button
                      onClick={() => onExtendTrialClick(academy.id, academy.trial_ends_at, 30)}
                      disabled={processingId !== null}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #FBBF24',
                        color: '#FFF',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaHourglassHalf size={10} style={{ color: '#FBBF24' }} />
                      <span>{isExtend30Loading ? (isRtl ? 'جاري...' : 'Extending...') : (isRtl ? '+30 يوم' : '+30 Days')}</span>
                    </button>

                    {/* زر إيقاف التفعيل */}
                    <button 
                      onClick={() => onDeactivateClick(academy.id)}
                      disabled={processingId !== null}
                      className={styles.approveBtn}
                      style={{ 
                        minWidth: '90px', 
                        background: '#EF4444', 
                        borderColor: '#EF4444',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '6px 10px'
                      }}
                    >
                      <FaBan size={11} />
                      <span>{isDeactivateLoading ? (isRtl ? 'جاري...' : 'Processing...') : (isRtl ? 'إيقاف مؤقت' : 'Deactivate')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
