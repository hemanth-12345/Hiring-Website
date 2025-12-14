import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CandidateDashboard from '@/components/dashboard/CandidateDashboard';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <DashboardLayout>
      {role === 'candidate' && <CandidateDashboard />}
      {role === 'employer' && <EmployerDashboard />}
      {role === 'admin' && <AdminDashboard />}
    </DashboardLayout>
  );
}
