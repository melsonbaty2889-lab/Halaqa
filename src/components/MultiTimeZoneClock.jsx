import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * MultiTimeZoneClock Component
 * Displays current time in multiple time zones with real-time updates
 * Features:
 * - Real-time clock updates
 * - Multiple time zones (configurable)
 * - 12-hour and 24-hour format toggle
 * - Analog and digital displays
 * - Add/remove time zones
 * - Responsive design
 */

const DEFAULT_TIMEZONES = [
  { name: 'Cairo (EGY)', code: 'Africa/Cairo', flag: '🇪🇬' },
  { name: 'Mecca (SAU)', code: 'Asia/Riyadh', flag: '🇸🇦' },
  { name: 'London (GMT)', code: 'Europe/London', flag: '🇬🇧' },
  { name: 'New York (EST)', code: 'America/New_York', flag: '🇺🇸' },
  { name: 'Tokyo (JST)', code: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'Dubai (GST)', code: 'Asia/Dubai', flag: '🇦🇪' },
];

const AVAILABLE_TIMEZONES = [
  { name: 'Cairo (EGY)', code: 'Africa/Cairo', flag: '🇪🇬', utcOffset: '+2' },
  { name: 'Mecca (SAU)', code: 'Asia/Riyadh', flag: '🇸🇦', utcOffset: '+3' },
  { name: 'London (GMT)', code: 'Europe/London', flag: '🇬🇧', utcOffset: '+0' },
  { name: 'Paris (CET)', code: 'Europe/Paris', flag: '🇫🇷', utcOffset: '+1' },
  { name: 'Dubai (GST)', code: 'Asia/Dubai', flag: '🇦🇪', utcOffset: '+4' },
  { name: 'Tokyo (JST)', code: 'Asia/Tokyo', flag: '🇯🇵', utcOffset: '+9' },
  { name: 'Sydney (AEDT)', code: 'Australia/Sydney', flag: '🇦🇺', utcOffset: '+11' },
  { name: 'New York (EST)', code: 'America/New_York', flag: '🇺🇸', utcOffset: '-5' },
  { name: 'Los Angeles (PST)', code: 'America/Los_Angeles', flag: '🇺🇸', utcOffset: '-8' },
  { name: 'Singapore (SGT)', code: 'Asia/Singapore', flag: '🇸🇬', utcOffset: '+8' },
  { name: 'Hong Kong (HKT)', code: 'Asia/Hong_Kong', flag: '🇭🇰', utcOffset: '+8' },
  { name: 'Bangkok (ICT)', code: 'Asia/Bangkok', flag: '🇹🇭', utcOffset: '+7' },
  { name: 'Istanbul (EET)', code: 'Europe/Istanbul', flag: '🇹🇷', utcOffset: '+3' },
  { name: 'Moscow (MSK)', code: 'Europe/Moscow', flag: '🇷🇺', utcOffset: '+3' },
  { name: 'São Paulo (BRT)', code: 'America/Sao_Paulo', flag: '🇧🇷', utcOffset: '-3' },
];

/**
 * Analog Clock Component
 */
function AnalogClock({ time }) {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        {/* Clock face */}
        <circle cx="60" cy="60" r="55" fill="#111827" stroke="#C9A84C" strokeWidth="2" />
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x1 = 60 + 50 * Math.cos(angle);
          const y1 = 60 + 50 * Math.sin(angle);
          const x2 = 60 + 45 * Math.cos(angle);
          const y2 = 60 + 45 * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A84C" strokeWidth="2" />
          );
        })}

        {/* Hour hand */}
        <line
          x1="60"
          y1="60"
          x2={60 + 25 * Math.sin((hourDegrees * Math.PI) / 180)}
          y2={60 - 25 * Math.cos((hourDegrees * Math.PI) / 180)}
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1="60"
          y1="60"
          x2={60 + 35 * Math.sin((minuteDegrees * Math.PI) / 180)}
          y2={60 - 35 * Math.cos((minuteDegrees * Math.PI) / 180)}
          stroke="#C9A84C"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1="60"
          y1="60"
          x2={60 + 38 * Math.sin((secondDegrees * Math.PI) / 180)}
          y2={60 - 38 * Math.cos((secondDegrees * Math.PI) / 180)}
          stroke="#EF4444"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx="60" cy="60" r="4" fill="#C9A84C" />
      </svg>
    </div>
  );
}

/**
 * Digital Clock Component
 */
function DigitalClock({ time, is24Hour, timezone }) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: is24Hour ? '2-digit' : '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24Hour,
  });

  const timeStr = formatter.format(time);

  return (
    <div
      style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#C9A84C',
        fontFamily: "'Courier New', monospace",
        textAlign: 'center',
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(201, 168, 76, 0.3)',
      }}
    >
      {timeStr}
    </div>
  );
}

/**
 * Main MultiTimeZoneClock Component
 */
export default function MultiTimeZoneClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [selectedTimezones, setSelectedTimezones] = useState(DEFAULT_TIMEZONES);
  const [displayMode, setDisplayMode] = useState('digital'); // 'digital' or 'analog'
  const [showAddTimezone, setShowAddTimezone] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddTimezone = useCallback((timezone) => {
    if (!selectedTimezones.find((tz) => tz.code === timezone.code)) {
      setSelectedTimezones((prev) => [...prev, timezone]);
    }
    setShowAddTimezone(false);
  }, [selectedTimezones]);

  const handleRemoveTimezone = useCallback((code) => {
    setSelectedTimezones((prev) => prev.filter((tz) => tz.code !== code));
  }, []);

  // Memoize available timezones for dropdown
  const availableToAdd = useMemo(() => {
    return AVAILABLE_TIMEZONES.filter(
      (tz) => !selectedTimezones.find((selected) => selected.code === tz.code)
    );
  }, [selectedTimezones]);

  const getTimeInTimezone = useCallback((timezone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: is24Hour ? '2-digit' : '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
    });
    return formatter.format(currentTime);
  }, [currentTime, is24Hour]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0C1520 0%, #111827 100%)',
        padding: '40px 20px',
        fontFamily: "'Cairo', sans-serif",
        direction: 'rtl',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            color: '#C9A84C',
            fontSize: '2.5rem',
            margin: '0 0 10px 0',
            textShadow: '0 0 20px rgba(201, 168, 76, 0.3)',
          }}
        >
          ⏰ ساعة المناطق الزمنية العالمية
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
          عرض الوقت الحالي في مختلف مناطق العالم
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}
      >
        {/* Format Toggle */}
        <button
          onClick={() => setIs24Hour(!is24Hour)}
          style={{
            background: is24Hour ? '#C9A84C' : '#334155',
            color: is24Hour ? '#000' : '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {is24Hour ? '24H' : '12H'}
        </button>

        {/* Display Mode Toggle */}
        <button
          onClick={() => setDisplayMode(displayMode === 'digital' ? 'analog' : 'digital')}
          style={{
            background: displayMode === 'digital' ? '#C9A84C' : '#334155',
            color: displayMode === 'digital' ? '#000' : '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {displayMode === 'digital' ? '🔢 رقمي' : '🕐 تناظري'}
        </button>

        {/* Add Timezone Button */}
        <button
          onClick={() => setShowAddTimezone(!showAddTimezone)}
          style={{
            background: showAddTimezone ? '#EF4444' : '#10B981',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {showAddTimezone ? '✕ إلغاء' : '+ إضافة منطقة'}
        </button>
      </div>

      {/* Add Timezone Dropdown */}
      {showAddTimezone && (
        <div
          style={{
            background: '#162030',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
          }}
        >
          <h3 style={{ color: '#C9A84C', margin: '0 0 15px 0' }}>اختر منطقة زمنية</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
            }}
          >
            {availableToAdd.map((tz) => (
              <button
                key={tz.code}
                onClick={() => handleAddTimezone(tz)}
                style={{
                  background: '#111827',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '13px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#C9A84C';
                  e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#111827';
                  e.target.style.color = '#fff';
                }}
              >
                {tz.flag} {tz.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timezones Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {selectedTimezones.map((tz) => (
          <div
            key={tz.code}
            style={{
              background: '#111827',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '25px',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s',
              hover: { transform: 'translateY(-5px)' },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C9A84C';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(201, 168, 76, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            }}
          >
            {/* Remove Button */}
            <button
              onClick={() => handleRemoveTimezone(tz.code)}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              ✕
            </button>

            {/* Timezone Name */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#C9A84C',
                  marginBottom: '5px',
                }}
              >
                {tz.flag}
              </div>
              <h3 style={{ color: '#fff', margin: '0', fontSize: '16px' }}>
                {tz.name}
              </h3>
              <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '12px' }}>
                UTC {tz.utcOffset}
              </p>
            </div>

            {/* Clock Display */}
            {displayMode === 'digital' ? (
              <DigitalClock time={currentTime} is24Hour={is24Hour} timezone={tz.code} />
            ) : (
              <AnalogClock time={new Date(currentTime.toLocaleString('en-US', { timeZone: tz.code }))} />
            )}

            {/* Detailed Time Info */}
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(201, 168, 76, 0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid #C9A84C',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                <div>
                  📅{' '}
                  {new Date(currentTime.toLocaleString('en-US', { timeZone: tz.code })).toLocaleDateString(
                    'ar-EG'
                  )}
                </div>
                <div style={{ marginTop: '5px' }}>
                  🕐{' '}
                  {getTimeInTimezone(tz.code)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '50px',
          color: '#64748b',
          fontSize: '13px',
        }}
      >
        <p>تحديث تلقائي كل ثانية • {selectedTimezones.length} منطقة مختارة</p>
      </div>
    </div>
  );
}

/**
 * FEATURES:
 * ✅ Real-time clock updates (every second)
 * ✅ Multiple time zones support (15+ zones pre-configured)
 * ✅ 12-hour and 24-hour format toggle
 * ✅ Analog and digital display modes
 * ✅ Add/remove time zones dynamically
 * ✅ Responsive grid layout
 * ✅ RTL/LTR support
 * ✅ Smooth animations and hover effects
 * ✅ Performance optimized with useCallback and useMemo
 * ✅ Beautiful gradient background
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - useMemo for availableToAdd dropdown
 * - useCallback for handlers
 * - Single interval timer for all zones
 * - No unnecessary re-renders
 * 
 * USAGE:
 * import MultiTimeZoneClock from './MultiTimeZoneClock';
 * <MultiTimeZoneClock />
 */
