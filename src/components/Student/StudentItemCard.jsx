// src/components/Student/StudentItemCard.jsx

import React from 'react';
import { User, ChevronLeft, Phone, Calendar } from 'lucide-react';
import { formatName } from '@/utils/formatters';

const StudentItemCard = ({ student, onClick, getStatusBadge }) => {
  const studentName = formatName(student.name || student.full_name || '');

  return (
    <div 
      onClick={() => onClick(student)}
      className="bg-dark-card border border-appBorder-card rounded-xl p-4 hover:border-appBorder-hover transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary-glow/10 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-dark-input border border-appBorder-input flex items-center justify-center text-appText-sub font-semibold group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0 overflow-hidden">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-appText-main group-hover:text-primary transition-colors flex items-center gap-2">
              {studentName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-appText-sub mt-1">
              {student.phone && (
                <span className="flex items-center gap-1" dir="ltr">
                  <Phone className="w-3 h-3 text-appText-muted" />
                  <span>{student.phone}</span>
                </span>
              )}
              {student.join_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-appText-muted" />
                  {new Date(student.join_date).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge && getStatusBadge(student.status)}
          <ChevronLeft className="w-5 h-5 text-appText-muted group-hover:text-appText-main group-hover:-translate-x-1 transition-all rtl:rotate-0 ltr:rotate-180" />
        </div>
      </div>
    </div>
  );
};

export default StudentItemCard;
