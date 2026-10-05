import React from 'react';
import { Phone, Video, MoreVertical, CheckCheck, FileText, Play, ExternalLink, ShieldCheck } from 'lucide-react';
import { Contact, MessagePayload } from '../types';

interface WhatsAppPreviewProps {
  payload: MessagePayload;
  selectedContact?: Contact;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({ payload, selectedContact }) => {
  // Replace tags with current sample contact data
  const renderMessageText = () => {
    let msg = payload.text || 'أهلاً بك، تفضل بالاطلاع على أحدث عروضنا وتفاصيل خدماتنا المميزة!';
    
    // Evaluate spintax like {مرحباً|أهلاً|تحياتنا}
    msg = msg.replace(/\{([^{}]+)\}/g, (match, choices) => {
      if (match === '{name}' || match === '{الاسم}') {
        return selectedContact?.name || 'أحمد محمود';
      }
      if (match === '{phone}' || match === '{الرقم}') {
        return selectedContact?.phone || '+966501234567';
      }
      if (match === '{customVar}' || match === '{كود_الخصم}' || match === '{المنتج}') {
        return selectedContact?.customVar || 'كوبون VIP20';
      }
      if (choices.includes('|')) {
        const parts = choices.split('|');
        return parts[0];
      }
      return match;
    });

    return msg;
  };

  const formattedTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="w-full max-w-[340px] sm:max-w-[370px] mx-auto rounded-[36px] bg-slate-900 border-[6px] border-slate-700 shadow-xl overflow-hidden flex flex-col h-[580px] select-none text-slate-900">
      
      {/* Phone Notch & Sensor */}
      <div className="bg-slate-950 pt-2 pb-1 flex justify-center items-center">
        <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-950"></div>
        </div>
      </div>

      {/* WhatsApp Header - Authentic Official WhatsApp Green */}
      <div className="bg-[#008069] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white">
            {selectedContact?.name?.charAt(0) || 'ع'}
          </div>
          <div>
            <div className="text-sm font-bold leading-tight flex items-center gap-1">
              <span>{selectedContact?.name || 'عميل تجريبي'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <div className="text-[11px] text-emerald-100 leading-tight">متصل الآن</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/90">
          <Video className="w-4 h-4 cursor-pointer hover:text-white" />
          <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* WhatsApp Chat Canvas - Authentic WhatsApp Wallpaper & Light Theme */}
      <div 
        className="flex-1 p-3 overflow-y-auto bg-[#efeae2] flex flex-col justify-end"
        style={{
          backgroundImage: `radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Date Stamp */}
        <div className="text-center my-2">
          <span className="text-[10px] bg-white/90 text-slate-600 px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200/60 font-medium">
            اليوم
          </span>
        </div>

        {/* Message Bubble Container - Authentic WhatsApp Outgoing Light Green */}
        <div className="self-end max-w-[90%] bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-xs p-2.5 shadow-xs border border-[#c4eec0] text-right">
          
          {/* Media Attachments Rendering */}
          {payload.mediaType === 'image' && (
            <div className="mb-2 rounded-xl overflow-hidden bg-slate-100 border border-emerald-700/20 relative shadow-xs">
              <img
                src={payload.mediaUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'}
                alt="معاينة الصورة"
                className="w-full h-36 object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-[11px] text-slate-800 p-1.5 bg-white/90 truncate font-medium">
                📷 {payload.mediaCaption || 'صورة تسويقية مرفقة'}
              </div>
            </div>
          )}

          {payload.mediaType === 'video' && (
            <div className="mb-2 rounded-xl overflow-hidden bg-slate-900 relative border border-emerald-700/20 group shadow-xs">
              <div className="w-full h-36 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {payload.mediaUrl ? (
                  <video 
                    src={payload.mediaUrl} 
                    className="w-full h-full object-cover" 
                    controls={false}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
                  01:24
                </div>
              </div>
              <div className="text-[11px] text-slate-800 p-1.5 bg-white/95 truncate font-medium">
                🎥 {payload.mediaCaption || 'فيديو العرض الترويجي'}
              </div>
            </div>
          )}

          {payload.mediaType === 'document' && (
            <div className="mb-2 p-2.5 rounded-xl bg-white/90 border border-emerald-700/20 flex items-center gap-2.5 text-right shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#008069]/15 text-[#008069] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {payload.mediaName || 'كتالوج_المنتجات_والأسعار.pdf'}
                </div>
                <div className="text-[10px] text-slate-500">
                  PDF · 2.4 ميجابايت
                </div>
              </div>
            </div>
          )}

          {payload.mediaType === 'link' && payload.ctaUrl && (
            <div className="mb-2 rounded-xl overflow-hidden bg-white/90 border border-emerald-700/20 p-2 shadow-xs">
              <div className="text-[11px] font-semibold text-[#008069] truncate">
                {payload.ctaText || 'رابط العرض الحصري'}
              </div>
              <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5 dir-ltr text-left">
                {payload.ctaUrl}
              </div>
            </div>
          )}

          {/* Message Text */}
          <div className="text-xs leading-relaxed whitespace-pre-wrap break-words text-[#111b21] font-sans">
            {renderMessageText()}
          </div>

          {/* Interactive CTA Button */}
          {payload.ctaText && (
            <div className="mt-2.5 pt-2 border-t border-[#bce8b7]">
              <a
                href={payload.ctaUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 px-2 bg-white hover:bg-slate-50 border border-emerald-600/20 rounded-lg text-[#008069] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{payload.ctaText}</span>
              </a>
            </div>
          )}

          {/* Timestamp and Double Blue Checkmarks */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781] font-mono">
            <span>{formattedTime}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
          </div>

        </div>

      </div>

      {/* WhatsApp Input Simulation Bar */}
      <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
        <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-slate-400 border border-slate-200/80">
          اكتب رسالة للرد...
        </div>
        <div className="w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-xs">
          <Phone className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
};
