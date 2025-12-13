import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Settings } from 'lucide-react';

const HomePage = () => {
  const { user, role, isLoading } = useAuth(); // Get isLoading from context
  const navigate = useNavigate();

  useEffect(() => {
    console.log('HomePage useEffect: isLoading:', isLoading, 'user:', user, 'role:', role);

    if (isLoading) {
      console.log('HomePage useEffect: AuthContext is still loading. Waiting...');
      return; // Do nothing while authentication context is loading
    }

    if (user === null) {
      console.log('HomePage useEffect: AuthContext finished loading, user is null. Redirecting to /login.');
      navigate('/login', { replace: true });
    } else if (user && role) {
      console.log(`HomePage useEffect: AuthContext finished loading, user logged in as ${user.name} (${role}). Redirecting...`);
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
  }, [user, role, isLoading, navigate]); // Add isLoading to dependencies

  // Display loading indicator if AuthContext is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="mb-8">
          <Settings
            className="w-16 h-16 text-gray-400 animate-spin"
            style={{ animationDuration: "3s" }}
          />
        </div>
        <h1 className="text-xl font-medium text-gray-300 text-center max-w-md">
          Initializing application...
        </h1>
        <div className="absolute bottom-4">
          <MadeWithDyad />
        </div>
      </div>
    );
  }

  // This part should ideally not be reached if redirects work correctly,
  // but serves as a fallback if something goes wrong after loading.
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