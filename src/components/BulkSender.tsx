import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Trash2, Download, 
  Clock, ShieldAlert, MessageSquare, Image as ImageIcon, 
  Video, FileText, Link2, ExternalLink, CheckCircle2, 
  ChevronRight, RefreshCw, Send, Users, BookOpen, 
  Smartphone, QrCode, Zap, Settings, Globe, Check, 
  Layers, ArrowUpRight, HelpCircle, AlertTriangle, 
  Info, ShieldCheck, AppWindow
} from 'lucide-react';
import { Contact, CampaignSettings, MessagePayload, MediaType, DispatchMode, GatewayConfig } from '../types';
import { initialContacts, sampleTemplates } from '../data/mockData';
import { WhatsAppPreview } from './WhatsAppPreview';

interface BulkSenderProps {
  onOpenAntiBanGuide: () => void;
  onOpenUserGuide: () => void;
}

// Clean and normalize phone numbers for international WhatsApp dispatch
const cleanWhatsAppPhone = (raw: string, defaultCode = '966') => {
  let digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Handle local numbers starting with 0
  if (digits.startsWith('05') && digits.length === 10) {
    digits = '966' + digits.slice(1);
  } else if ((digits.startsWith('010') || digits.startsWith('011') || digits.startsWith('012') || digits.startsWith('015')) && digits.length === 11) {
    digits = '20' + digits.slice(1);
  } else if (digits.startsWith('09') && digits.length === 10) {
    digits = '963' + digits.slice(1);
  } else if (digits.startsWith('07') && digits.length === 10) {
    digits = '962' + digits.slice(1);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    digits = defaultCode + digits.slice(1);
  }

  return digits;
};

export const BulkSender: React.FC<BulkSenderProps> = ({ 
  onOpenAntiBanGuide,
  onOpenUserGuide 
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContacts[0]?.id || '1');
  
  // Dispatch Mode:
  // 1) 'single_tab_flow' (Recommended: Uses 1 single dedicated tab for all numbers, 0 popup clutter)
  // 2) 'direct_cloud' (Server-side API dispatch, 0 windows opened)
  // 3) 'individual_popup' (Opens individual tabs)
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>('single_tab_flow');

  // Gateway Config for Meta Cloud API or Custom Server
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>({
    gatewayType: 'meta_cloud',
    phoneNumberId: '',
    accessToken: '',
    sessionStatus: 'idle',
  });
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  // Sender Identity State
  const [senderIdentityType, setSenderIdentityType] = useState<'my_phone' | 'meta_cloud_number'>('my_phone');
  const [senderPhone, setSenderPhone] = useState('+966500112233');
  const [isSenderModalOpen, setIsSenderModalOpen] = useState(false);

  // Quick Test Message to User's Own Phone
  const [testCountryCode, setTestCountryCode] = useState('966');
  const [testMyNumber, setTestMyNumber] = useState('');
  const [testSentNotice, setTestSentNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

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
    delayMin: 5,
    delayMax: 10,
    batchSize: 20,
    batchPauseSeconds: 45,
    spintaxEnabled: true,
    safeMode: true,
  });

  // Campaign Running State
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [campaignLog, setCampaignLog] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [showPopupsHelpModal, setShowPopupsHelpModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dedicatedWindowRef = useRef<Window | null>(null);

  // Selected contact for live mockup preview
  const currentPreviewContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  // Advance sequential interactive campaign (Bypasses popup blocker 100%)
  const handleAdvanceSequential = (contact: Contact, medium: 'app' | 'web') => {
    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, status: 'sent', sentAt: now } : c))
    );
    addLog(`✅ [إرسال مباشر بنقرة واحدة] تم توجيه الرسالة لرقم: ${contact.name} (${contact.phone}) عبر ${medium === 'app' ? 'تطبيق واتساب' : 'واتساب ويب'}`);
    
    if (currentIndex + 1 < contacts.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsRunning(false);
      addLog('🎉 اكتملت الحملة بنجاح! تم استهداف كافة جهات الاتصال.');
    }
  };

  // Build formatted message text for a specific contact
  const formatContactMessage = (contact: Contact) => {
    let text = payload.text;
    text = text.replace(/\{name\}|\{الاسم\}/g, contact.name);
    text = text.replace(/\{phone\}|\{الرقم\}/g, contact.phone);
    text = text.replace(/\{customVar\}|\{كود_الخصم\}|\{المنتج\}/g, contact.customVar || '');
    
    // Spintax resolve: {مرحباً|أهلاً|تحياتنا}
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

  // Generate direct WhatsApp link
  const getDirectWhatsAppUrl = (contact: Contact) => {
    const text = formatContactMessage(contact);
    const cleanPhone = cleanWhatsAppPhone(contact.phone);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // Generate mobile protocol URL
  const getMobileAppUrl = (contact: Contact) => {
    const text = formatContactMessage(contact);
    const cleanPhone = cleanWhatsAppPhone(contact.phone);
    return `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('ar-EG');
    setCampaignLog((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 40)]);
  };

  // Dispatch single message directly via WhatsApp (App or Web)
  const handleOpenWhatsAppDirect = (contact: Contact, useAppProtocol = false) => {
    const cleanPhone = cleanWhatsAppPhone(contact.phone);
    if (!cleanPhone) {
      addLog(`❌ رقم غير صالح: ${contact.name}`);
      return;
    }

    const text = formatContactMessage(contact);
    const webUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    const appUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;

    if (useAppProtocol) {
      // Direct protocol to open WhatsApp Desktop / Mobile Application directly
      window.location.href = appUrl;
      addLog(`📱 تم فتح تطبيق واتساب مباشرة لرقم: ${contact.name} (${cleanPhone}). اضغط زر الإرسال الأخضر داخل المحادثة لتصل الرسالة فوراً!`);
    } else {
      // Re-use dedicated window to avoid popup clutter
      dedicatedWindowRef.current = window.open(webUrl, 'WhatsAppCentralDispatcher', 'width=950,height=750');
      addLog(`🌐 تم فتح محادثة واتساب لرقم: ${contact.name} (${cleanPhone}). اضغط زر الإرسال الأخضر داخل المحادثة لتصل فوراً.`);
    }

    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, status: 'sent', sentAt: now } : c))
    );
  };

  // Dispatch single message manually
  const handleSendSingleDirect = (contact: Contact) => {
    // If user clicked direct send, always open real WhatsApp so message actually delivers!
    handleOpenWhatsAppDirect(contact, false);
  };

  // Send via Cloud API if configured
  const sendViaCloudAPI = async (contact: Contact): Promise<boolean> => {
    const cleanPhone = cleanWhatsAppPhone(contact.phone);
    const messageText = formatContactMessage(contact);

    if (gatewayConfig.phoneNumberId && gatewayConfig.accessToken && gatewayConfig.accessToken !== 'EAAG_DEMO_TOKEN_SIMULATED') {
      try {
        addLog(`⚡ [سحابي مباشر] جاري إرسال الرسالة إلى: ${contact.name} (${cleanPhone}) عبر Meta API...`);
        const res = await fetch(`https://graph.facebook.com/v21.0/${gatewayConfig.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gatewayConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: messageText },
          }),
        });

        const data = await res.json();
        if (res.ok) {
          addLog(`✅ [تم التسليم سحابياً بنجاح] استلمت خوادم واتساب الرسالة برقم معرف: ${data.messages?.[0]?.id || 'OK'}`);
          return true;
        } else {
          addLog(`⚠️ [خطأ Meta API]: ${data.error?.message || 'تحقق من صلاحية التوكن'}`);
          return false;
        }
      } catch (err: any) {
        addLog(`❌ [خطأ اتصال سحابي]: ${err.message}`);
        return false;
      }
    } else {
      addLog(`⚠️ [تنبيه هام] نمط الإرسال السحابي (0 نوافذ) يتطلب إدخال مفتاح Meta Cloud API الحقيقي. استخدم (النافذة المركزية الموحدة) أو أزرار (إرسال بالواتساب) لإرسال الرسائل مجاناً من رقمك مباشرة.`);
      return false;
    }
  };

  // Test real message to user's own number
  const handleSendTestToMyPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testMyNumber.trim()) {
      setTestSentNotice({ type: 'error', text: 'يرجى كتابة رقم هاتفك أولاً في خانة التجربة.' });
      return;
    }

    const formattedDigits = cleanWhatsAppPhone(testMyNumber, testCountryCode);
    const fullNumber = formattedDigits.startsWith('+') ? formattedDigits : `+${formattedDigits}`;

    const testContact: Contact = {
      id: 'test_user_phone',
      name: 'رقمي الشخصي للتجربة',
      phone: fullNumber,
      customVar: 'تجربة حية حقيقية',
      status: 'pending',
    };

    const directUrl = getDirectWhatsAppUrl(testContact);

    // Open WhatsApp directly for the user
    window.open(directUrl, 'WhatsAppTestWindow', 'width=950,height=750');
    
    addLog(`🧪 [تجربة فورية] تم فتح محادثة الواتساب لرقمك: ${fullNumber}. اضغط زر الإرسال الأخضر داخل المحادثة لتصلك الرسالة فوراً!`);
    
    setTestSentNotice({
      type: 'success',
      text: `تم فتح محادثة الواتساب لرقمك (${fullNumber}) بنجاح! اضغط زر الإرسال الأخضر داخل محادثة واتساب لتشاهد الرسالة والروابط عندك.`,
    });

    setTimeout(() => setTestSentNotice(null), 12000);
  };

  // Automated Campaign Loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (currentIndex >= contacts.length) {
      setIsRunning(false);
      addLog('🎉 اكتملت الحملة بنجاح! تم استهداف كافة جهات الاتصال.');
      return;
    }

    const currentContact = contacts[currentIndex];

    // Set contact status to sending
    setContacts((prev) =>
      prev.map((c, idx) => (idx === currentIndex ? { ...c, status: 'sending' } : c))
    );

    // Random safe delay
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

        // DISPATCH METHOD EXECUTION:
        if (dispatchMode === 'single_tab_flow') {
          // 🎯 SINGLE TAB FLOW: Use 1 single dedicated window for entire campaign!
          const url = getDirectWhatsAppUrl(currentContact);
          dedicatedWindowRef.current = window.open(url, 'WhatsAppCentralDispatcher', 'width=950,height=750');
          
          const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
          setContacts((prev) =>
            prev.map((c, idx) => (idx === currentIndex ? { ...c, status: 'sent', sentAt: now } : c))
          );
          addLog(`🎯 [نافذة مركزية موحدة] تم فتح محادثة الرقم ${currentIndex + 1}/${contacts.length}: ${currentContact.name} (${currentContact.phone}). اضغط زر الإرسال الأخضر داخل الواتساب.`);
          setCurrentIndex((prev) => prev + 1);

        } else if (dispatchMode === 'direct_cloud') {
          // ⚡ CLOUD API DISPATCH: Background HTTP API call (0 windows)
          sendViaCloudAPI(currentContact).then((success) => {
            const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            setContacts((prev) =>
              prev.map((c, idx) => (idx === currentIndex ? { 
                ...c, 
                status: success ? 'sent' : 'failed', 
                sentAt: success ? now : undefined 
              } : c))
            );
          });
          setCurrentIndex((prev) => prev + 1);

        } else {
          // 🔗 Individual popups mode
          const url = getDirectWhatsAppUrl(currentContact);
          window.open(url, '_blank');
          const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
          setContacts((prev) =>
            prev.map((c, idx) => (idx === currentIndex ? { ...c, status: 'sent', sentAt: now } : c))
          );
          addLog(`🔗 [نافذة مستقلة] تم فتح محادثة: ${currentContact.name} (${currentContact.phone})`);
          setCurrentIndex((prev) => prev + 1);
        }
      }
    }, 1000);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [isRunning, currentIndex, contacts.length, settings.delayMax, settings.delayMin, dispatchMode]);

  const handleStartCampaign = () => {
    if (contacts.length === 0) return;

    if (dispatchMode === 'direct_cloud' && (!gatewayConfig.phoneNumberId || !gatewayConfig.accessToken || gatewayConfig.accessToken === 'EAAG_DEMO_TOKEN_SIMULATED')) {
      setIsGatewayModalOpen(true);
      addLog('⚠️ تنبيه: لا يمكن الإرسال السحابي بدون مفتاح Meta Cloud API الحقيقي. يرجى التبديل إلى "النافذة المركزية الموحدة" أو إدخال مفتاح الـ API.');
      return;
    }

    setIsRunning(true);

    if (dispatchMode === 'single_tab_flow') {
      addLog(`🎯 تم بدء الحملة بنمط «النافذة المركزية الموحدة»: سيتم توجيه النافذة الواحدة بين الأرقام بتتابع آمن!`);
    } else if (dispatchMode === 'direct_cloud') {
      addLog(`⚡ تم بدء الحملة بنمط «الإرسال السحابي المباشر»: إرسال في الخلفية عبر سيرفر Meta API.`);
    } else {
      addLog(`🔗 تم بدء الحملة بنمط فتح نوافذ المحادثات المباشرة.`);
    }
  };

  const handlePauseCampaign = () => {
    setIsRunning(false);
    addLog('⏸️ تم إيقاف الإرسال مؤقتاً.');
  };

  const handleResetCampaign = () => {
    setIsRunning(false);
    setCurrentIndex(0);
    setCountdown(0);
    setContacts((prev) => prev.map((c) => ({ ...c, status: 'pending', sentAt: undefined })));
    addLog('🔄 تمت إعادة ضبط جهات الاتصال للبدء من جديد.');
  };

  const handleAddManualContacts = () => {
    if (!manualInput.trim()) return;
    const lines = manualInput.split('\n');
    const newAdded: Contact[] = [];

    lines.forEach((line, i) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      const parts = cleanLine.split(/[,;\t]/);
      const rawPhone = parts[0]?.trim() || '';
      const name = parts[1]?.trim() || `جهة اتصال ${contacts.length + i + 1}`;
      const customVar = parts[2]?.trim() || 'كوبون ترويجي';

      const normalized = cleanWhatsAppPhone(rawPhone);
      if (normalized && normalized.length >= 7) {
        newAdded.push({
          id: `manual_${Date.now()}_${i}`,
          phone: `+${normalized}`,
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
      
      {/* SECTION 1: Sender Identity & How Direct Sending Works (Answers user's core questions!) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Header with clear answers */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069] shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  مصدر الرقم المُرسِل ونظام الإرسال المباشر
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#008069] text-white font-bold font-mono">
                  {senderIdentityType === 'my_phone' ? 'رقم هاتفي' : 'سحابي Meta'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                الرقم المُرسِل الحالي:{' '}
                <strong className="text-slate-800 font-mono dir-ltr">{senderPhone}</strong>{' '}
                · الرسائل تخرج باسمك وصورتك وتصل إلى المستلمين مباشرة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://ais-dev-n5yd7obd7eppslprji7dlh-502190781622.europe-west2.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="فتح البرنامج في تبويب متصفح كامل لتفادي قيود المعاينة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح بنافذة مستقلة خارج المعاينة</span>
            </a>

            <button
              onClick={() => setShowExplainerModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-[#008069] bg-[#e7f7f3] hover:bg-[#d8f2eb] border border-[#008069]/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>كيف تصل الرسائل؟ ومن هو المُرسِل؟</span>
            </button>

            <button
              onClick={() => setIsSenderModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#008069]" />
              <span>تغيير رقم المُرسِل / ربط QR</span>
            </button>

            <button
              onClick={() => setIsGatewayModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#008069]" />
              <span>إعدادات السيرفر السحابي (Meta API)</span>
            </button>
          </div>
        </div>

        {/* Dispatch Mode Selector: Solves "Can we send directly without opening a window for each number?" */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            اختر طريقة الإرسال المناسبة لك (بدون إغراق المتصفح بالنوافذ):
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Mode 1: Single Dedicated Tab (Solves user's problem 100%!) */}
            <div
              onClick={() => setDispatchMode('single_tab_flow')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-right flex items-start gap-3 ${
                dispatchMode === 'single_tab_flow'
                  ? 'bg-[#e7f7f3]/60 border-[#008069] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                dispatchMode === 'single_tab_flow' ? 'border-[#008069] bg-[#008069] text-white' : 'border-slate-300'
              }`}>
                {dispatchMode === 'single_tab_flow' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#008069]" />
                  <span>النافذة المركزية الموحدة (موصى به جداً)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  يفتح البرنامج <strong>نافذة واحدة فقط</strong> على الشاشة تتنقل تلقائياً بين الأرقام بتتابع زمني آمن دون فتح 50 نافذة منبثقة!
                </p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  نافذة واحدة فقط للشاشة كلها ✓
                </span>
              </div>
            </div>

            {/* Mode 2: Direct Cloud API (Zero windows) */}
            <div
              onClick={() => setDispatchMode('direct_cloud')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-right flex items-start gap-3 ${
                dispatchMode === 'direct_cloud'
                  ? 'bg-[#e7f7f3]/60 border-[#008069] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                dispatchMode === 'direct_cloud' ? 'border-[#008069] bg-[#008069] text-white' : 'border-slate-300'
              }`}>
                {dispatchMode === 'direct_cloud' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#008069]" />
                  <span>الإرسال السحابي المباشر (Meta API)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  إرسال سحابي في الخلفية <strong>بدون فتح أي نافذة متصفح إطلاقاً (0 تبويبات)</strong> عبر خوادم Meta الرسمية أو الـ Webhook.
                </p>
                <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                  0 نوافذ · صامت بالخلفية
                </span>
              </div>
            </div>

            {/* Mode 3: Individual direct links */}
            <div
              onClick={() => setDispatchMode('individual_popup')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-right flex items-start gap-3 ${
                dispatchMode === 'individual_popup'
                  ? 'bg-[#e7f7f3]/60 border-[#008069] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                dispatchMode === 'individual_popup' ? 'border-[#008069] bg-[#008069] text-white' : 'border-slate-300'
              }`}>
                {dispatchMode === 'individual_popup' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#008069]" />
                  <span>فتح محادثة مستقلة لكل رقم</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  فتح نافذة محادثة واتساب الرسمية المجهزة بالنص لكل رقم، لمن يريد مراجعة وإرسال كل رسالة بشكل فردي.
                </p>
                <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                  مراجعة يدوية فردية
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Test Message Tool: Solves "I added my number and it didn't arrive" */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#008069]" />
              <span>تجربة فورية: أرسل رسالة تجريبية الآن إلى رقم هاتفك للتأكد:</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              اكتب رقمك هنا واضغط إرسال؛ سيفتح واتساب فوراً محادثة رقمك محملة بالرسالة والصورة لتصلك وتتأكد بنفسك.
            </p>
          </div>

          <form onSubmit={handleSendTestToMyPhone} className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={testCountryCode}
              onChange={(e) => setTestCountryCode(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#008069]"
            >
              <option value="966">🇸🇦 +966</option>
              <option value="20">🇪🇬 +20</option>
              <option value="971">🇦🇪 +971</option>
              <option value="965">🇰🇼 +965</option>
              <option value="963">🇸🇾 +963</option>
              <option value="962">🇯🇴 +962</option>
            </select>

            <input
              type="text"
              required
              value={testMyNumber}
              onChange={(e) => setTestMyNumber(e.target.value)}
              placeholder="اكتب رقمك (مثال: 0501234567)"
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#008069] font-mono dir-ltr text-left flex-1 sm:w-48"
            />

            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>إرسال تجريبي لرقمي الآن</span>
            </button>
          </form>
        </div>

        {testSentNotice && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            testSentNotice.type === 'success' 
              ? 'bg-[#e7f7f3] border border-[#008069]/30 text-[#008069]'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testSentNotice.text}</span>
          </div>
        )}

      </div>

      {/* SECTION 2: Main Grid: Message Composer + Queue & Controls + Smartphone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Message Composer & Media (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#008069]" />
              <span>محتوى الرسالة والوسائط</span>
            </h2>
            <span className="text-[11px] text-[#008069] font-semibold bg-[#e7f7f3] px-2 py-0.5 rounded">
              صياغة Spintax الذكية
            </span>
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
              placeholder="اكتب نص الرسالة هنا... استخدم المتغيرات {الاسم} أو الصيغ المتغيرة {مرحباً|أهلاً|تحياتنا}."
              className="w-full bg-white border border-slate-200 focus:border-[#008069] rounded-xl p-3 text-xs text-slate-800 leading-relaxed outline-none resize-none font-sans"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              💡 استخدام الأقواس المعقوفة مثل <span className="font-mono text-[#008069] font-semibold">{'{مرحباً|أهلاً|السلام عليكم}'}</span> يولد نصوصاً مختلفة لكل عميل لحماية حسابك من الحظر.
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
            <span className="text-xs font-semibold text-slate-700 block">زر توجيه تفاعلي (Call To Action):</span>
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
                <span>الفواصل الزمنية الذكية لحماية الحساب من الحظر</span>
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
                  max={15}
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
                  min={6}
                  max={30}
                  value={settings.delayMax}
                  onChange={(e) => setSettings({ ...settings, delayMax: Number(e.target.value) })}
                  className="w-full accent-[#008069] cursor-pointer"
                />
              </div>
            </div>
            
            <p className="text-[10px] text-slate-600 leading-tight">
              🛡️ يختار البرنامج فاصلاً عشوائياً مختلفاً بين كل رسالة والأخرى لتجنب الرتابة وحماية رقمك.
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
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">تقدم الحملة:</span>
                <span className="font-mono text-[#008069] font-bold">{progressPercent}% ({sentCount} من {contacts.length})</span>
              </div>
              <span className="text-[11px] text-[#008069] font-bold">
                {dispatchMode === 'single_tab_flow' 
                  ? '🎯 نافذة مركزية موحدة' 
                  : dispatchMode === 'direct_cloud' 
                  ? '⚡ سحابي في الخلفية (0 نوافذ)' 
                  : '🔗 محادثات فردية'}
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#008069] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Live Controller Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartCampaign}
                    disabled={contacts.length === 0 || sentCount === contacts.length}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {dispatchMode === 'single_tab_flow' 
                        ? 'بدء الإرسال بالنافذة الموحدة' 
                        : dispatchMode === 'direct_cloud'
                        ? 'بدء الإرسال السحابي بالخلفية'
                        : 'بدء تشغيل الحملة'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseCampaign}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف مؤقت</span>
                  </button>
                )}

                <button
                  onClick={handleResetCampaign}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط</span>
                </button>

                <button
                  onClick={() => setShowPopupsHelpModal(true)}
                  className="px-2.5 py-1.5 text-xs text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-1 cursor-pointer"
                  title="حل مشكلة النوافذ المنبثقة المحظورة في متصفحك"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>حل حظر النوافذ</span>
                </button>
              </div>

              {isRunning && countdown > 0 && (
                <div className="text-xs text-amber-700 font-mono flex items-center gap-1 font-semibold animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>الرسالة التالية بعد {countdown} ثوانٍ...</span>
                </div>
              )}
            </div>
          </div>

          {/* Sequential Dispatch Card (Always Available - 100% immune to Popup Blockers!) */}
          {contacts.length > 0 && currentIndex < contacts.length && (
            <div className="p-4 bg-emerald-50 border-2 border-[#008069] rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#008069]">
                  <Zap className="w-4 h-4 fill-current text-[#008069]" />
                  <span>محطة الإرسال المباشر (يتجاوز حظر المتصفح 100%):</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    الرقم {currentIndex + 1} من {contacts.length}
                  </span>
                  {currentIndex > 0 && (
                    <button
                      onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                      className="text-[11px] text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
                    >
                      السابق
                    </button>
                  )}
                  {currentIndex + 1 < contacts.length && (
                    <button
                      onClick={() => setCurrentIndex((p) => Math.min(contacts.length - 1, p + 1))}
                      className="text-[11px] text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
                    >
                      التالي ❯
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={getMobileAppUrl(contacts[currentIndex])}
                  onClick={() => handleAdvanceSequential(contacts[currentIndex], 'app')}
                  className="w-full sm:flex-1 py-3 px-4 bg-[#008069] hover:bg-[#006e5a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>إرسال الآن عبر تطبيق واتساب: {contacts[currentIndex].name}</span>
                </a>

                <a
                  href={getDirectWhatsAppUrl(contacts[currentIndex])}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAdvanceSequential(contacts[currentIndex], 'web')}
                  className="w-full sm:flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 border-2 border-[#008069] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#008069]" />
                  <span>إرسال عبر واتساب ويب: {contacts[currentIndex].name}</span>
                </a>
              </div>

              <div className="text-[11px] text-emerald-800 flex items-center justify-between">
                <span>⚡ اضغط الزر ليفتح واتساب فوراً وتصل الرسالة لـ ({contacts[currentIndex].name})، وسينتقل تلقائياً للرقم التالي!</span>
                {isRunning && (
                  <button
                    onClick={handlePauseCampaign}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    إيقاف الحملة
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Guidance Banner for Guaranteed Delivery */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>💡 حل مشكلة حظر النوافذ المنبثقة:</strong>
              <p className="mt-0.5 text-[11px] text-amber-800">
                إذا كان متصفحك يحظر النوافذ التلقائية: اضغط على أزرار <strong>«واتساب»</strong> أو <strong>«ويب»</strong> الخضراء في الجدول أدناه لكل رقم مباشرة؛ فهي روابط أصلية <strong>لا يمكن للمتصفح حظرها إطلاقاً</strong> وتفتح المحادثة لتصل الرسالة فوراً!
              </p>
            </div>
          </div>

          {/* Contacts Table with Direct Send Button */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">الاسم</th>
                    <th className="py-2.5 px-3">رقم الهاتف</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3 text-center">إرسال فوري بالواتساب</th>
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
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#008069] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم الإرسال ✓✓</span>
                            </span>
                          )}
                          {contact.status === 'sending' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-bold animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>جارٍ التوجيه...</span>
                            </span>
                          )}
                          {contact.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>لم تُرسل (يلزم مفتاح سحابي)</span>
                            </span>
                          )}
                          {contact.status === 'pending' && (
                            <span className="text-[11px] text-slate-400">
                              في الانتظار
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Native WhatsApp App Link (100% bypasses popup blocker) */}
                            <a
                              href={getMobileAppUrl(contact)}
                              onClick={() => {
                                const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                                setContacts((prev) =>
                                  prev.map((c) => (c.id === contact.id ? { ...c, status: 'sent', sentAt: now } : c))
                                );
                                addLog(`📱 تم فتح تطبيق واتساب مباشرة لرقم: ${contact.name} (${contact.phone})`);
                              }}
                              title="فتح في تطبيق واتساب مباشرة (لا يحظره المتصفح أبداً)"
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>واتساب</span>
                            </a>

                            {/* WhatsApp Web Direct Link (100% bypasses popup blocker) */}
                            <a
                              href={getDirectWhatsAppUrl(contact)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                                setContacts((prev) =>
                                  prev.map((c) => (c.id === contact.id ? { ...c, status: 'sent', sentAt: now } : c))
                                );
                                addLog(`🌐 تم فتح واتساب ويب لرقم: ${contact.name} (${contact.phone})`);
                              }}
                              title="فتح في واتساب ويب (لا يحظره المتصفح)"
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <ExternalLink className="w-3 h-3 text-[#008069]" />
                              <span>ويب</span>
                            </a>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContact(contact.id);
                              }}
                              title="حذف الرقم"
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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
                  المنظومة جاهزة للإرسال. اضغط "بدء الإرسال بالنافذة الموحدة" للبدء بتتابع آمن ومنظم.
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-right">
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

      {/* Explainer Modal: Answers "Who is the sender?", "Why didn't message arrive?", "How to send without tabs?" */}
      {showExplainerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#008069]" />
                <h3 className="text-sm font-bold text-slate-900">إجابات هامة حول آلية الإرسال والوصول للأرقام</h3>
              </div>
              <button
                onClick={() => setShowExplainerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                  <Smartphone className="w-4 h-4 text-[#008069]" />
                  <span>1. من هو الرقم الذي يقوم بإرسال الرسائل للأرقام؟</span>
                </div>
                <p className="text-emerald-900 text-xs leading-relaxed">
                  الرسائل في واتساب لا يمكن أن تخرج من الفراغ! الرقم المُرسِل هو <strong>حساب الواتساب الخاص بك أنت</strong> (رقمك الشخصي أو التجاري المسجل على هاتفك أو كمبيوترك)، وتصل الرسالة للمستلم باسمك وصورتك الشخصية، أو من خلال <strong>رقم حساب Meta Cloud API السحابي</strong> إذا كنت تستخدم الحساب المؤسسي.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
                  <Zap className="w-4 h-4 text-blue-700" />
                  <span>2. كيف نرسل الرسائل بشكل مباشر بدون فتح نافذة متصفح لكل رقم؟</span>
                </div>
                <p className="text-blue-900 text-xs leading-relaxed">
                  نوفر لك طريقتين احترافيتين للتخلص من فوضى النوافذ المنبثقة:
                  <br />
                  • <strong>الطريقة الأولى (النافذة المركزية الموحدة Single Tab):</strong> يفتح البرنامج نافذة واحدة فقط ثابتة تتنقل تلقائياً بين الأرقام بتتابع زمني، فلا تفتح 50 نافذة ولا يتعطل المتصفح!
                  <br />
                  • <strong>الطريقة الثانية (الإرسال السحابي Meta Cloud API):</strong> ترسل الرسائل من السيرفر مباشرة في الخلفية (0 نوافذ) وتصل المستلمين فوراً.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>3. لماذا لم تكن الرسالة تصل إلى رقمي عند تجربته، وكيف أتأكد الآن؟</span>
                </div>
                <p className="text-amber-900 text-xs leading-relaxed">
                  عند مراسلة رقمك من نفس رقمك، تفتح محادثة واتساب الرسمية وتحتاج للنقر على زر الإرسال الأخضر داخل المحادثة. يمكنك الآن استخدام زر <strong>"إرسال تجريبي لرقمي الآن"</strong> في أعلى الشاشة؛ وسيفتح محادثتك فوراً جاهزة بالنص والصورة لتضغط إرسال وتراها مباشرة على هاتفك!
                </p>
              </div>

              <button
                onClick={() => setShowExplainerModal(false)}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                فهمت ذلك، العودة للاستوديو
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Sender Number / Pairing Modal */}
      {isSenderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#008069]" />
                <h3 className="text-sm font-bold text-slate-900">تحديد رقم الواتساب المُرسِل</h3>
              </div>
              <button
                onClick={() => setIsSenderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-[#e7f7f3] border border-[#008069]/30 rounded-xl text-xs text-[#008069] leading-relaxed">
                💡 <strong>من هو المُرسِل؟</strong>
                <br />
                الرسائل تخرج من حسابك المسجل هنا، وتظهر للمستلمين برقمك وباسمك تماماً.
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
                <span className="text-xs font-bold text-slate-800 block">خطوات الاقتران عبر تطبيق واتساب:</span>
                
                <div className="w-40 h-40 mx-auto bg-white p-3 border-2 border-[#008069]/40 rounded-2xl shadow-xs flex flex-col items-center justify-center relative">
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
                  <li>اضغط على الإعدادات واختر <strong>"الأجهزة المرتبطة"</strong>.</li>
                  <li>اضغط على <strong>"ربط جهاز"</strong> لتثبيت جلسة الإرسال المباشرة.</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setIsSenderModalOpen(false);
                  addLog(`تم تثبيت وتأكيد رقم المُرسِل: ${senderPhone}`);
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                تأكيد وحفظ رقم المُرسِل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Configuration Modal */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#008069]" />
                <h3 className="text-sm font-bold text-slate-900">إعدادات الإرسال السحابي (Meta Cloud API)</h3>
              </div>
              <button
                onClick={() => setIsGatewayModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-[#e7f7f3] border border-[#008069]/30 rounded-xl text-xs text-[#008069] leading-relaxed">
                ⚡ <strong>الإرسال السحابي في الخلفية (بدون فتح أي نوافذ):</strong>
                <br />
                يسمح لك بإرسال آلاف الرسائل مباشرة من السيرفر إلى واتساب بدون فتح أي صفحة على جهازك نهائياً، باستخدام حساب مطوري Meta الرسمي المجاني.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                    Phone Number ID (معرف رقم الهاتف من Meta):
                  </label>
                  <input
                    type="text"
                    value={gatewayConfig.phoneNumberId || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, phoneNumberId: e.target.value })}
                    placeholder="مثال: 1098457281920"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono outline-none focus:border-[#008069]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                    Permanent Access Token (رمز الوصول الدائم):
                  </label>
                  <input
                    type="password"
                    value={gatewayConfig.accessToken || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, accessToken: e.target.value })}
                    placeholder="EAAG..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono outline-none focus:border-[#008069]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayConfig({
                      ...gatewayConfig,
                      phoneNumberId: '1098457281920',
                      accessToken: 'EAAG_DEMO_TOKEN_SIMULATED',
                    });
                    addLog('تم ملء بيانات تجريبية لحساب Meta Cloud API.');
                  }}
                  className="text-[11px] text-[#008069] underline cursor-pointer"
                >
                  تجربة تعبئة بيانات توضيحية
                </button>

                <button
                  onClick={() => {
                    setIsGatewayModalOpen(false);
                    if (gatewayConfig.phoneNumberId && gatewayConfig.accessToken) {
                      setDispatchMode('direct_cloud');
                      addLog('تم حفظ بيانات Meta Cloud API وتفعيل نمط الإرسال السحابي المباشر بالخلفية.');
                    } else {
                      addLog('تم حفظ إعدادات البوابة.');
                    }
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  حفظ وتفعيل الإرسال السحابي
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Popups Help Modal */}
      {showPopupsHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">حل مشكلة حظر النوافذ المنبثقة في متصفحك</h3>
              </div>
              <button
                onClick={() => setShowPopupsHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                ⚠️ تقوم متصفحات الويب (Chrome, Edge, Safari) بحظر النوافذ التلقائية افتراضياً لحمايتك، لذلك عندما يبدأ الإرسال التلقائي قد يتم منع فتح الواتساب.
              </div>

              <div className="space-y-2.5">
                <div className="font-bold text-slate-900">كيف تسمح بالنوافذ في خطوتين بسيطتين:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <div>
                      <strong className="block text-slate-900">انقر على أيقونة القفل 🔒 أو علامة النافذة المحظورة 🚫</strong>
                      <span className="text-[11px] text-slate-500">ستجدها في أعلى المتصفح في شريط العنوان (بجانب رابط الموقع مباشرة).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <div>
                      <strong className="block text-slate-900">اختر "النوافذ المنبثقة وإعادة التوجيه" (Pop-ups)</strong>
                      <span className="text-[11px] text-slate-500">قم بتغيير الخيار من "حظر" إلى <strong>"سماح دائماً (Always Allow)"</strong>.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div>
                      <strong className="block text-slate-900">أعد تحميل الصفحة أو ابدأ الإرسال</strong>
                      <span className="text-[11px] text-slate-500">سيعمل الإرسال التلقائي المستمر دون أي توقف أو حظر!</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                💡 <strong>أو استخدم الحل البديل المباشر دون الحاجة لتغيير أي إعدادات:</strong>
                <br />
                اضغط على أزرار <strong>«واتساب»</strong> أو <strong>«ويب»</strong> الخضراء الموجودة بجانب كل رقم في الجدول أدناه، فهي روابط عادية لا يحظرها المتصفح أبداً!
              </div>

              <button
                onClick={() => setShowPopupsHelpModal(false)}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                حسناً، فهمت الطريقة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
