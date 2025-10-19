import { Layout } from '@/components/Layout';
import { DashboardContent } from '@/components/DashboardContent';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, logout } = useAuth();

  console.log('Index component rendered with user:', user);

  const handleLogout = () => {
    logout();
  };
  
  return (
    <Layout onLogout={handleLogout} user={user}>
      <DashboardContent />
    </Layout>
  );
}
