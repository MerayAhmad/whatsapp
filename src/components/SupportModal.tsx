import React from 'react';
import { X, Headphones, MessageSquare, ExternalLink } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const supportNumber = '+966500000000';
  const supportText = encodeURIComponent('السلام عليكم ورحمة الله وبركاته، أحتاج إلى دعم فني ومساعدة بخصوص برنامج واتس برو لإرسال الرسائل التسويقية.');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl relative text-right">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069] shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">فريق الدعم الفني المباشر</h3>
            <p className="text-xs text-slate-500">خدمة عملاء 24/7 عبر محادثة واتساب الرسمية</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          نحن متواجدون لمساعدتك في أي استفسار تقني، وتوجيهك لأفضل ممارسات الحملات الإعلانية بدون حظر، وتقديم المساعدة عن بُعد مجاناً.
        </p>

        <div className="space-y-2.5">
          <a
            href={`https://wa.me/966500000000?text=${supportText}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>محادثة واتساب مباشرة مع الدعم</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600 font-mono">
            الرقم المعتمد: {supportNumber}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>ساعات العمل: متواصل على مدار الساعة</span>
          <span className="text-[#008069] font-medium">متوسط وقت الاستجابة: أقل من 5 دقائق</span>
        </div>

      </div>
    </div>
  );
};
