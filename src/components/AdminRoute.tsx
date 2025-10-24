import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Fetch current user to check admin status
      const user = await authApi.getCurrentUser();
      
      setIsAuthenticated(true);
      setIsAdmin(user.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Access Denied!</p>
            <p className="text-sm">
              You don't have permission to access this page. Admin privileges are required.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is admin - render the protected content
  return <>{children}</>;
}
