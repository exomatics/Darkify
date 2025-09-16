import LogoIcon from './assets/logo.svg?react';

import { useEffect, useState } from 'react';
import { useUser } from '@/features/auth/authService.ts';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '@/components/UI/button.tsx';
import { Input } from '@/components/UI/input.tsx';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, login, register: registerAccount } = useUser();
  const navigate = useNavigate();

  const { register, handleSubmit, watch } = useForm<LoginForm>();

  const values = watch();
  console.log(values);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleFormSubmit = async (data: LoginForm) => {
    if (isLogin) {
      await login(data.emailOrUsername, data.password);
    } else {
      await registerAccount(data.emailOrUsername, data.password);
    }
  };

  return (
    <div className="h-dvh bg-[linear-gradient(180deg,_#09421d,_#000)] flex justify-center items-center">
      <div className="w-[650px] h-[700px] bg-bg-primary rounded-xl p-3 flex flex-col items-center justify-center">
        <div className="flex items-center text-primary">
          <LogoIcon className="text-primary" width={55} height={55} />
          <span className="font-bold text-3xl">Darkify</span>
        </div>
        <form className="w-1/2 mt-14 flex flex-col gap-5" onSubmit={handleSubmit(handleFormSubmit)}>
          <Input
            label={isLogin ? 'Email or username' : 'Email'}
            placeholder={isLogin ? 'Email or username' : 'Email'}
            {...register('emailOrUsername')}
          />
          <Input
            type="password"
            label="Password"
            placeholder="Password"
            {...register('password')}
          />
          <Button size="lg" variant="default" type="submit">
            Login
          </Button>
        </form>
        <p className="mt-12 text-fg-secondary">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <a
            className="text-fg-primary font-bold underline decoration-2 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            Sign up for Darkify
          </a>
        </p>
      </div>
    </div>
  );
};

type LoginForm = {
  emailOrUsername: string;
  password: string;
};
