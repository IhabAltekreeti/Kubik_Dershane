import React from 'react';
import { UserRole } from '../../types';
import { 
  Compass, 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenAssessment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  onOpenAssessment
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top institution alert / indicator bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-100">Kübik Dershanesi Eğitim Ağı</span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-300 hidden sm:inline">Fiziksel Kampüs & Hibrit Dijital Akademi Prototipi</span>
          </div>
          <span className="text-slate-300 text-[11px]">Prototip · Ekranlardaki öğrenci verileri örnektir</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectRole('public')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-800 group-hover:bg-indigo-800 transition-colors">
              <span className="tracking-tighter">K³</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">KÜBİK</span>
                <span className="font-light text-indigo-700 text-lg">DİJİTAL</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                LGS & YKS Akıllı Akademi
              </p>
            </div>
          </div>

          {/* Role Navigation Segmented Control */}
          <nav className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => onSelectRole('public')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentRole === 'public'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tanıtım & Vizyon</span>
            </button>

            <button
              onClick={() => onSelectRole('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentRole === 'student'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Öğrenci Portalı</span>
            </button>

            <button
              onClick={() => onSelectRole('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentRole === 'teacher'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Öğretmen Paneli</span>
            </button>

            <button
              onClick={() => onSelectRole('parent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentRole === 'parent'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Veli Portalı</span>
            </button>

          </nav>

          {/* Right Action: Free Assessment & Mobile Role Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAssessment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ücretsiz Seviye Tespiti</span>
            </button>

 
          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-2 text-xs">
          <button
            onClick={() => onSelectRole('public')}
            className={`px-2.5 py-1 rounded-sm whitespace-nowrap font-medium ${
              currentRole === 'public' ? 'bg-indigo-900 text-white' : 'text-slate-600'
            }`}
          >
            Tanıtım
          </button>
          <button
            onClick={() => onSelectRole('student')}
            className={`px-2.5 py-1 rounded-sm whitespace-nowrap font-medium ${
              currentRole === 'student' ? 'bg-indigo-900 text-white' : 'text-slate-600'
            }`}
          >
            Öğrenci
          </button>
          <button
            onClick={() => onSelectRole('teacher')}
            className={`px-2.5 py-1 rounded-sm whitespace-nowrap font-medium ${
              currentRole === 'teacher' ? 'bg-indigo-900 text-white' : 'text-slate-600'
            }`}
          >
            Öğretmen
          </button>
          <button
            onClick={() => onSelectRole('parent')}
            className={`px-2.5 py-1 rounded-sm whitespace-nowrap font-medium ${
              currentRole === 'parent' ? 'bg-indigo-900 text-white' : 'text-slate-600'
            }`}
          >
            Veli
          </button>
        </div>
      </div>
    </header>
  );
};
