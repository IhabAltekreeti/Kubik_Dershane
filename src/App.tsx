import React, { useState } from 'react';
import { UserRole, EducationalTrack, StudentProfile } from './types';
import { DEMO_STUDENT_A_LGS, DEMO_STUDENT_B_YKS } from './data/mockData';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/public/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherWorkspace } from './components/teacher/TeacherWorkspace';
import { ParentWorkspace } from './components/parent/ParentWorkspace';
import { ManagementWorkspace } from './components/management/ManagementWorkspace';
import { AssessmentModal } from './components/assessment/AssessmentModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [activeTrack, setActiveTrack] = useState<EducationalTrack>('LGS');
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  // Active student based on selected track
  const activeStudent: StudentProfile = activeTrack === 'LGS' ? DEMO_STUDENT_A_LGS : DEMO_STUDENT_B_YKS;

  const handleSwitchTrack = (newTrack: EducationalTrack) => {
    setActiveTrack(newTrack);
  };

  const handleSelectTrackForStudentView = (track: EducationalTrack) => {
    setActiveTrack(track);
    setCurrentRole('student');
  };

  const handleSelectStudentFromTeacher = (student: StudentProfile) => {
    setActiveTrack(student.track);
    setCurrentRole('student');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
         onOpenAssessment={() => setIsAssessmentOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRole === 'public' && (
          <LandingPage
            onOpenAssessment={() => setIsAssessmentOpen(true)}
            onExploreRole={setCurrentRole}
            onSelectTrack={handleSwitchTrack}
          />
        )}

        {currentRole === 'student' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <StudentDashboard
              key={activeStudent.id}
              student={activeStudent}
              onOpenAssessmentModal={() => setIsAssessmentOpen(true)}
             />
          </div>
        )}

        {currentRole === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TeacherWorkspace
              onSelectStudentProfile={handleSelectStudentFromTeacher}
            />
          </div>
        )}

        {currentRole === 'parent' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ParentWorkspace
              key={activeStudent.id}
              student={activeStudent}
             />
          </div>
        )}

        {currentRole === 'management' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ManagementWorkspace />
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer
        onSelectRole={setCurrentRole}
        onOpenAssessment={() => setIsAssessmentOpen(true)}
      />

      {/* Interactive Free Diagnostic Assessment Modal */}
      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        initialTrack={activeTrack}
        onSelectTrackForStudentView={handleSelectTrackForStudentView}
      />
    </div>
  );
}
