import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaUserCircle } from 'react-icons/fa';

export default function UpdatePassword() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [status, setStatus] = useState({ type: null, msg: '' });

  // جلب بيانات المستخدم الحالية
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          setStatus({
            type: 'error',
            msg: isRtl ? 'رابط إعادة التعيين غير صالح أو انتهت صلاحيته' : 'Invalid or expired reset link'
          });
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setFetchingUser(false);
      }
    }
    loadUser();
  }, [isRtl]);

  // حساب قوة كلمة المرور
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (password !== confirmPassword) {
      setStatus({ 
        type: 'error', 
        msg: isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' 
      });
      return;
    }

    if (strength < 2) {
      setStatus({ 
        type: 'error', 
        msg: isRtl ? 'يرجى اختيار كلمة مرور أقوى تحتوي على أرقام وحروف' : 'Please choose a stronger password' 
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl ? '✅ تم تحديث كلمة المرور بنجاح! جاري تحويلك...' : '✅ Password updated successfully! Redirecting...'
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.message || (isRtl ? 'حدث خطأ أثناء التحديث' : 'An error occurred')
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', color: '#fff' }}>
        {isRtl ? 'جاري التحقق من الحساب...' : 'Verifying user account...'}
      </div>
    );
  }

  // الحصول على اسم المستخدم المتاح في metadata أو الإيميل
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', fontFamily: "'Cairo', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#111C2A', padding: '35px 25px', borderRadius: '16px', border: '1px solid #1E2D3D', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: '#fff', fontSize: '22px', textAlign: 'center', marginBottom: '8px' }}>
          {isRtl ? 'تحديث كلمة المرور' : 'Update Password'}
        </h2>

        {/* عرض اسم المستخدم وحسابه */}
        {user && (
          <div style={{ background: '#090F16', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', border: '1px solid #1E2D3D' }}>
            <FaUserCircle style={{ color: '#C9A84C', fontSize: '24px' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </div>
              <div style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {status.msg && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#10B981' : '#EF4444',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {status.msg}
          </div>
        )}

        {user && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* كلمة المرور الجديدة */}
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                required
                style={{ width: '100%', padding: '12px 40px', borderRadius: '10px', border: '1px solid #223147', background: '#090F16', color: '#fff', outline: 'none' }}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '12px', color: '#64748b', cursor: 'pointer' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* مؤشر قوة كلمة المرور */}
            {password && (
              <div style={{ display: 'flex', gap: '5px', height: '4px', marginTop: '-8px' }}>
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    style={{ 
                      flex: 1, 
                      borderRadius: '2px', 
                      background: step <= strength 
                        ? (strength <= 1 ? '#EF4444' : strength <= 3 ? '#F59E0B' : '#10B981') 
                        : '#1E2D3D',
                      transition: 'all 0.3s' 
                    }} 
                  />
                ))}
              </div>
            )}

            {/* تأكيد كلمة المرور */}
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                required
                style={{ width: '100%', padding: '12px 40px', borderRadius: '10px', border: '1px solid #223147', background: '#090F16', color: '#fff', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '12px', background: '#C9A84C', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
            >
              {loading ? (isRtl ? 'جاري التحديث...' : 'Updating...') : (isRtl ? 'تحديث كلمة المرور' : 'Update Password')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
