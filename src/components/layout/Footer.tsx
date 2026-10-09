import React from 'react';
import { UserRole } from '../../types';

interface FooterProps {
  onSelectRole: (role: UserRole) => void;
  onOpenAssessment: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectRole,
  onOpenAssessment
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <span className="w-6 h-6 rounded bg-indigo-700 flex items-center justify-center text-xs">K³</span>
              <span>KÜBİK DİJİTAL AKADEMİ</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Kübik Dershanesi Eğitim Ağının yapay zeka destekli LGS (8. Sınıf) ve YKS (11. Sınıf) hibrit öğrenme platformu prototipi.
            </p>
            <div className="text-[11px] text-slate-500">
              İstanbul Kampüsü & Türkiye Geneli Hibrit Ağ
            </div>
          </div>

          {/* Quick links to workspaces */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">Çalışma Alanları</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => onSelectRole('public')} className="hover:text-white transition-colors">
                  Tanıtım & Vizyon
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole('student')} className="hover:text-white transition-colors">
                  Öğrenci Portalı & Çalışma Planı
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole('teacher')} className="hover:text-white transition-colors">
                  Öğretmen & Zümre Paneli
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole('parent')} className="hover:text-white transition-colors">
                  Veli Bilgilendirme Portalı
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole('management')} className="hover:text-white transition-colors">
                  Yönetim & Büyüme Analitiği
                </button>
              </li>
            </ul>
          </div>

          {/* Educational tracks */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">Hazırlık Programları</div>
            <ul className="space-y-1.5 text-[11px]">
              <li className="text-slate-400">8. Sınıf LGS: Matematik, Fen, Türkçe, İnkılap</li>
              <li className="text-slate-400">11. Sınıf YKS: Sayısal (Matematik, Fizik, Kimya, Biyo)</li>
              <li className="text-slate-400">TYT Paragraf & Temel Matematik Rutinleri</li>
              <li className="text-slate-400">Kübik 6 Adımlı Öğrenme Döngüsü</li>
            </ul>
          </div>

          {/* Fast CTA */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">Hızlı Başlangıç</div>
            <p className="text-[11px] text-slate-400">
              3 dakikalık tanı testiyle öğrencinizin konu açıklarını hemen keşfedin.
            </p>
            <button
              onClick={onOpenAssessment}
              className="w-full py-2 px-3 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded text-xs transition-colors"
            >
              Ücretsiz Seviye Tespiti Yap
            </button>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Kübik Dershanesi Eğitim Kurumları. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Gizlilik Politikası</span>
            <span>KVKK Aydınlatma Metni</span>
            <span>Kullanım Koşulları</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
