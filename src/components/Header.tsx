import React from 'react';
import { Send, PhoneCall } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSupportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSupportModal,
}) => {
  const navItems = [
    { id: 'sender', label: 'استوديو الحملات والإرسال' },
    { id: 'guide', label: 'دليل التشغيل والاستخدام' },
    { id: 'extractor', label: 'استخراج وتصفية الأرقام' },
    { id: 'autoresponder', label: 'الرد الآلي والشات بوت' },
    { id: 'antiban', label: 'دليل الحماية من الحظر' },
    { id: 'tutorials', label: 'شروحات الفيديو' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Single text element brand wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#008069] flex items-center justify-center text-white shadow-xs">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <button
              onClick={() => setActiveTab('sender')}
              className="text-right text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-[#008069] transition-colors cursor-pointer"
            >
              واتس برو
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#e7f7f3] text-[#008069] border border-[#008069]/20 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions - Support Button only, No Order or Activation */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSupportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#008069]" />
              <span>الدعم الفني المباشر</span>
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Horizontal Navigation Tabs */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#e7f7f3] text-[#008069] font-bold border border-[#008069]/30'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
