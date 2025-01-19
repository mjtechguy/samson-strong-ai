import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { ProfileForm } from './components/ProfileForm';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AppLayout } from './components/layout/AppLayout';
import { DBErrorBoundary } from './components/common/DBErrorBoundary';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthGuard } from './components/auth/AuthGuard';
import { Programs } from './components/programs/Programs';
import { MyPrograms } from './components/programs/MyPrograms';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DBErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/profile" element={
              <AuthGuard>
                <AppLayout>
                  <ProfileForm />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/chat" element={
              <AuthGuard>
                <AppLayout>
                  <ChatInterface />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/programs" element={
              <AuthGuard>
                <AppLayout>
                  <Programs />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/my-programs" element={
              <AuthGuard>
                <AppLayout>
                  <MyPrograms />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/admin/*" element={
              <AuthGuard requireAdmin>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </DBErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;