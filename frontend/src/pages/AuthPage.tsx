import React, { useState } from 'react';
import { LoginForm, RegisterForm, OperatorLoginForm } from '@/components/AuthForms';
import { Button } from '@/components/ui/button';
import { Film, User, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState<'user' | 'operator'>('user');
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-slate-900 p-4">
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center justify-center mb-2">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="ml-2 text-3xl font-bold text-foreground">BackDrop</h1>
        </Link>
        <p className="text-muted-foreground">The marketplace for pre-production sponsorships.</p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1 mb-4">
          <button
            onClick={() => setAuthMode('user')}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium transition-colors",
              authMode === 'user' ? 'bg-card text-foreground' : 'text-muted-foreground hover:bg-slate-700'
            )}
          >
            <User className="h-4 w-4" />
            {authMode === 'user' && !isLogin ? 'User Registration' : 'User Login'}
          </button>
          <button
            onClick={() => setAuthMode('operator')}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium transition-colors",
              authMode === 'operator' ? 'bg-card text-foreground' : 'text-muted-foreground hover:bg-slate-700'
            )}
          >
            <Shield className="h-4 w-4" />
            Operator Login
          </button>
        </div>

        {authMode === 'user' ? (
          isLogin ? <LoginForm /> : <RegisterForm />
        ) : (
          <OperatorLoginForm />
        )}
      </div>

      {authMode === 'user' && (
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-primary"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </Button>
      )}
    </div>
  );
};

export default AuthPage;