import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

import { StudentDashboard } from './pages/StudentDashboard';
import { JeeModule } from './pages/JeeModule';
import { EapcetModule } from './pages/EapcetModule';
import { SyllabusPage } from './pages/SyllabusPage';
import ExamSyllabusPage from './pages/ExamSyllabusPage';
import PyqExplorerPage from './pages/PyqExplorerPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { MockTestsPage } from './pages/MockTestsPage';
import { MockTestEngine } from './pages/MockTestEngine';
import { TestResultPage } from './pages/TestResultPage';
import { PreviousPapersPage } from './pages/PreviousPapersPage';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage';
import { VideoLibraryPage } from './pages/VideoLibraryPage';
import StateExamsPage from './pages/StateExamsPage';
import CollegeDiscoveryPage from './pages/CollegeDiscoveryPage';
import CollegeDetailsPage from './pages/CollegeDetailsPage';
import CollegeComparePage from './pages/CollegeComparePage';
import CutoffExplorerPage from './pages/CutoffExplorerPage';
import CollegePredictorPage from './pages/CollegePredictorPage';
import { BranchDirectoryPage } from './pages/BranchDirectoryPage';
import { RankEstimatorPage } from './pages/RankEstimatorPage';
import { BTechRoadmapPage } from './pages/BTechRoadmapPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { DirectMessagingPage } from './pages/DirectMessagingPage';
import { DoubtSessionPage } from './pages/DoubtSessionPage';
import { CommunityPage } from './pages/CommunityPage';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Student & General Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Dedicated Admin Public Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Academic & Guidance Routes */}
              <Route path="/jee" element={<JeeModule />} />
              <Route path="/eapcet" element={<EapcetModule />} />
              <Route path="/syllabus" element={<ExamSyllabusPage />} />
              <Route path="/exam-syllabus" element={<ExamSyllabusPage />} />
              <Route path="/pyqs" element={<PyqExplorerPage />} />
              <Route path="/practice" element={<PyqExplorerPage />} />
              <Route path="/mock-tests" element={<MockTestsPage />} />
              <Route path="/previous-papers" element={<PreviousPapersPage />} />
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/videos" element={<VideoLibraryPage />} />
              <Route path="/state-exams" element={<StateExamsPage />} />
              <Route path="/colleges" element={<CollegeDiscoveryPage />} />
              <Route path="/colleges/:id" element={<CollegeDetailsPage />} />
              <Route path="/compare-colleges" element={<CollegeComparePage />} />
              <Route path="/compare" element={<CollegeComparePage />} />
              <Route path="/cutoffs" element={<CutoffExplorerPage />} />
              <Route path="/college-predictor" element={<CollegePredictorPage />} />
              <Route path="/btech-roadmap" element={<BTechRoadmapPage />} />
              <Route path="/community" element={<CommunityPage />} />

              {/* Student Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mock-tests/:id/take" 
                element={
                  <ProtectedRoute>
                    <MockTestEngine />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mock-tests/:id/result" 
                element={
                  <ProtectedRoute>
                    <TestResultPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mock-tests/attempts/:id/result" 
                element={
                  <ProtectedRoute>
                    <TestResultPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-assistant" 
                element={
                  <ProtectedRoute>
                    <AiAssistantPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <DirectMessagingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doubt-sessions" 
                element={
                  <ProtectedRoute>
                    <DoubtSessionPage />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
