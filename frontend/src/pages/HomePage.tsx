import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Settings } from 'lucide-react';

const HomePage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('HomePage useEffect: user:', user, 'role:', role);
    // Only redirect if user is explicitly null (not logged in) or if user and role are set.
    // This prevents premature redirects while AuthContext is initializing.
    if (user === null) {
      console.log('HomePage useEffect: User is explicitly null. Redirecting to /login.');
      navigate('/login', { replace: true });
    } else if (user && role) {
      console.log(`HomePage useEffect: User logged in as ${user.name} (${role}). Redirecting...`);
      // User is logged in, redirect to their specific dashboard
      switch (role) {
        case 'Creator':
          navigate('/creator/scripts', { replace: true });
          break;
        case 'Advertiser':
        case 'Merchant':
          navigate('/discover', { replace: true }); // Both go to discover opportunities
          break;
        case 'Operator':
          // navigate('/operator/inventory', { replace: true }); // Placeholder for operator dashboard
          navigate('/creator/scripts', { replace: true }); // For now, redirect operator to creator scripts as a fallback
          break;
        default:
          console.warn('HomePage useEffect: Unknown role, redirecting to login.');
          navigate('/login', { replace: true }); // Fallback to login if role is unexpected
          break;
      }
    }
    // If user is not null but role is not yet set (e.g., during initial render before full context is ready),
    // the component will stay in its loading state.
  }, [user, role, navigate]);

  // This component will quickly redirect, so a simple loading indicator is sufficient
  // It will only show if `user` is not null but `role` is not yet determined,
  // or during the very brief moment before the redirect to /login if user is null.
  if (user === null) {
    // If user is null, the useEffect above will redirect to /login.
    // This return is mostly a fallback during the very brief moment before redirect.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="mb-8">
          <Settings
            className="w-16 h-16 text-gray-400 animate-spin"
            style={{ animationDuration: "3s" }}
          />
        </div>
        <h1 className="text-xl font-medium text-gray-300 text-center max-w-md">
          Initializing...
        </h1>
        <div className="absolute bottom-4">
          <MadeWithDyad />
        </div>
      </div>
    );
  }

  // If user is not null, but role might still be undefined/null during a very brief transition,
  // or if the redirect logic is still processing.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="mb-8">
        <Settings
          className="w-16 h-16 text-gray-400 animate-spin"
          style={{ animationDuration: "3s" }}
        />
      </div>
      <h1 className="text-xl font-medium text-gray-300 text-center max-w-md">
        Loading your experience...
      </h1>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default HomePage;