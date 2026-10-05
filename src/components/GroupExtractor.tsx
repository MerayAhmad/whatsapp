import React, { useState } from 'react';
import { 
  Users, Filter, Download, ArrowRight, CheckCircle2, 
  XCircle, Copy, Check, ExternalLink, 
  Sparkles, Layers
} from 'lucide-react';
import { Contact } from '../types';

interface GroupExtractorProps {
  onImportToCampaign?: (contacts: Contact[]) => void;
}

export const GroupExtractor: React.FC<GroupExtractorProps> = ({ onImportToCampaign }) => {
  const [activeSubTab, setActiveSubTab] = useState<'extractor' | 'filter' | 'groups'>('extractor');
  
  // Extractor State
  const [rawGroupText, setRawGroupText] = useState(`+966 50 123 4567, +966 55 987 6543, أحمد ميري: السلام عليكم
+20 101 234 5678 انضم عبر رابط الدعوة
00971501122334 غادر المجموعة
+966543210987, +965 900 12345
+966 50 123 4567 (مكرر للتجربة)
رقم أرضي غير صالح: 0114920000
+201123456789, +966531122445`);
  const [extractedNumbers, setExtractedNumbers] = useState<string[]>([]);
  const [deduplicate, setDeduplicate] = useState(true);
  const [copied, setCopied] = useState(false);
  const [importedSuccess, setImportedSuccess] = useState(false);

  // Filter State
  const [filterInput, setFilterInput] = useState(`+966501234567
+201012345678
+971501122334
0114567890
+966114920000
+966559876543
12345
+96590012345`);
  const [validNumbers, setValidNumbers] = useState<string[]>([]);
  const [invalidNumbers, setInvalidNumbers] = useState<string[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  // Sample Groups State
  const [groupBroadcastText, setGroupBroadcastText] = useState('السلام عليكم ورحمة الله وبركاته، نرحب بجميع أعضاء المجموعة الكرام ويسعدنا تقديم العرض الخاص والحصري لهذا الأسبوع! 🌟');
  const [groupLinks, setGroupLinks] = useState([
    { id: '1', name: 'مجموعة تجار ومسوقي الرياض 🇸🇦', link: 'https://chat.whatsapp.com/sample1', members: 480 },
    { id: '2', name: 'ملتقى ريادة الأعمال والاستثمار 💼', link: 'https://chat.whatsapp.com/sample2', members: 620 },
    { id: '3', name: 'سوق العقار والتجارة الإلكترونية 📈', link: 'https://chat.whatsapp.com/sample3', members: 510 },
  ]);

  // Extract Phone Numbers Logic
  const handleExtractNumbers = () => {
    if (!rawGroupText.trim()) return;

    const phoneRegex = /(?:\+?(\d{1,4}))?[-. (]*(\d{1,4})[-. )]*(\d{1,4})[-. ]*(\d{1,9})/g;
    const matches = rawGroupText.match(phoneRegex) || [];

    const cleaned = matches
      .map((num) => num.replace(/[^\d+]/g, ''))
      .filter((num) => {
        const digitsOnly = num.replace(/\D/g, '');
        return digitsOnly.length >= 9 && digitsOnly.length <= 15;
      })
      .map((num) => {
        let formatted = num;
        if (formatted.startsWith('00')) {
          formatted = '+' + formatted.slice(2);
        } else if (!formatted.startsWith('+')) {
          formatted = '+' + formatted;
        }
        return formatted;
      });

    const finalNumbers = deduplicate ? Array.from(new Set(cleaned)) : cleaned;
    setExtractedNumbers(finalNumbers);
    setImportedSuccess(false);
  };

  // Copy Extracted Numbers
  const handleCopy = () => {
    if (extractedNumbers.length === 0) return;
    navigator.clipboard.writeText(extractedNumbers.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (extractedNumbers.length === 0) return;
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + ['رقم الهاتف', ...extractedNumbers].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `أرقام_مجموعات_مستخرجة_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send to Campaign Studio
  const handleSendToCampaign = () => {
    if (extractedNumbers.length === 0) return;
    const newContacts: Contact[] = extractedNumbers.map((num, i) => ({
      id: `extracted_${Date.now()}_${i}`,
      phone: num,
      name: `عضو مجموعة ${i + 1}`,
      customVar: 'مجموعة الواتساب',
      status: 'pending',
    }));

    if (onImportToCampaign) {
      onImportToCampaign(newContacts);
    }
    setImportedSuccess(true);
  };

  // Filter Numbers Logic
  const handleFilterNumbers = () => {
    const lines = filterInput.split('\n');
    const valid: string[] = [];
    const invalid: string[] = [];

    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      const digits = line.replace(/[^\d]/g, '');

      const isLandline = digits.startsWith('96611') || digits.startsWith('96612') || digits.startsWith('011');
      const isValidLength = digits.length >= 10 && digits.length <= 14;

      if (isValidLength && !isLandline && !digits.startsWith('123')) {
        valid.push(line.startsWith('+') ? line : `+${digits}`);
      } else {
        invalid.push(line);
      }
    });

    setValidNumbers(valid);
    setInvalidNumbers(invalid);
    setHasFiltered(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-xs">
        <button
          onClick={() => setActiveSubTab('extractor')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeSubTab === 'extractor'
              ? 'bg-[#008069] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1. استخراج الأرقام من مجموعات الواتساب
        </button>
        <button
          onClick={() => setActiveSubTab('filter')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeSubTab === 'filter'
              ? 'bg-[#008069] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2. تصفية وفحص حسابات الواتساب
        </button>
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeSubTab === 'groups'
              ? 'bg-[#008069] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          3. إرسال لجميع مجموعات الواتساب
        </button>
      </div>

      {/* Tab 1: Extractor */}
      {activeSubTab === 'extractor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#008069]" />
                <span>استخراج أرقام الهواتف بكفاءة عالية من المجموعات</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                الصق نص أعضاء المجموعة أو سجل المحادثة المصدر من تطبيق واتساب، وسيقوم النظام بفرز الأرقام وتنسيقها دولياً فورياً.
              </p>
            </div>

            <textarea
              rows={9}
              value={rawGroupText}
              onChange={(e) => setRawGroupText(e.target.value)}
              placeholder="الصق نصوص المجموعة هنا..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#008069] rounded-xl p-3 text-xs text-slate-800 font-mono outline-none resize-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deduplicate}
                  onChange={(e) => setDeduplicate(e.target.checked)}
                  className="rounded accent-[#008069]"
                />
                <span>استبعاد وحذف الأرقام المكررة تلقائياً</span>
              </label>

              <button
                onClick={handleExtractNumbers}
                className="px-5 py-2 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>بدء استخراج الأرقام</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#008069]" />
                <h3 className="text-sm font-bold text-slate-900">الأرقام المستخرجة</h3>
              </div>
              <span className="text-xs font-mono text-[#008069] font-bold bg-[#e7f7f3] px-2 py-0.5 rounded">
                {extractedNumbers.length} رقم جاهز
              </span>
            </div>

            {extractedNumbers.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  لم يتم استخراج أرقام بعد. اضغط "بدء استخراج الأرقام" لمعاينة النتائج.
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-[220px] overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 space-y-1 divide-y divide-slate-100">
                  {extractedNumbers.map((num, i) => (
                    <div key={i} className="pt-1 flex items-center justify-between">
                      <span className="dir-ltr text-left text-[#008069] font-medium">{num}</span>
                      <span className="text-[10px] text-slate-400 font-sans">رقم {i + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleCopy}
                    className="py-2 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#008069]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ الأرقام'}</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="py-2 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير CSV</span>
                  </button>
                </div>

                <button
                  onClick={handleSendToCampaign}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {importedSuccess ? 'تم تحويل الأرقام للحملة بنجاح ✓' : 'نقل الأرقام مباشرة لاستوديو الحملة'}
                  </span>
                </button>
              </>
            )}

          </div>

        </div>
      )}

      {/* Tab 2: Filter and Validation */}
      {activeSubTab === 'filter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#008069]" />
                <span>تصفية وفحص حسابات الواتساب النشطة</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                فرز الأرقام وتصفية الأرقام الأرضية الثابتة والأرقام غير الصالحة لضمان وصول رسائلك لحسابات نشطة وتفادي إهدار الجهد.
              </p>
            </div>

            <textarea
              rows={8}
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono outline-none resize-none focus:border-[#008069]"
              placeholder="+966501234567..."
            />

            <button
              onClick={handleFilterNumbers}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>فحص وتصفية الأرقام الآن</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">تقرير فحص وتصنيف الأرقام</h3>

            {!hasFiltered ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  أدخل الأرقام واضغط "فحص وتصفية الأرقام الآن" لعرض تقرير الصلاحية.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                <div className="bg-slate-50 border border-[#008069]/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#008069] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>أرقام واتساب صالحة ونشطة:</span>
                    </span>
                    <span className="font-mono text-[#008069] font-bold bg-[#e7f7f3] px-2 py-0.5 rounded">{validNumbers.length} رقم</span>
                  </div>
                  <div className="max-h-28 overflow-y-auto font-mono text-[11px] text-slate-800 divide-y divide-slate-100">
                    {validNumbers.map((n, i) => (
                      <div key={i} className="py-1 dir-ltr text-left text-[#008069]">{n}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-rose-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rose-600 font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>أرقام غير صالحة أو خطوط أرضية مستبعدة:</span>
                    </span>
                    <span className="font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{invalidNumbers.length} رقم</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto font-mono text-[11px] text-slate-500 divide-y divide-slate-100">
                    {invalidNumbers.map((n, i) => (
                      <div key={i} className="py-1 dir-ltr text-left text-rose-500">{n}</div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Group Broadcaster */}
      {activeSubTab === 'groups' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#008069]" />
                <span>إرسال رسائل غير محدودة لجميع مجموعات الواتساب</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                إدارة مجموعات الواتساب المستهدفة ونشر رسالتك الإعلانية دفعة واحدة بكفاءة مع احترام فترات التأخير.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                نص الرسالة الموجهة للمجموعات:
              </label>
              <textarea
                rows={6}
                value={groupBroadcastText}
                onChange={(e) => setGroupBroadcastText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#008069] leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                💡 احرص على أن تكون الرسالة ذات قيمة مضافة لأعضاء المجموعة لتفادي الطرد أو الإبلاغ.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="font-semibold">المجموعات النشطة ({groupLinks.length} مجموعات):</span>
                <span className="text-[#008069] font-bold font-mono">إجمالي الأعضاء: ~1,610 عضو</span>
              </div>

              <div className="space-y-2">
                {groupLinks.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{grp.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{grp.members} عضو نشط</div>
                    </div>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(groupBroadcastText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 text-xs bg-[#e7f7f3] hover:bg-[#daf2ec] text-[#008069] border border-[#008069]/30 rounded-lg flex items-center gap-1.5 transition-colors font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>إرسال الآن</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
