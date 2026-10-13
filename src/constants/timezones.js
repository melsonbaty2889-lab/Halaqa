/* src/constants/timezones.js */

export const getTimezoneOptions = (t) => [
  { 
    value: 'UTC', 
    label: t('timezones.utc', 'التوقيت العالمي المنسق (UTC)') 
  },
  { 
    value: 'Africa/Cairo', 
    label: t('timezones.cairo', 'القاهرة، مصر (UTC+2 / UTC+3)') 
  },
  { 
    value: 'Asia/Riyadh', 
    label: t('timezones.riyadh', 'الرياض / مكة المكرمة، السعودية (UTC+3)') 
  },
  { 
    value: 'Europe/Istanbul', 
    label: t('timezones.istanbul', 'إسطنبول، تركيا (UTC+3)') 
  },
  { 
    value: 'Asia/Jakarta', 
    label: t('timezones.jakarta', 'جاكرتا، إندونيسيا (UTC+7)') 
  },
  { 
    value: 'Asia/Karachi', 
    label: t('timezones.karachi', 'كراتشي، باكستان (UTC+5)') 
  },
  { 
    value: 'Europe/Paris', 
    label: t('timezones.paris', 'باريس، فرنسا (UTC+1 / UTC+2)') 
  },
  { 
    value: 'America/New_York', 
    label: t('timezones.newYork', 'نيويورك، الولايات المتحدة (UTC-5 / UTC-4)') 
  }
];
