import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, Calculator
} from 'lucide-react';
import shieldImg from '../assets/images/safety_antiban_shield_1791192806532.jpg';

export const AntiBanGuide: React.FC = () => {
  // Interactive Calculator State
  const [targetCount, setTargetCount] = useState(250);
  const [accountAgeDays, setAccountAgeDays] = useState(30);

  // Calculate safe intervals and duration
  const minDelaySec = accountAgeDays < 14 ? 12 : 6;
  const maxDelaySec = accountAgeDays < 14 ? 22 : 14;
  const avgDelaySec = (minDelaySec + maxDelaySec) / 2;
  const totalSeconds = targetCount * avgDelaySec + Math.floor(targetCount / 25) * 60;
  const totalMinutes = Math.round(totalSeconds / 60);

  let riskLevel: 'آمن وموصى به بالكامل' | 'متوسط (يستوجب الحذر)' | 'مرتفع المخاطر';
  let riskColor: string;
  if (accountAgeDays < 7 && targetCount > 100) {
    riskLevel = 'مرتفع المخاطر';
    riskColor = 'text-rose-600 bg-rose-50 border-rose-200';
  } else if (targetCount > 500) {
    riskLevel = 'متوسط (يستوجب الحذر)';
    riskColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else {
    riskLevel = 'آمن وموصى به بالكامل';
    riskColor = 'text-[#008069] bg-[#e7f7f3] border-[#008069]/30';
  }

  const chapters = [
    {
      number: '01',
      title: 'بروتوكول تسخين الأرقام والحسابات الجديدة (Warm-up)',
      summary: 'التدرج اليومي في حجم الإرسال للحسابات الحديثة لبناء سمعة رقمية موثوقة لدى خوادم ميتا.',
      points: [
        'الأسبوع الأول (اليوم 1 - 7): أرسل بين 20 إلى 50 رسالة يومياً فقط لجهات اتصال معروفة أو عملاء سابقين.',
        'الأسبوع الثاني (اليوم 8 - 14): ارفع المعدل إلى 100 - 150 رسالة يومياً مع فواصل زمنية لا تقل عن 10 ثوانٍ.',
        'الأسبوع الثالث فما بعد: يمكنك الوصول إلى 300 - 1000 رسالة يومياً مع الالتزام التام بالفواصل العشوائية.',
      ],
    },
    {
      number: '02',
      title: 'إدارة الفواصل الزمنية العشوائية والتوقف المؤقت',
      summary: 'كسر الروتين الآلي ومحاكاة السلوك الإنساني عبر التوقيت غير المنتظم وفترات الراحة.',
      points: [
        'لا ترسل أبداً بفارق زمني ثابت (مثل كل ثانيتين بالضبط)؛ لأن خوارزميات الذكاء الاصطناعي ترصد الأنماط المنتظمة كبوتات.',
        'اضبط التأخير بين 6 إلى 15 ثانية عشوائياً لكل رسالة لتبدو كإرسال بشري طبيعي.',
        'قم بجدولة توقف مؤقت (Pause) لمدة 60 إلى 120 ثانية بعد كل دفعة من 25 إلى 40 رسالة.',
      ],
    },
    {
      number: '03',
      title: 'تقنية تدوير صياغة الرسائل (Spintax)',
      summary: 'تغيير كلمات الرسالة لكل عميل لمنع تشابه المحتوى وتطابق بصمة الرسائل.',
      points: [
        'استخدم الأقواس المعقوفة مثل: {مرحباً بكم|أهلاً وسهلاً|تحياتنا الطيبة} لإنشاء توليفات نصية مختلفة تلقائياً.',
        'قم بتضمين اسم المستلم دائماً {الاسم} وكود خاص {كود_الخصم} لزيادة نسبة التخصيص وتقليل احتمالية الإبلاغ.',
        'تجنب إرسال نصوص متطابقة لمئات الأرقام دون أي تغيير في الحروف أو الروابط.',
      ],
    },
    {
      number: '04',
      title: 'صياغة المحتوى وإتاحة خيار إلغاء الاشتراك',
      summary: 'الوقاية من ضغط العميل على زر "إبلاغ وحظر" (Report & Block).',
      points: [
        'السبب الرئيسي في 90% من حالات حظر الحسابات هو قيام المستلمين بالضغط على "إبلاغ عن رسالة مزعجة".',
        'ضع دائماً في أسفل رسالتك عبارة لطيفة: "للإلغاء وعدم استلام عروضنا مستقبلاً أرسل 0".',
        'عندما يرسل العميل "0"، قم باستبعاد رقمه فوراً من حملاتك اللاحقة لتبقى قائمتك نقية.',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Visual Banner styled with comfortable light palette */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center shadow-xs">
        <div className="p-6 md:p-8 md:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام الحماية المتقدم (Anti-Ban Protection System)</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            الدليل الفني التفصيلي لإدارة تأخير الرسائل وحماية حساب الواتساب من الحظر
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            تم إعداد هذا الدليل بالتعاون مع نخبة من خبراء التسويق الرقمي وهندسة الأتمتة لضمان استمرارية تشغيل أرقامك دون انقطاع وبأعلى معايير الأمان المعتمدة.
          </p>
        </div>

        <div className="md:col-span-4 h-48 md:h-full relative overflow-hidden bg-slate-100">
          <img
            src={shieldImg}
            alt="حماية الحساب من الحظر"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Interactive Anti-Ban Safety Calculator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#008069]" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              حاسبة معدل الإرسال الآمن وفترات التأخير الموصى بها
            </h2>
          </div>
          <span className="text-xs text-[#008069] font-bold bg-[#e7f7f3] px-2 py-0.5 rounded">حساب فوري ديناميكي</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="text-xs text-slate-700 block font-semibold">
              عدد الرسائل المخطط إرسالها:
            </label>
            <div className="text-lg font-bold text-slate-900 font-mono">{targetCount} رسالة</div>
            <input
              type="range"
              min={20}
              max={1500}
              step={10}
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full accent-[#008069] cursor-pointer"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="text-xs text-slate-700 block font-semibold">
              عمر حساب الواتساب:
            </label>
            <div className="text-lg font-bold text-slate-900 font-mono">{accountAgeDays} يوم</div>
            <input
              type="range"
              min={1}
              max={180}
              value={accountAgeDays}
              onChange={(e) => setAccountAgeDays(Number(e.target.value))}
              className="w-full accent-[#008069] cursor-pointer"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs text-slate-500 block">الفارق الزمني الآمن:</span>
            <div className="text-lg font-bold text-[#008069] font-mono">
              {minDelaySec} - {maxDelaySec} ثانية
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              فارق عشوائي يتغير بين كل عملية إرسال والأخرى.
            </p>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${riskColor}`}>
            <span className="text-xs block opacity-80 font-medium">مستوى الأمان والوقت المتوقع:</span>
            <div className="text-sm font-bold truncate">{riskLevel}</div>
            <div className="text-[11px] font-mono opacity-90">
              الوقت الإجمالي المتوقع: ~{totalMinutes} دقيقة
            </div>
          </div>

        </div>
      </div>

      {/* Chapters Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {chapters.map((chap) => (
          <div
            key={chap.number}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#008069] bg-[#e7f7f3] px-2 py-0.5 rounded border border-[#008069]/20">
                البند {chap.number}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{chap.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {chap.summary}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {chap.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#008069] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
