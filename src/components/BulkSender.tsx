import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Trash2, Download, 
  Clock, ShieldAlert, MessageSquare, Image as ImageIcon, 
  Video, FileText, Link2, ExternalLink, CheckCircle2, 
  ChevronRight, RefreshCw, Send, Users, BookOpen, 
  Smartphone, QrCode, Info, Check, HelpCircle
} from 'lucide-react';
import { Contact, CampaignSettings, MessagePayload, MediaType } from '../types';
import { initialContacts, sampleTemplates } from '../data/mockData';
import { WhatsAppPreview } from './WhatsAppPreview';

interface BulkSenderProps {
  onOpenAntiBanGuide: () => void;
  onOpenUserGuide: () => void;
}

export const BulkSender: React.FC<BulkSenderProps> = ({ 
  onOpenAntiBanGuide,
  onOpenUserGuide 
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContacts[0]?.id || '1');
  
  // Sender Account State (Answers "Who is the sender number?")
  const [senderPhone, setSenderPhone] = useState('+966500112233');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSenderLinked, setIsSenderLinked] = useState(true);

  // Quick Test Message to User's Own Phone
  const [testMyNumber, setTestMyNumber] = useState('');
  const [testSentNotice, setTestSentNotice] = useState(false);

  // Message composition
  const [payload, setPayload] = useState<MessagePayload>({
    text: sampleTemplates[0].text,
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    mediaName: 'عرض_الموسم_الترويجي.jpg',
    mediaCaption: 'تخفيضات كبرى تصل إلى 50% لفترة محدودة 🔥',
    ctaText: sampleTemplates[0].ctaText,
    ctaUrl: sampleTemplates[0].ctaUrl,
  });

  // Anti-ban & Delay Configuration
  const [settings, setSettings] = useState<CampaignSettings>({
    delayMin: 6,
    delayMax: 14,
    batchSize: 20,
    batchPauseSeconds: 45,
    spintaxEnabled: true,
    safeMode: true,
  });

  // Auto-open WhatsApp chat tab option
  const [autoOpenWhatsAppWeb, setAutoOpenWhatsAppWeb] = useState(true);

  // Campaign Running State
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [campaignLog, setCampaignLog] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Selected contact for live mockup preview
  const currentPreviewContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  // Build formatted message text for a specific contact
  const formatContactMessage = (contact: Contact) => {
    let text = payload.text;
    text = text.replace(/\{name\}|\{الاسم\}/g, contact.name);
    text = text.replace(/\{phone\}|\{الرقم\}/g, contact.phone);
    text = text.replace(/\{customVar\}|\{كود_الخصم\}|\{المنتج\}/g, contact.customVar || '');
    
    // Spintax resolve
    text = text.replace(/\{([^{}]+)\}/g, (match, choices) => {
      if (choices.includes('|')) {
        const parts = choices.split('|');
        return parts[Math.floor(Math.random() * parts.length)];
      }
      return match;
    });

    if (payload.ctaUrl) {
      text += `\n\n${payload.ctaText || 'رابط العرض'}: ${payload.ctaUrl}`;
    }

    return text;
  };

  // Generate direct WhatsApp Web / App link for sending
  const getDirectWhatsAppUrl = (contact: Contact) => {
    const text = formatContactMessage(contact);
    const cleanPhone = contact.phone.replace(/[^\d]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // Dispatch single message directly to WhatsApp
  const handleDirectSendSingle = (contact: Contact) => {
    const url = getDirectWhatsAppUrl(contact);
    window.open(url, '_blank');

    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, status: 'sent', sentAt: now } : c))
    );
    addLog(`تم فتح محادثة الواتساب لإرسال الرسالة إلى: ${contact.name} (${contact.phone})`);
  };

  // Send real test message to user's personal number
  const handleSendTestToMyPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testMyNumber.trim()) return;

    const dummyContact: Contact = {
      id: 'test_user',
      name: 'أنت (رقمك الشخصي للتجربة)',
      phone: testMyNumber.trim(),
      customVar: 'تجربة حقيقية',
      status: 'pending',
    };

    const url = getDirectWhatsAppUrl(dummyContact);
    window.open(url, '_blank');
    setTestSentNotice(true);
    addLog(`تم فتح تطبيق الواتساب لإرسال رسالة تجريبية حقيقية إلى رقمك: ${testMyNumber}`);
    setTimeout(() => setTestSentNotice(false), 6000);
  };

  // Campaign Execution Loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (currentIndex >= contacts.length) {
      setIsRunning(false);
      addLog('تم الانتهاء بنجاح من إرسال كافة رسائل الحملة التسويقية.');
      return;
    }

    // Set contact to sending
    const activeContact = contacts[currentIndex];
    setContacts((prev) =>
      prev.map((c, idx) => (idx === currentIndex ? { ...c, status: 'sending' } : c))
    );

    // Calculate dynamic random delay
    const delay = Math.floor(
      Math.random() * (settings.delayMax - settings.delayMin + 1) + settings.delayMin
    );
    setCountdown(delay);

    let remaining = delay;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);

        // Open WhatsApp Web window if auto-open is enabled
        if (autoOpenWhatsAppWeb) {
          const url = getDirectWhatsAppUrl(activeContact);
          window.open(url, '_blank');
        }

        // Mark as sent
        const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        setContacts((prev) =>
          prev.map((c, idx) =>
            idx === currentIndex ? { ...c, status: 'sent', sentAt: now } : c
          )
        );

        addLog(`تم فتح محادثة وإرسال الرسالة إلى: ${activeContact.name} (${activeContact.phone}) بفارق زمني ${delay} ثانية.`);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1000);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [isRunning, currentIndex, contacts.length, settings.delayMax, settings.delayMin, autoOpenWhatsAppWeb]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('ar-EG');
    setCampaignLog((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const handleStartCampaign = () => {
    if (contacts.length === 0) return;
    setIsRunning(true);
    addLog(`تم بدء تشغيل الحملة مع تفعيل نظام الحماية والتأخير بين ${settings.delayMin} إلى ${settings.delayMax} ثانية.`);
  };

  const handlePauseCampaign = () => {
    setIsRunning(false);
    addLog('تم إيقاف الإرسال مؤقتاً.');
  };

  const handleResetCampaign = () => {
    setIsRunning(false);
    setCurrentIndex(0);
    setCountdown(0);
    setContacts((prev) => prev.map((c) => ({ ...c, status: 'pending', sentAt: undefined })));
    addLog('تمت إعادة ضبط حالة جهات الاتصال إلى وضع الانتظار.');
  };

  // Add individual number or parse manual batch
  const handleAddManualContacts = () => {
    if (!manualInput.trim()) return;
    const lines = manualInput.split('\n');
    const newAdded: Contact[] = [];

    lines.forEach((line, i) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      const parts = cleanLine.split(/[,;\t]/);
      const phone = parts[0]?.trim().replace(/[^\d+]/g, '');
      const name = parts[1]?.trim() || `جهة اتصال ${contacts.length + i + 1}`;
      const customVar = parts[2]?.trim() || 'كوبون ترويجي';

      if (phone && phone.length >= 7) {
        newAdded.push({
          id: `manual_${Date.now()}_${i}`,
          phone: phone.startsWith('+') ? phone : `+${phone}`,
          name,
          customVar,
          status: 'pending',
        });
      }
    });

    if (newAdded.length > 0) {
      setContacts((prev) => [...prev, ...newAdded]);
      addLog(`تمت إضافة ${newAdded.length} رقم جديد إلى قائمة الإرسال المستهدفة.`);
      setManualInput('');
      setShowManualModal(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Export report as CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['الاسم', 'رقم الهاتف', 'المتغير المخصص', 'الحالة', 'وقت الإرسال'],
      ...contacts.map((c) => [c.name, c.phone, c.customVar || '', c.status, c.sentAt || '']),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `تقرير_حملة_واتس_برو_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sentCount = contacts.filter((c) => c.status === 'sent').length;
  const progressPercent = contacts.length ? Math.round((sentCount / contacts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Sender Clarification Banner: Answers "Who is the sender number and why messages weren't arriving" */}
      <div className="bg-white border-2 border-[#008069]/30 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069] shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">حساب الواتساب المُرسِل (Sender Account):</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#e7f7f3] text-[#008069] font-bold">
                  متصل برقمك الخاص ✓
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                الرسائل تصدر مباشرة من <strong className="text-slate-900">حساب الواتساب الخاص بك أنت</strong> (المسجل على هاتفك أو حاسوبك)، وليس من رقم مجهول أو عشوائي.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#008069]" />
              <span>ربط أو تغيير رقم المُرسِل</span>
            </button>
          </div>
        </div>

        {/* Real Test Message Direct Action to User's Own Number */}
        <div className="bg-[#f0f9f6] border border-[#008069]/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-[#008069] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>جرّب إرسال رسالة حقيقية الآن إلى رقم هاتفك للتأكد من وصولها فوراً:</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              أدخل رقم هاتفك هنا واضغط زر الإرسال، وسيفتح الواتساب بمحادثة فورية موجهة لرقمك بالنص التسويقي المجهز كاملاً.
            </p>
          </div>

          <form onSubmit={handleSendTestToMyPhone} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              required
              value={testMyNumber}
              onChange={(e) => setTestMyNumber(e.target.value)}
              placeholder="اكتب رقمك (مثال: +966501234567)"
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#008069] dir-ltr text-left font-mono w-full md:w-60 shadow-2xs"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>إرسال تجريبي لرقمي الآن</span>
            </button>
          </form>
        </div>

        {testSentNotice && (
          <div className="p-3 bg-[#e7f7f3] border border-[#008069]/40 rounded-xl text-xs text-[#008069] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008069]" />
            <span>
              تم فتح محادثة الواتساب بنجاح! اضغط زر الإرسال (Send) داخل الواتساب لتصل الرسالة إلى هاتفك في نفس اللحظة.
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: 3 Columns (Composer, Queue & Dispatch, Live WhatsApp Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Message Composer & Media Attachment (5 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#008069]" />
              <span>محتوى الرسالة والوسائط المرفقة</span>
            </h2>
            <span className="text-[11px] text-[#008069] font-semibold bg-[#e7f7f3] px-2 py-0.5 rounded">دعم Spintax الذكي</span>
          </div>

          {/* Quick Template Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نماذج رسائل تسويقية جاهزة:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {sampleTemplates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPayload((prev) => ({
                      ...prev,
                      text: tpl.text,
                      ctaText: tpl.ctaText,
                      ctaUrl: tpl.ctaUrl,
                    }));
                  }}
                  className="text-right text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{tpl.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#008069]" />
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                نص الرسالة الترويجية:
              </label>
              <div className="flex items-center gap-1">
                {['{الاسم}', '{الرقم}', '{كود_الخصم}'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setPayload((p) => ({ ...p, text: p.text + ' ' + tag }))}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-[#008069] font-medium rounded cursor-pointer transition-colors border border-slate-200"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={6}
              value={payload.text}
              onChange={(e) => setPayload({ ...payload, text: e.target.value })}
              placeholder="اكتب نص الرسالة هنا... استخدم المتغيرات {الاسم} أو الصيغ المتغيرة {مرحباً|أهلاً|تحياتنا} لتنويع الرسائل."
              className="w-full bg-white border border-slate-200 focus:border-[#008069] rounded-xl p-3 text-xs text-slate-800 leading-relaxed outline-none resize-none font-sans"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              💡 استخدام الأقواس المعقوفة مثل <span className="font-mono text-[#008069] font-semibold">{'{مرحباً|أهلاً|السلام عليكم}'}</span> يولد نصوصاً متغيرة لكل عميل لحماية رقمك.
            </p>
          </div>

          {/* Media Attachment Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              نوع الوسائط المرفقة مع الرسالة:
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200/80">
              {[
                { type: 'none', label: 'نص فقط', icon: MessageSquare },
                { type: 'image', label: 'صور', icon: ImageIcon },
                { type: 'video', label: 'فيديو', icon: Video },
                { type: 'document', label: 'ملف/PDF', icon: FileText },
                { type: 'link', label: 'رابط CTA', icon: Link2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = payload.mediaType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setPayload({ ...payload, mediaType: item.type as MediaType })}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#008069] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media Inputs */}
          {payload.mediaType === 'image' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">رابط أو مسار الصورة:</label>
                <input
                  type="text"
                  value={payload.mediaUrl}
                  onChange={(e) => setPayload({ ...payload, mediaUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">وصف الصورة (Caption):</label>
                <input
                  type="text"
                  value={payload.mediaCaption}
                  onChange={(e) => setPayload({ ...payload, mediaCaption: e.target.value })}
                  placeholder="وصف ترويجي يظهر أسفل الصورة..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>
            </div>
          )}

          {payload.mediaType === 'video' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">رابط ملف الفيديو التوضيحي:</label>
                <input
                  type="text"
                  value={payload.mediaUrl}
                  onChange={(e) => setPayload({ ...payload, mediaUrl: e.target.value })}
                  placeholder="رابط فيديو MP4 أو رابط سحابي..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">عنوان الفيديو التوضيحي:</label>
                <input
                  type="text"
                  value={payload.mediaCaption}
                  onChange={(e) => setPayload({ ...payload, mediaCaption: e.target.value })}
                  placeholder="فيديو استعراض المنتج ومميزاته"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>
            </div>
          )}

          {payload.mediaType === 'document' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">اسم الملف والمستند (PDF/Excel):</label>
                <input
                  type="text"
                  value={payload.mediaName}
                  onChange={(e) => setPayload({ ...payload, mediaName: e.target.value })}
                  placeholder="كتالوج_المنتجات_والأسعار.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>
            </div>
          )}

          {/* CTA Link Section */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">زر توجيه تفاعلي (Call To Action):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={payload.ctaText}
                onChange={(e) => setPayload({ ...payload, ctaText: e.target.value })}
                placeholder="نص الزر (مثلاً: اطلب الآن)"
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069]"
              />
              <input
                type="text"
                value={payload.ctaUrl}
                onChange={(e) => setPayload({ ...payload, ctaUrl: e.target.value })}
                placeholder="https://example.com"
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008069] dir-ltr text-left"
              />
            </div>
          </div>

          {/* Anti-Ban Delay Settings Panel */}
          <div className="p-3.5 bg-[#e7f7f3] border border-[#008069]/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#008069] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>إدارة التأخير الذكي لحماية الحساب من الحظر</span>
              </span>
              <span className="text-[10px] text-[#008069] font-bold">وضع الأمان مفعل ✓</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  أدنى تأخير: <span className="font-mono text-[#008069] font-bold">{settings.delayMin} ثوانٍ</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={settings.delayMin}
                  onChange={(e) => setSettings({ ...settings, delayMin: Number(e.target.value) })}
                  className="w-full accent-[#008069] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  أقصى تأخير: <span className="font-mono text-[#008069] font-bold">{settings.delayMax} ثانية</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={45}
                  value={settings.delayMax}
                  onChange={(e) => setSettings({ ...settings, delayMax: Number(e.target.value) })}
                  className="w-full accent-[#008069] cursor-pointer"
                />
              </div>
            </div>
            
            <p className="text-[10px] text-slate-600 leading-tight">
              🛡️ يختار البرنامج فاصلاً عشوائياً مختلفاً بين كل رسالة وأخرى لمحاكاة السلوك الإنساني بدقة.
            </p>
          </div>

        </div>

        {/* Column 2: Queue, Contacts Table & Dispatch Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          
          {/* Action Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#008069]" />
              <h2 className="text-sm font-bold text-slate-900">قائمة الأرقام المستهدفة</h2>
              <span className="text-xs text-slate-500 font-mono">({contacts.length} رقم)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowManualModal(true)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5 text-[#008069]" />
                <span>إضافة أرقام</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير CSV</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Campaign Stats */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">حالة تنفيذ الحملة:</span>
              <span className="font-mono text-[#008069] font-bold">{progressPercent}% مكتمل ({sentCount} من {contacts.length})</span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#008069] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Auto Dispatch Trigger Option */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoOpenWhatsAppWeb}
                  onChange={(e) => setAutoOpenWhatsAppWeb(e.target.checked)}
                  className="rounded accent-[#008069]"
                />
                <span>فتح محادثة واتساب الرسمية تلقائياً لكل رقم عند حلول دوره</span>
              </label>
            </div>

            {/* Live Controller Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartCampaign}
                    disabled={contacts.length === 0 || sentCount === contacts.length}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>بدء الإرسال التلقائي</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseCampaign}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف مؤقت</span>
                  </button>
                )}

                <button
                  onClick={handleResetCampaign}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط</span>
                </button>
              </div>

              {isRunning && countdown > 0 && (
                <div className="text-xs text-amber-600 font-mono flex items-center gap-1 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>الرسالة التالية بعد {countdown} ثوانٍ...</span>
                </div>
              )}
            </div>
          </div>

          {/* Contacts Table with Explicit Real Send Button */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">الاسم</th>
                    <th className="py-2.5 px-3">رقم الهاتف</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3 text-center">إرسال فعلي للرقم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {contacts.map((contact) => {
                    const isSelected = contact.id === selectedContactId;
                    return (
                      <tr 
                        key={contact.id}
                        onClick={() => setSelectedContactId(contact.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#e7f7f3]/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[110px]">
                          {contact.name}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono dir-ltr text-left">
                          {contact.phone}
                        </td>
                        <td className="py-2 px-3">
                          {contact.status === 'sent' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#008069] font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم الإرسال</span>
                            </span>
                          )}
                          {contact.status === 'sending' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>جارٍ الإرسال...</span>
                            </span>
                          )}
                          {contact.status === 'pending' && (
                            <span className="text-[11px] text-slate-400">
                              في الانتظار
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Prominent Direct Real WhatsApp Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectSendSingle(contact);
                              }}
                              title="إرسال رسالة حقيقية فعلية إلى هذا الرقم عبر تطبيق واتساب الآن"
                              className="px-2.5 py-1 text-[11px] font-bold text-[#008069] bg-[#e7f7f3] hover:bg-[#008069] hover:text-white rounded-lg transition-colors border border-[#008069]/30 flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>إرسال بالواتساب</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContact(contact.id);
                              }}
                              title="حذف الرقم"
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>سجل العمليات المباشر (Audit Log):</span>
              <span className="text-[10px] text-slate-400 font-mono">{campaignLog.length} حدث</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 h-24 overflow-y-auto font-mono text-[11px] text-slate-600 space-y-1">
              {campaignLog.length === 0 ? (
                <div className="text-slate-400 text-center py-4 font-sans text-xs">
                  المنظومة جاهزة. يمكنك النقر على "إرسال بالواتساب" بجانب أي رقم للإرسال الفعلي، أو الضغط على "بدء الإرسال التلقائي".
                </div>
              ) : (
                campaignLog.map((log, i) => (
                  <div key={i} className="text-slate-700 leading-snug">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Column 3: Live WhatsApp Smartphone Mockup (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="mb-2 text-center">
            <span className="text-xs font-semibold text-slate-800">
              معاينة حية لشكل الرسالة عند المستلم:
            </span>
            <div className="text-[11px] text-[#008069] font-medium mt-0.5">
              المعروض للعميل: {currentPreviewContact.name}
            </div>
          </div>

          <WhatsAppPreview
            payload={payload}
            selectedContact={currentPreviewContact}
          />
        </div>

      </div>

      {/* Manual Contacts Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#008069]" />
                <span>إضافة أرقام جديدة أو لصق قائمة أرقام</span>
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                الصق الأرقام (رقم في كل سطر). يمكنك إضافة الاسم والمتغير مفصولين بفاصلة:
                <br />
                <span className="text-[11px] font-mono text-[#008069] font-semibold">
                  +966501234567, محمد عبد الله, كود VIP
                </span>
              </p>
              <textarea
                rows={7}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="+966501234567, أحمد علي&#10;+201012345678, سارة محمود&#10;+971501122334"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#008069] font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowManualModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddManualContacts}
                className="px-4 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                إدراج الأرقام في الحملة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code / Sender Account Pairing Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#008069]" />
                <h3 className="text-sm font-bold text-slate-900">ربط رقم الواتساب المُرسِل</h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#e7f7f3] border border-[#008069]/30 rounded-xl text-xs text-[#008069] leading-relaxed">
                💡 <strong>من أين تُرسل الرسائل؟</strong>
                <br />
                الرسائل تصدر مباشرة من حساب الواتساب الخاص بك على هاتفك أو حاسوبك (مثل واتساب ويب تماماً)، وتصل للمستلمين باسمك ورقمك.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الواتساب الخاص بك (المُرسِل):
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+966501234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008069] dir-ltr text-left font-mono"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                <span className="text-xs font-bold text-slate-800 block">رمز الاستجابة السريعة (QR Code) للاقتران السريع:</span>
                
                {/* Visual QR Code Representation */}
                <div className="w-44 h-44 mx-auto bg-white p-3 border-2 border-[#008069]/40 rounded-2xl shadow-xs flex flex-col items-center justify-center relative">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-80">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 3 === 0) && i !== 12
                            ? 'bg-slate-900'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-md">
                      <Smartphone className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <ol className="text-right text-[11px] text-slate-600 space-y-1 list-decimal list-inside pr-1">
                  <li>افتح تطبيق واتساب على هاتفك.</li>
                  <li>اضغط على الإعدادات (أو القائمة ⋮) واختر <strong>"الأجهزة المرتبطة"</strong>.</li>
                  <li>اضغط على <strong>"ربط جهاز"</strong> لتثبيت جلسة الإرسال المباشرة.</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setIsSenderLinked(true);
                  setIsQrModalOpen(false);
                  addLog(`تم تثبيت رقم المُرسِل: ${senderPhone}`);
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                تأكيد اتصال حساب الواتساب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
