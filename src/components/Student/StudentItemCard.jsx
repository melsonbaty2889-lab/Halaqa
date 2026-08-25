import React from 'react';
import { User, ChevronLeft, Phone, Calendar } from 'lucide-react';
import { formatName } from '@/utils/formatters';

const StudentItemCard = ({ student, onClick, getStatusBadge }) => {
  const studentName = formatName(student.name || student.full_name || '');

  return (
    <div 
      onClick={() => onClick(student)}
      className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 hover:border-slate-600 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary-500/5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-700/80 border border-slate-600/80 flex items-center justify-center text-slate-300 font-semibold group-hover:border-primary-500/50 group-hover:text-primary-400 transition-colors shrink-0">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={studentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 group-hover:text-primary-400 transition-colors flex items-center gap-2">
              {studentName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">{student.phone}</span>
                </span>
              )}
              {student.join_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(student.join_date).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge && getStatusBadge(student.status)}
          <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-300 group-hover:-translate-x-1 transition-all rtl:rotate-0 ltr:rotate-180" />
        </div>
      </div>
    </div>
  );
};

export default StudentItemCard;
