import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { authAPI, setAccessToken } from '../../../lib/api';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        console.error('❌ OAuth error:', error);
        navigate('/auth/login?error=' + encodeURIComponent(error));
        return;
      }

      if (token) {
        try {
          console.log('🔐 [OAuth Callback] Token received, setting up authentication...');

          // Set token in API client
          setAccessToken(token);

          // Use shared API client so production/development base URLs stay consistent.
          const data = await authAPI.me();
          const user = data.user;

          console.log('✅ [OAuth Callback] User authenticated:', user.email);

          // Update auth context
          dispatch({ type: 'SET_USER', payload: user });

          // Redirect based on role
          const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/products';
          console.log(`🔄 [OAuth Callback] Redirecting to: ${redirectTo}`);
          navigate(redirectTo, { replace: true });
        } catch (err) {
          console.error('❌ [OAuth Callback] Error:', err.message);
          navigate('/auth/login?error=' + encodeURIComponent(err.message));
        }
      } else {
        console.error('❌ No token in URL');
        navigate('/auth/login?error=no_token');
      }
    };

    handleCallback();
  }, [token, error, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700">Completing sign in...</p>
      </div>
    </div>
  );
}

