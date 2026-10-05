import React, { useState } from 'react';
import { 
  Play, Pause, Volume2, Clock, BookOpen, Sparkles, Video, HelpCircle
} from 'lucide-react';
import { tutorialVideos } from '../data/mockData';
import { TutorialVideo } from '../types';
import tutorialThumbnail from '../assets/images/video_tutorial_thumbnail_1791192796202.jpg';

export const VideoTutorials: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo>(tutorialVideos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069] shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>فيديوهات الشرح التوضيحية المتكاملة</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#008069]/10 text-[#008069] font-bold">
                شرح عملي خطوة بخطوة
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              دروس مرئية مسجلة بجودة عالية تشرح جميع خصائص البرنامج من البداية وحتى الاحتراف وإطلاق الحملات الكبرى.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#008069] bg-[#e7f7f3] px-3.5 py-2 rounded-xl border border-[#008069]/20 flex items-center gap-2 font-semibold">
          <Sparkles className="w-4 h-4 text-[#008069]" />
          <span>محتوى تعليمي مجاني متاح دائماً</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Video Player & Step-by-Step Guide (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          
          {/* Video Player Display Container */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video group shadow-md">
            <img
              src={tutorialThumbnail}
              alt="معاينة فيديو الشرح"
              className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
              referrerPolicy="no-referrer"
            />
            
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 flex flex-col justify-between p-4">
              
              {/* Video Title Top Overlay */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#008069] text-white font-mono">
                  {selectedVideo.category}
                </span>
                <span className="text-xs text-white font-mono bg-black/60 px-2 py-0.5 rounded">
                  {selectedVideo.duration}
                </span>
              </div>

              {/* Center Play Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={handlePlayToggle}
                  className="w-16 h-16 rounded-full bg-[#008069] hover:bg-[#006e5a] text-white flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-[#008069] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-3">
                    <button onClick={handlePlayToggle} className="hover:text-white cursor-pointer text-white">
                      {isPlaying ? 'إيقاف مؤقت' : 'تشغيل الشرح'}
                    </button>
                    <span className="text-slate-400">01:35 / {selectedVideo.duration}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] text-slate-300 font-sans">جودة 1080p Full HD</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Video Metadata & Steps */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {selectedVideo.title}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedVideo.description}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-[#008069] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>الخطوات العملية الموضحة في هذا الفيديو:</span>
              </h3>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {selectedVideo.steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#008069]/10 text-[#008069] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Column 2: Playlist (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-[#008069]" />
              <span>فهرس الدروس والشروحات ({tutorialVideos.length})</span>
            </h3>
            <span className="text-xs text-[#008069] font-bold">دروس شاملة</span>
          </div>

          <div className="space-y-2.5">
            {tutorialVideos.map((video) => {
              const isSelected = selectedVideo.id === video.id;
              return (
                <div
                  key={video.id}
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsPlaying(true);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right ${
                    isSelected
                      ? 'bg-[#e7f7f3] border-[#008069]/40 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-[#008069] bg-[#e7f7f3] px-2 py-0.5 rounded">
                      {video.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{video.duration}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {video.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {video.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Need help footer card */}
          <div className="p-4 bg-[#e7f7f3] border border-[#008069]/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#008069]">
              <HelpCircle className="w-4 h-4 text-[#008069]" />
              <span>هل واجهتك صعوبة في تطبيق أي خطوة؟</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              فريق الدعم الفني متواجد لمساعدتك عبر محادثة الواتساب المباشرة أو عبر برنامج AnyDesk / TeamViewer للتحكم عن بُعد مجاناً.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
