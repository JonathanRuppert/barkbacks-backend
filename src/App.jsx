import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BusinessAuthProvider } from './contexts/BusinessAuthContext.jsx';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext.jsx';
import { VideoProvider } from './contexts/VideoContext.jsx';
import PublicNavBar from './components/public/PublicNavBar.jsx';
import HomePage from './components/public/HomePage.jsx';
import ForBusinessesPage from './components/public/ForBusinessesPage.jsx';
import Login from './components/customer/Login.jsx';
import Register from './components/customer/Register.jsx';
import Dashboard from './components/customer/Dashboard.jsx';
import Settings from './components/customer/Settings.jsx';
import LandingPage from './components/customer/LandingPage.jsx';
import VideoWizard from './components/customer/VideoWizard.jsx';
import VideoStatus from './components/customer/VideoStatus.jsx';
import PaymentSuccess from './components/customer/PaymentSuccess.jsx';
import PaymentCancel from './components/customer/PaymentCancel.jsx';
import CustomerProtectedRoute from './components/customer/CustomerProtectedRoute.jsx';
import AuthPage from './components/business/AuthPage.jsx';
import DaycareNavBar from './components/business/DaycareNavBar.jsx';
import BusinessDashboard from './components/business/BusinessDashboard.jsx';
import DaycareVideoForm from './components/business/DaycareVideoForm.jsx';
import VideoGallery from './components/business/VideoGallery.jsx';
import Analytics from './components/business/Analytics.jsx';
import Customers from './components/business/Customers.jsx';
import CustomerDetail from './components/business/CustomerDetail.jsx';
import BusinessProtectedRoute from './components/business/BusinessProtectedRoute.jsx';
import './App.css';

function AppShell() {
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname === '/for-businesses';
  const isBusinessApp = location.pathname.startsWith('/business') && location.pathname !== '/business/login' && location.pathname !== '/business/register';

  return (
    <>
      {isPublicPage && <PublicNavBar />}
      {isBusinessApp && <DaycareNavBar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/for-businesses" element={<ForBusinessesPage />} />

        <Route path="/app/login" element={<Login />} />
        <Route path="/app/register" element={<Register />} />
        <Route
          path="/app/dashboard"
          element={
            <CustomerProtectedRoute>
              <Dashboard />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/app/settings"
          element={
            <CustomerProtectedRoute>
              <Settings />
            </CustomerProtectedRoute>
          }
        />
        <Route path="/app/daycare/:daycareId" element={<LandingPage />} />
        <Route path="/app/create/:daycareId" element={<VideoWizard />} />
        <Route path="/app/video/:jobId" element={<VideoStatus />} />
        <Route path="/app/payment/success" element={<PaymentSuccess />} />
        <Route path="/app/payment/cancel" element={<PaymentCancel />} />

        <Route path="/business/login" element={<AuthPage />} />
        <Route path="/business/register" element={<AuthPage initialMode="register" />} />
        <Route
          path="/business/dashboard"
          element={
            <BusinessProtectedRoute>
              <BusinessDashboard />
            </BusinessProtectedRoute>
          }
        />
        <Route
          path="/business/videos"
          element={
            <BusinessProtectedRoute>
              <VideoGallery />
            </BusinessProtectedRoute>
          }
        />
        <Route
          path="/business/create"
          element={
            <BusinessProtectedRoute>
              <DaycareVideoForm />
            </BusinessProtectedRoute>
          }
        />
        <Route
          path="/business/analytics"
          element={
            <BusinessProtectedRoute>
              <Analytics />
            </BusinessProtectedRoute>
          }
        />
        <Route
          path="/business/customers"
          element={
            <BusinessProtectedRoute>
              <Customers />
            </BusinessProtectedRoute>
          }
        />
        <Route
          path="/business/customers/:customerId"
          element={
            <BusinessProtectedRoute>
              <CustomerDetail />
            </BusinessProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <CustomerAuthProvider>
      <BusinessAuthProvider>
        <VideoProvider>
          <AppShell />
        </VideoProvider>
      </BusinessAuthProvider>
    </CustomerAuthProvider>
  );
}
