import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, Play, Users, MessageSquare, 
  ShieldCheck, Bot, FileText, ChevronDown, ChevronUp, 
  ArrowRight, PhoneCall
} from 'lucide-react';

interface UserGuideProps {
  onNavigateToTab: (tab: string) => void;
  onOpenSupportModal: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({
  onNavigateToTab,
  onOpenSupportModal,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const steps = [
    {
      step: 1,
      title: 'الخطوة الأولى: تجهيز وتنسيق قائمة الأرقام المستهدفة',
      icon: Users,
      summary: 'إعداد الأرقام بالصيغة الدولية المعتمدة بدون مسافات أو رموز زائدة.',
      details: [
        'احرص دائماً على أن يبدأ كل رقم بمفتاح الدولة الدولي (مثل: 966+ للمملكة العربية السعودية، أو 20+ لجمهورية مصر العربية، أو 971+ للإمارات).',
        'يمكنك استيراد الأرقام مباشرة من ملف Excel بصيغة CSV، أو نسخها ولصقها في مربع الإدخال اليدوي.',
        'يمكنك إضافة اسم العميل ومتغير مخصص مفصولين بفاصلة، مثال: [966501234567+, محمد عبد الله, كود VIP].',
        'تأكد من عدم وجود أرقام أرضية ثابتة، حيث يمكنك استخدام أداة "تصفية الأرقام" لفحصها واستبعاد غير الصالح تلقائياً.',
      ],
      actionLabel: 'الانتقال إلى استوديو الأرقام',
      targetTab: 'sender',
    },
    {
      step: 2,
      title: 'الخطوة الثانية: صياغة الرسالة واستخدام المتغيرات وتقنية Spintax',
      icon: MessageSquare,
      summary: 'تخصيص الرسالة لكل عميل لمنع الرتابة وكسر بصمة الرسائل المكررة.',
      details: [
        'استخدم المتغيرات التلقائية مثل {الاسم} أو {كود_الخصم}؛ حيث يقوم البرنامج باستبدالها تلقائياً باسم كل مستلم وبياناته الخاصة.',
        'استخدم تقنية تدوير الصياغات المتغيرة (Spintax) عبر وضع الخيارات بين أقواس معقوفة، مثال: {مرحباً بكم|أهلاً وسهلاً|تحياتنا الطيبة} يا {الاسم}.',
        'يقوم النظام باختيار جملة عشوائية لكل مستلم، مما يجعل كل رسالة مرسلة فريدة في نصها ويمنع خوارزميات ميتا من تصنيفها كرسائل نمطية مكررة.',
        'أضف دائماً في نهاية الرسالة خياراً لطيفاً لإلغاء الاشتراك مثل: (للإلغاء أرسل 0)، وذلك لتفادي قيام المستلم بالإبلاغ عن الرسالة.',
      ],
      actionLabel: 'الانتقال إلى محرر الرسائل',
      targetTab: 'sender',
    },
    {
      step: 3,
      title: 'الخطوة الثالثة: إرفاق الوسائط (فيديو، صورة، ملف PDF، أو روابط CTA)',
      icon: FileText,
      summary: 'تعزيز الرسالة بالوسائط المرئية لجذب الانتباه ومضاعفة المبيعات.',
      details: [
        'اختر نوع الوسائط من شريط الخيارات: (نص فقط، صور، مقطع فيديو، ملف مستند، أو رابط توجيه).',
        'عند اختيار الفيديو: ضع رابط الفيديو التوضيحي أو ملف الفيديو بصيغة MP4 مع عنوان شيق يثير فضول العميل.',
        'عند اختيار الصور: يمكنك إرفاق صورة العرض أو بروشور المنتجات مع نص وصفي مميز يظهر أسفل الصورة.',
        'عند اختيار المستندات: يمكنك إرفاق كتالوج المنتجات أو قائمة الأسعار بصيغة PDF ليتم تحميلها فوراً عند العميل.',
        'أزرار الإجراء (CTA): تتيح لك وضع زر تفاعلي يوجه المستلم مباشرة إلى متجرك الإلكتروني أو رابط الحجز المباشر.',
      ],
      actionLabel: 'معاينة الوسائط في المحاكي',
      targetTab: 'sender',
    },
    {
      step: 4,
      title: 'الخطوة الرابعة: ضبط فواصل التأخير الذكي لحماية الحساب من الحظر',
      icon: ShieldCheck,
      summary: 'الالتزام التام بقواعد الأمان والسرعات الموصى بها لضمان استقرار رقمك.',
      details: [
        'لا تقم مطلقاً بضبط فارق زمني ثابت وصغير (مثل ثانية واحدة أو ثانيتين)؛ لأن هذا السلوك يعتبر غير بشري.',
        'اضبط الفارق الزمني العشوائي الذكي بين 6 إلى 15 ثانية؛ حيث يختار البرنامج رقماً عشوائياً مختلفاً بين كل رسالة والأخرى.',
        'قم بتفعيل خيار "التوقف المؤقت" (Pause) لمدة 60 ثانية بعد كل 25 إلى 30 رسالة مرسلة.',
        'إذا كان حساب الواتساب جديداً (أقل من أسبوعين)، يرجى مراجعة "جدول التسخين التدريجي" في تبويب دليل الحماية.',
      ],
      actionLabel: 'فتح دليل الحماية من الحظر',
      targetTab: 'antiban',
    },
    {
      step: 5,
      title: 'الخطوة الخامسة: إطلاق الإرسال ومتابعة سجل العمليات المباشر',
      icon: Play,
      summary: 'بدء الحملة الآلية أو الإرسال الفردي ومراقبة تقدم وصول الرسائل.',
      details: [
        'اضغط على زر "بدء الإرسال التلقائي"؛ سيبدأ النظام فوراً بإرسال الرسائل بالترتيب مع إظهار شريط التقدم والعدّ التنازلي بين الرسائل.',
        'يمكنك إيقاف الحملة مؤقتاً في أي لحظة عبر زر "إيقاف مؤقت" ثم استئنافها لاحقاً دون فقدان موضعك.',
        'يتوفر لكل رقم زر تشغيل سريع لفتح محادثة واتساب الرسمية مباشرة عبر رابط wa.me وتأكيد المحادثة يدوياً إن رغبت.',
        'عقب انتهاء الحملة، يمكنك تصدير تقرير تفصيلي بصيغة CSV يتضمن أسماء المستلمين وحالة كل رسالة ووقت تسليمها.',
      ],
      actionLabel: 'بدء الحملة الآن',
      targetTab: 'sender',
    },
    {
      step: 6,
      title: 'الخطوة السادسة: تفعيل واستخدام نظام الرد الآلي (الشات بوت)',
      icon: Bot,
      summary: 'برمجة الإجابات التلقائية لتوجيه العملاء وتقديم الأسعار في ثوانٍ معدودة.',
      details: [
        'انتقل إلى قسم "الرد الآلي والشات بوت" واطلع على القواعد الافتراضية الجاهزة (الأسعار، الترحيب، المميزات، التفعيل).',
        'أضف قواعد مخصصة لمنتجاتك بكتابة الكلمات المفتاحية المحفزة مثل: [سعر، تفاصيل، مقاس، شحن، فروع].',
        'حدد نوع المطابقة: يفضل دائماً اختيار (يحتوي على الكلمة) لكي يتم الرد حتى لو كتب العميل جملة طويلة تحتوي الكلمة.',
        'استخدم نافذة "محاكي واتساب التفاعلي" لاختبار ردود البوت وكتابة استفساراتك والتأكد من دقة وسرعة الإجابة.',
      ],
      actionLabel: 'الانتقال إلى نظام الرد الآلي',
      targetTab: 'autoresponder',
    },
    {
      step: 7,
      title: 'الخطوة السابعة: استخراج وتصفية الأرقام من المجموعات',
      icon: Users,
      summary: 'تكوين قواعد بيانات عملاء مهتمين من مجموعات واتساب المتخصصة.',
      details: [
        'انسخ سجل محادثة أي مجموعة واتساب تابعة لمجالك أو قائمة الأعضاء بالكامل.',
        'الصق النص في خانة "استخراج الأرقام من المجموعات" واضغط زر "بدء استخراج الأرقام".',
        'يقوم النظام بفرز كافة الأرقام، وتنسيقها بالصيغة الدولية، وحذف الأرقام المكررة والرموز الزائدة في أجزاء من الثانية.',
        'اضغط على "نقل الأرقام مباشرة لاستوديو الحملة" للبدء في مراسلتهم فوراً بدون الحاجة لكتابتهم يدوياً.',
      ],
      actionLabel: 'الانتقال لأداة الاستخراج',
      targetTab: 'extractor',
    },
  ];

  const faqs = [
    {
      q: 'من هو الرقم المُرسِل الذي يقوم بإرسال الرسائل إلى بقية الأرقام؟',
      a: 'في تطبيق واتساب، لا يمكن إرسال رسالة بدون رقم مُرسِل. الرقم المُرسِل هو حساب الواتساب الخاص بك أنت (رقم هاتفك الشخصي أو رقم عملك التجاري المسجل في التطبيق)، وتصل لكافة المستلمين باسمك وصورتك الشخصية. كما يدعم البرنامج الإرسال عبر حساب Meta Cloud API المؤسسي في الخلفية.',
    },
    {
      q: 'هل يمكننا إرسال الرسائل بشكل مباشر بدون ما نفتح لكل رقم نافذة متصفح؟',
      a: 'نعم بكل تأكيد! نوفر لك طريقتين احترافيتين:\n1. طريقة «النافذة المركزية الموحدة Single Tab»: يفتح البرنامج نافذة واحدة فقط على الشاشة تتنقل تلقائياً بين الأرقام بتتابع زمني آمن دون فتح 50 نافذة منبثقة ودون أن يحظرها المتصفح.\n2. طريقة «الإرسال السحابي المباشر Meta Cloud API»: يتم إرسال الرسائل في الخلفية من السيرفر مباشرة (0 نوافذ متصفح نهائياً) وتصل فوراً لهواتف المستلمين.',
    },
    {
      q: 'لماذا لم تكن الرسالة تصل إلى رقمي عند إضافته بالقائمة، وكيف أتأكد من وصولها؟',
      a: 'عندما تراسل رقمك من نفس رقمك، تفتح محادثة واتساب الرسمية وتحتاج للنقر على زر الإرسال الأخضر داخل المحادثة، وستجد الرسالة في خانة (محادثتي مع نفسي Message Yourself). وللتجربة الفورية السريعة: استخدم صندوق "تجربة فورية: أرسل رسالة تجريبية الآن إلى رقم هاتفك" في أعلى شاشة الإرسال؛ وسيفتح المحادثة جاهزة بنصها وصورها لتصلك في ثانية واحدة.',
    },
    {
      q: 'هل أحتاج لحفظ أرقام العملاء في جهات اتصال هاتفي لإرسال الرسائل؟',
      a: 'لا نهائياً! الميزة الأساسية في برنامج واتس برو هي إمكانية إرسال عدد غير محدود من الرسائل إلى أي رقم هاتف محلي أو دولي مباشرة دون الحاجة لتسجيله أو حفظه على الهاتف.',
    },
    {
      q: 'كيف يحميني البرنامج من حظر رقم الواتساب الخاص بي؟',
      a: 'يوفر البرنامج منظومة حماية ثلاثية متكاملة: 1) فواصل زمنية عشوائية ذكية بين الرسائل لمحاكاة السلوك الإنساني. 2) تقنية تدوير صياغات الرسائل Spintax لمنع النمطية وتطابق النصوص. 3) جدول وتوصيات تسخين الحسابات الجديدة لرفع السمعة الرقمية للرقم.',
    },
    {
      q: 'هل يمكنني إرسال مقاطع فيديو وصور وكتالوجات PDF للعملاء؟',
      a: 'نعم بكل تأكيد! يدعم البرنامج إرسال الصور بوضوح عالي، مقاطع الفيديو مع عناوين توضيحية، الملفات والمستندات بصيغة PDF، بالإضافة إلى روابط وأزرار التوجيه التفاعلية (Call to Action).',
    },
    {
      q: 'هل تتوفر فيديوهات شرح مسجلة لكيفية استخدام كافة الأدوات؟',
      a: 'نعم، ستجد داخل البرنامج قسماً كاملاً بعنوان "شروحات الفيديو" يضم دروساً مرئية خطوة بخطوة لكل ميزة، بالإضافة إلى إرشادات نصية وملخص لكل درس.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner styled with comfortable light theme */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>دليل التشغيل والاستخدام التفصيلي</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#008069]/10 text-[#008069] font-bold">
                دليل تفاعلي مباشر
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              إرشادات تشغيل منظومة واتس برو التسويقية خطوة بخطوة، لضمان أعلى معدلات تسليم وأمان تام لحسابك.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSupportModal}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#008069]" />
            <span>طلب مساعدة فنية مباشرة</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Step Navigator & Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar of Steps (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">مراحل التشغيل المعتمدة ({steps.length} مراحل):</span>
            <span className="text-[11px] text-[#008069] font-bold bg-[#e7f7f3] px-2 py-0.5 rounded">عملي 100%</span>
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto">
            {steps.map((st) => {
              const Icon = st.icon;
              const isActive = activeStep === st.step;
              return (
                <button
                  key={st.step}
                  onClick={() => setActiveStep(st.step)}
                  className={`w-full text-right p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 border ${
                    isActive
                      ? 'bg-[#e7f7f3] border-[#008069]/40 shadow-xs text-slate-900'
                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isActive ? 'bg-[#008069] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    0{st.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      {st.title.replace(/^الخطوة .+?: /, '')}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {st.summary}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Detailed View (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          {(() => {
            const current = steps.find((s) => s.step === activeStep) || steps[0];
            const Icon = current.icon;
            return (
              <div className="space-y-6">
                
                {/* Header of Active Step */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-[#008069] font-bold">
                        المرحلة 0{current.step} من 0{steps.length}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        {current.title}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToTab(current.targetTab)}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#008069] bg-[#e7f7f3] hover:bg-[#daf2ec] border border-[#008069]/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span>{current.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed">
                  💡 <span className="font-bold text-[#008069]">الهدف من هذه الخطوة: </span>
                  {current.summary}
                </div>

                {/* Instructions List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">
                    التعليمات والإرشادات التفصيلية للتطبيق السليم:
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {current.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 text-xs text-slate-800 leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#008069] shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Next / Prev buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    disabled={activeStep <= 1}
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    الخطوة السابقة
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    {activeStep} / {steps.length}
                  </span>

                  <button
                    disabled={activeStep >= steps.length}
                    onClick={() => setActiveStep((prev) => Math.min(steps.length, prev + 1))}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#008069] hover:bg-[#006e5a] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    الخطوة التالية
                  </button>
                </div>

              </div>
            );
          })()}
        </div>

      </div>

      {/* Gold Anti-Ban Rules Card */}
      <div className="bg-white border border-[#008069]/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 text-sm font-bold text-[#008069]">
          <ShieldCheck className="w-5 h-5" />
          <span>القواعد الذهبية الخمس لحماية رقمك من الحظر نهائياً (Anti-Ban Rules):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#008069] block mb-1">1. الفواصل العشوائية:</span>
            اضبط دائماً الفارق الزمني العشوائي بين 8 إلى 15 ثانية، وتجنب الفواصل الثابتة.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#008069] block mb-1">2. تدوير الصياغات:</span>
            استخدم خاصية Spintax لتغيير الجمل والكلمات لكل مستلم لكسر نمطية الرسائل.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#008069] block mb-1">3. خيار إلغاء الاشتراك:</span>
            أتح للمستلم خيار الرد بـ "0" لعدم استلام العروض، لمنعه من الضغط على "إبلاغ".
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#008069] block mb-1">4. تسخين الأرقام الجديدة:</span>
            تدرج في الإرسال (30 ثم 80 ثم 200 رسالة يومياً) خلال الأسبوعين الأولين.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#008069] block mb-1">5. تصفية الأرقام أولاً:</span>
            تأكد من فحص الأرقام واستبعاد الخطوط الأرضية قبل بدء أي حملة إعلانية.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#008069] block mb-1">6. التوقف بعد كل دفعة:</span>
            قم بجدولة راحة لمدة 60 ثانية بعد كل دفعة من 25 إلى 40 رسالة مرسلة.
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#008069]" />
            <span>الأسئلة الشائعة حول تشغيل واستخدام البرنامج</span>
          </h3>
          <span className="text-xs text-slate-400">إجابات فورية</span>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isExp = expandedFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isExp ? null : index)}
                  className="w-full text-right p-3.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:text-[#008069] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isExp ? (
                    <ChevronUp className="w-4 h-4 text-[#008069] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isExp && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
