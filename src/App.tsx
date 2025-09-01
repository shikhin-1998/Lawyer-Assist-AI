import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout';
import { useThemeStore } from './stores/themeStore';
import { useToastStore } from './stores/toastStore';
import { useAuthStore } from './stores/authStore';
import { useChatStore } from './stores/chatStore';
import { useHotkeys } from './hooks/useHotkeys';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Toaster from './components/ui/toaster';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import DocumentWorkspace from './pages/DocumentWorkspace';
import NotFound from './pages/NotFound';
import './App.css';

// Component to handle global shortcuts
const GlobalShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme } = useThemeStore();
  const { createThread } = useChatStore();

  const handleToggleMic = () => {
    // This would be handled by the Dashboard component
    console.log('Toggle mic shortcut triggered');
  };

  const handleNewNote = () => {
    createThread();
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  const handleUploadPDF = () => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
    // The Dashboard component will handle showing the upload modal
    window.dispatchEvent(new CustomEvent('showUploadPDF'));
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSearchPDF = () => {
    // This would be handled by the DocumentWorkspace component
    if (location.pathname.startsWith('/documents/')) {
      window.dispatchEvent(new CustomEvent('focusPDFSearch'));
    }
  };

  useHotkeys({
    onToggleMic: handleToggleMic,
    onToggleTheme: toggleTheme,
    onNewNote: handleNewNote,
    onUploadPDF: handleUploadPDF,
    onGoToDashboard: handleGoToDashboard,
    onSearchPDF: handleSearchPDF,
    actions: [
      {
        id: 'new-note',
        label: 'Create New Note',
        shortcut: 'Ctrl+N',
        action: handleNewNote,
        category: 'Notes'
      },
      {
        id: 'upload-pdf',
        label: 'Upload PDF',
        shortcut: 'Ctrl+U',
        action: handleUploadPDF,
        category: 'Documents'
      },
      {
        id: 'go-dashboard',
        label: 'Go to Dashboard',
        shortcut: 'Ctrl+D',
        action: handleGoToDashboard,
        category: 'Navigation'
      },
      {
        id: 'toggle-theme',
        label: 'Toggle Theme',
        shortcut: 'Ctrl+T',
        action: toggleTheme,
        category: 'Settings'
      }
    ]
  });

  return null;
};

function App() {
  const { isDarkMode } = useThemeStore();
  const { toasts, removeToast } = useToastStore();
  const { isAuthenticated } = useAuthStore();

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="App">
        <GlobalShortcuts />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUp />
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/documents/:docId" element={
            <ProtectedRoute>
              <DocumentWorkspace />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Toaster */}
        <Toaster toasts={toasts} onDismiss={removeToast} />
      </div>
    </Router>
  );
}

export default App;
