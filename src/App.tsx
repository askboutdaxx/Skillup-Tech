import React, { useState, useEffect } from 'react';
import { AuthProgressProvider, useAuthProgress } from './context/AuthProgressContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Explore } from './components/Explore';
import { MyProgress } from './components/MyProgress';
import { Leaderboard } from './components/Leaderboard';
import { ProfileView } from './components/ProfileView';
import { LessonModal } from './components/LessonModal';
import { TrackDetailModal } from './components/TrackDetailModal';
import { AuthModal } from './components/AuthModal';
import { CertificateModal } from './components/CertificateModal';
import { TRACKS, getTrackById } from './data/curriculum';
import { testConnection } from './lib/firebase';

const AppContent: React.FC = () => {
  const { isLoading, checkAndBumpDailyStreak, profile } = useAuthProgress();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    testConnection();
    checkAndBumpDailyStreak();
  }, [checkAndBumpDailyStreak]);

  const selectedTrack = selectedTrackId ? getTrackById(selectedTrackId) || null : null;
  const selectedCertificate = selectedCertificateId
    ? profile.certificates?.find((c) => c.id === selectedCertificateId) || null
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col items-center justify-center p-4 transition-colors duration-250">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center text-xl font-black text-[#1E5EFF] dark:text-blue-300 animate-pulse mb-4">
          S
        </div>
        <h2 className="text-lg font-bold text-[#0D1E4C] dark:text-white">Loading SkillUp Tech...</h2>
        <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-1">Connecting to your learning records</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col md:flex-row text-[#0D1E4C] dark:text-white transition-colors duration-250">
      {/* Sidebar for Desktop, Header/Bottom Nav for Mobile */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenLesson={(lessonId) => setSelectedLessonId(lessonId)}
            onNavigateToExplore={() => {
              setActiveTab('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToLeaderboard={() => {
              setActiveTab('leaderboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToProgress={() => {
              setActiveTab('progress');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTrackDetail={(trackId) => setSelectedTrackId(trackId)}
            onOpenCertificate={(certId) => setSelectedCertificateId(certId)}
          />
        )}

        {activeTab === 'explore' && (
          <Explore
            onOpenTrackDetail={(trackId) => setSelectedTrackId(trackId)}
            onOpenLesson={(lessonId) => setSelectedLessonId(lessonId)}
            onOpenCertificate={(certId) => setSelectedCertificateId(certId)}
          />
        )}

        {activeTab === 'progress' && (
          <MyProgress
            onOpenTrackDetail={(trackId) => setSelectedTrackId(trackId)}
            onOpenLesson={(lessonId) => setSelectedLessonId(lessonId)}
            onOpenCertificate={(certId) => setSelectedCertificateId(certId)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenCertificate={(certId) => setSelectedCertificateId(certId)}
          />
        )}
      </main>

      {/* Lesson Reader & Practice Modal */}
      {selectedLessonId && (
        <LessonModal
          lessonId={selectedLessonId}
          onClose={() => setSelectedLessonId(null)}
          onSelectLesson={(newId) => setSelectedLessonId(newId)}
        />
      )}

      {/* Track Syllabus & Module Drawer */}
      {selectedTrack && (
        <TrackDetailModal
          track={selectedTrack}
          isOpen={!!selectedTrack}
          onClose={() => setSelectedTrackId(null)}
          onOpenLesson={(lessonId) => setSelectedLessonId(lessonId)}
          onOpenCertificate={(certId) => setSelectedCertificateId(certId)}
        />
      )}

      {/* Official Certificate of Completion Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificateId(null)}
        />
      )}

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProgressProvider>
      <AppContent />
    </AuthProgressProvider>
  );
}
