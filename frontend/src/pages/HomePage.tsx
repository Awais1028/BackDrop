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
    if (user && role) {
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
    } else {
      console.log('HomePage useEffect: User not logged in. Redirecting to /login.');
      // User is not logged in, redirect to login page
      navigate('/login', { replace: true });
    }
  }, [user, role, navigate]);

  // This component will quickly redirect, so a simple loading indicator is sufficient
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