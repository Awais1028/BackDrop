import React, { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/AuthForms';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">backdrop</h1>
      </div>
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <Button
        variant="link"
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-blue-600 dark:text-blue-400"
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </Button>
    </div>
  );
};

export default AuthPage;