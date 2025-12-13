import React, { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/AuthForms';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthPage = () => {
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
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <Button
        variant="link"
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-primary"
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </Button>
    </div>
  );
};

export default AuthPage;