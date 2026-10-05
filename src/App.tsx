import React, { useState } from 'react';
import { Header } from './components/Header';
import { BulkSender } from './components/BulkSender';
import { GroupExtractor } from './components/GroupExtractor';
import { AutoResponder } from './components/AutoResponder';
import { AntiBanGuide } from './components/AntiBanGuide';
import { VideoTutorials } from './components/VideoTutorials';
import { UserGuide } from './components/UserGuide';
import { SupportModal } from './components/SupportModal';
import { Contact } from './types';
import { 
  Send, Users, Filter, Bot, ShieldCheck, Video, 
  Headphones, Award, Sparkles, CheckCircle2, 
  ChevronLeft, BookOpen
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sender');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Cross-component state: imported contacts from Extractor to Sender
  const handleImportToCampaign = (newContacts: Contact[]) => {
    setActiveTab('sender');
  };

  const featureCards = [
    {
      num: '01',
      title: 'إرسال غير محدود للأرقام',
      desc: 'إرسال آلاف الرسائل لأي رقم هاتف دون الحاجة لتسجيله في جهات اتصال الهاتف.',
      icon: Send,
      tab: 'sender',
    },
    {
      num: '02',
      title: 'دليل التشغيل والاستخدام',
      desc: 'إرشادات عملية خطوة بخطوة للتشغيل الصحيح وضمان أعلى كفاءة وأمان.',
      icon: BookOpen,
      tab: 'guide',
    },
    {
      num: '03',
      title: 'مجموعات الواتساب غير المحدودة',
      desc: 'إرسال ونشر الرسائل الترويجية لجميع مجموعات الواتساب بنقرة زر واحدة.',
      icon: Users,
      tab: 'extractor',
    },
    {
      num: '04',
      title: 'استخراج الأرقام من المجموعات',
      desc: 'استخراج وتجميع أرقام الأعضاء بكفاءة وسرعة فائقة من كافة مجموعات الواتساب.',
      icon: Filter,
      tab: 'extractor',
    },
    {
      num: '05',
      title: 'تصفية وفحص حسابات الواتساب',
      desc: 'فلترة الأرقام المستهدفة والتحقق من امتلاكها لحسابات واتساب نشطة واستبعاد الأرضي.',
      icon: CheckCircle2,
      tab: 'extractor',
    },
    {
      num: '06',
      title: 'إرسال الفيديو والصور والملفات',
      desc: 'دعم كامل لإرفاق مقاطع الفيديو الجاذبة، صور المنتجات، ملفات PDF، والكتالوجات.',
      icon: Video,
      tab: 'sender',
    },
    {
      num: '07',
      title: 'الرد الآلي الذكي والشات بوت',
      desc: 'الرد التلقائي على استفسارات وأسئلة العملاء بالكلمات المفتاحية على مدار 24 ساعة.',
      icon: Bot,
      tab: 'autoresponder',
    },
    {
      num: '08',
      title: 'إدارة التأخير والحماية من الحظر',
      desc: 'فواصل زمنية عشوائية وتوقف مؤقت ذكي لمحاكاة السلوك البشري وحماية رقمك.',
      icon: ShieldCheck,
      tab: 'antiban',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111b21] flex flex-col font-sans selection:bg-[#008069] selection:text-white">
      
      {/* Top Bar with comfortable light theme */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Quick Tools Access Bar */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 overflow-x-auto scrollbar-none shadow-xs">
          <div className="flex items-center gap-2 min-w-max text-xs">
            <span className="text-slate-500 font-semibold px-2 flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#008069]" />
              <span>أدوات المنظومة المتاحة:</span>
            </span>

            {[
              { id: 'sender', label: '1. استوديو إرسال الرسائل' },
              { id: 'guide', label: '2. دليل التشغيل والاستخدام' },
              { id: 'extractor', label: '3. استخراج وتصفية أرقام المجموعات' },
              { id: 'autoresponder', label: '4. الرد الآلي والشات بوت' },
              { id: 'antiban', label: '5. إرشادات تجنب الحظر والأمان' },
              { id: 'tutorials', label: '6. شروحات الفيديو المسجلة' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-medium ${
                  activeTab === tool.id
                    ? 'bg-[#008069] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Section Render */}
        {activeTab === 'sender' && (
          <BulkSender
            onOpenAntiBanGuide={() => setActiveTab('antiban')}
            onOpenUserGuide={() => setActiveTab('guide')}
          />
        )}

        {activeTab === 'guide' && (
          <UserGuide
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenSupportModal={() => setIsSupportModalOpen(true)}
          />
        )}

        {activeTab === 'extractor' && (
          <GroupExtractor onImportToCampaign={handleImportToCampaign} />
        )}

        {activeTab === 'autoresponder' && <AutoResponder />}

        {activeTab === 'antiban' && <AntiBanGuide />}

        {activeTab === 'tutorials' && <VideoTutorials />}

        {/* Feature Highlights Grid at Bottom of page */}
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#008069] font-mono tracking-wider">
                WHATSAPP MARKETING POWER SUITE
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                كافة مميزات برنامج "ابعت رسالتك التسويقية علي الواتساب"
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('sender')}
              className="text-xs text-[#008069] hover:text-[#006e5a] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>بدء استخدام استوديو الإرسال الآن</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.num}
                  onClick={() => setActiveTab(feat.tab)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#008069]/60 hover:shadow-xs transition-all cursor-pointer group text-right shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#008069] group-hover:border-[#008069]/30 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 group-hover:text-[#008069] font-semibold">
                      {feat.num}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-[#008069] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Guarantees & Features Strip */}
        <section className="p-6 bg-white rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#008069]/10 text-[#008069] flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">فيديوهات شرح توضيحية</div>
              <div className="text-[11px] text-slate-500">دروس عملية مسجلة خطوة بخطوة</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#008069]/10 text-[#008069] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">دعم فني متواصل 24/7</div>
              <div className="text-[11px] text-slate-500">مساعدة مباشرة وتحكم عن بُعد مجاناً</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#008069]/10 text-[#008069] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">جاهز للعمل المباشر</div>
              <div className="text-[11px] text-slate-500">منظومة مفتوحة ومتاحة للاستخدام الفوري</div>
            </div>
          </div>
        </section>

      </main>

      {/* Clean Light Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-right">
            <span className="font-bold text-slate-900">واتس برو (WhatsPro)</span>
            <span className="mx-2">·</span>
            <span>المنظومة الاحترافية للتسويق الآلي عبر واتساب</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-[#008069] transition-colors cursor-pointer"
            >
              دليل التشغيل والاستخدام
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('antiban')}
              className="hover:text-[#008069] transition-colors cursor-pointer"
            >
              سياسات الأمان وتجنب الحظر
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="hover:text-[#008069] transition-colors cursor-pointer"
            >
              الدعم الفني المباشر
            </button>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </div>
        </div>
      </footer>

      {/* Support Modal only */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

    </div>
  );
}
