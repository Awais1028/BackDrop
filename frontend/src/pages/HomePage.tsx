import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Settings } from 'lucide-react';

const HomePage = () => {
  const { user, role, isLoading } = useAuth(); // Get isLoading state
  const navigate = useNavigate();

  useEffect(() => {
    console.log('HomePage useEffect: isLoading:', isLoading, 'user:', user, 'role:', role);

    // Only attempt to redirect once authentication context has finished loading
    if (!isLoading) {
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
    }
  }, [user, role, isLoading, navigate]); // Add isLoading to dependencies

  // Show a loading indicator while authentication is in progress
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
          Loading your experience...
        </h1>
        <div className="absolute bottom-4">
          <MadeWithDyad />
        </div>
      </div>
    );
  }

  // This part should ideally not be reached if redirects work correctly
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome to BackDrop</h1>
      <p className="text-lg text-gray-300">Please log in to continue.</p>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default HomePage;