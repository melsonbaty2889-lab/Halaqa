/* src/components/Teachers/TeacherGrid.jsx */

import React from 'react';
import { Users } from 'lucide-react';
import { UI } from '@/theme/styles';
import TeacherCard from './TeacherCard';

export default function TeacherGrid({ 
  teachers = [], 
  onToggleStatus, 
  onManageAvailability, 
  t 
}) {
  if (teachers.length === 0) {
    return (
      <div className={`text-center py-16 ${UI.card} border-dashed text-semantic-textSecondary text-xs flex flex-col items-center justify-center gap-2`}>
        <Users className="w-10 h-10 text-semantic-textMuted/50 mb-1" />
        <span className="font-bold text-semantic-textPrimary text-sm">
          {t('teachers.noTeachersFound', 'لا توجد نتائج تطابق خيارات البحث')}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teachers.map((person) => (
        <TeacherCard 
          key={person.id}
          person={person}
          onToggleStatus={onToggleStatus}
          onManageAvailability={onManageAvailability}
          t={t}
        />
      ))}
    </div>
  );
}
