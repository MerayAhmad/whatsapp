import React, { useState } from 'react';
import { 
  Bot, Plus, Trash2, CheckCircle2, 
  Send, Smartphone, ShieldCheck, RefreshCw
} from 'lucide-react';
import { AutoResponderRule } from '../types';
import { initialRules } from '../data/mockData';

export const AutoResponder: React.FC = () => {
  const [rules, setRules] = useState<AutoResponderRule[]>(initialRules);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Rule Form State
  const [newRule, setNewRule] = useState<Partial<AutoResponderRule>>({
    name: '',
    keywords: [],
    matchType: 'contains',
    responseText: '',
    isActive: true,
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Simulator Chat State
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string }>
  >([
    {
      sender: 'bot',
      text: 'مرحباً بك في خدمة العملاء لبرنامج واتس برو! 🌿 يمكنك تجربة الرد الآلي بكتابة كلمات مثل: "السعر"، "التفاصيل"، "السلام عليكم"، أو "طلب".',
      time: '10:00 ص',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Simulator Send Handler
  const handleSimulateSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Append user message
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setUserInput('');
    setIsBotTyping(true);

    // Simulate bot thinking and matching rules
    setTimeout(() => {
      let matchedResponse =
        'شكراً لتواصلك معنا! سيقوم أحد ممثلي خدمة العملاء بالرد عليك قريباً. أو يمكنك كتابة "السعر" أو "المميزات" للاطلاع على التفاصيل تلقائياً.';

      // Check active rules
      for (const rule of rules) {
        if (!rule.isActive) continue;
        const matches = rule.keywords.some((kw) => {
          const lowerUser = userText.toLowerCase();
          const lowerKw = kw.toLowerCase().trim();
          if (rule.matchType === 'exact') return lowerUser === lowerKw;
          if (rule.matchType === 'starts_with') return lowerUser.startsWith(lowerKw);
          return lowerUser.includes(lowerKw);
        });

        if (matches) {
          matchedResponse = rule.responseText;
          break;
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: matchedResponse,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsBotTyping(false);
    }, 700);
  };

  // Add Rule Handler
  const handleSaveRule = () => {
    if (!newRule.name || !newRule.responseText) return;

    const kwArray = keywordInput
      .split(/[,;\n]/)
      .map((k) => k.trim())
      .filter(Boolean);

    const ruleToAdd: AutoResponderRule = {
      id: `rule_${Date.now()}`,
      name: newRule.name,
      keywords: kwArray.length > 0 ? kwArray : ['استفسار'],
      matchType: newRule.matchType || 'contains',
      responseText: newRule.responseText,
      isActive: true,
    };

    setRules((prev) => [ruleToAdd, ...prev]);
    setShowAddModal(false);
    setNewRule({ name: '', keywords: [], matchType: 'contains', responseText: '', isActive: true });
    setKeywordInput('');
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner styled with eye-friendly light theme */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069] shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>نظام الرد الآلي الذكي (WhatsApp Auto-Responder)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#008069]/10 text-[#008069] font-bold">
                جاهز للعمل 24/7
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              توجيه العملاء والرد على استفساراتهم فورياً بالكلمات المفتاحية دون أي تدخل يدوي، لزيادة المبيعات وسرعة التفاعل.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قاعدة رد جديدة</span>
        </button>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Rules List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-800">قواعد الردود التلقائية النشطة ({rules.length}):</span>
            <span>الكلمات المفتاحية تطلق الرد فورياً</span>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                  rule.isActive ? 'border-slate-200' : 'border-slate-200/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{rule.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (
                      {rule.matchType === 'contains'
                        ? 'يحتوي على'
                        : rule.matchType === 'exact'
                        ? 'تطابق تام'
                        : 'يبدأ بـ'}
                      )
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-colors cursor-pointer ${
                        rule.isActive
                          ? 'bg-[#e7f7f3] text-[#008069] border border-[#008069]/30'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rule.isActive ? 'مفعلة ✓' : 'معطلة'}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="حذف القاعدة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Keywords list */}
                <div className="mb-2.5">
                  <span className="text-[11px] text-slate-500 ml-1">الكلمات المحفزة:</span>
                  <div className="inline-flex flex-wrap gap-1 align-middle">
                    {rule.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-50 text-[#008069] border border-slate-200 px-2 py-0.5 rounded-md font-mono font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Response Text */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {rule.responseText}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Live Simulator (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#008069]" />
              <h2 className="text-sm font-bold text-slate-900">تجربة الرد الآلي التفاعلية</h2>
            </div>
            <button
              onClick={() =>
                setChatMessages([
                  {
                    sender: 'bot',
                    text: 'أهلاً بك! تم مسح المحادثة. يمكنك تجربة كتابة أي كلمة مفتاحية الآن.',
                    time: '10:00 ص',
                  },
                ])
              }
              className="text-[11px] text-slate-500 hover:text-[#008069] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة البدء</span>
            </button>
          </div>

          {/* Quick Suggestions to Test */}
          <div>
            <span className="text-[11px] text-slate-500 block mb-1.5">اضغط على عبارة للاختبار الفوري:</span>
            <div className="flex flex-wrap gap-1.5">
              {['كم السعر؟', 'السلام عليكم', 'ما هي مميزات البرنامج؟', 'أريد معرفة التفاصيل'].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setUserInput(sample);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Simulated WhatsApp Chat Phone Window - Light Theme Canvas */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-[#efeae2] flex flex-col h-[420px] shadow-xs">
            
            {/* Header */}
            <div className="bg-[#008069] p-3 flex items-center gap-2.5 text-white shadow-xs">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                ب
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>بوت خدمة العملاء واتس برو</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <div className="text-[10px] text-emerald-100">الرد الآلي نشط الآن</div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 font-sans">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-2.5 text-xs text-right leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-[#c4eec0]'
                        : 'bg-white text-[#111b21] rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="text-[9px] text-[#667781] mt-1 font-mono text-left">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-[#008069] text-xs px-3 py-1.5 rounded-xl rounded-tl-none flex items-center gap-1.5 animate-pulse border border-slate-200 shadow-xs font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جارٍ كتابة الرد...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSimulateSend} className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="اكتب رسالة كعميل للتجربة..."
                className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#008069] border border-slate-200"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-[#008069] hover:bg-[#006e5a] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* Add New Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#008069]" />
                <span>إضافة قاعدة رد آلي جديدة</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم أو تصنيف القاعدة:
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="مثال: الاستفسار عن الشحن والتوصيل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الكلمات المفتاحية المحفزة (افصل بينها بفاصلة):
                </label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="شحن, توصيل, التوصيل, متى يصل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008069]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نوع المطابقة:
                </label>
                <select
                  value={newRule.matchType}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      matchType: e.target.value as 'contains' | 'exact' | 'starts_with',
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008069] cursor-pointer"
                >
                  <option value="contains">يحتوي على الكلمة (الأكثر مرونة وموصى به)</option>
                  <option value="exact">تطابق تام مع الكلمة فقط</option>
                  <option value="starts_with">تبدأ الرسالة بالكلمة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الرد التلقائي:
                </label>
                <textarea
                  rows={4}
                  value={newRule.responseText}
                  onChange={(e) => setNewRule({ ...newRule, responseText: e.target.value })}
                  placeholder="اكتب الرد التوضيحي الذي سيصل العميل فوراً..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#008069] leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveRule}
                disabled={!newRule.name || !newRule.responseText}
                className="px-4 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                حفظ القاعدة وتفعيلها
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
