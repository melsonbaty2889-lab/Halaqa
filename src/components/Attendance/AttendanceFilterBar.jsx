// src/components/Attendance/AttendanceFilterBar.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Input from '@/components/UI/Input';

export default function AttendanceFilterBar({
  searchQuery,
  setSearchQuery,
  isRtl
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-5">
      <Input 
        type="text"
        icon={Search}
        placeholder={t('attendance.searchPlaceholder', 'البحث عن طالب بالنص أو المعرف...')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
