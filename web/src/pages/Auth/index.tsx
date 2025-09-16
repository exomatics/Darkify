import LogoIcon from './assets/logo.svg?react';

import { useEffect, useState } from 'react';
import { useUser } from '../../features/auth/authService';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, login, register: registerAccount } = useUser();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<LoginForm>();

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

        <>
          <form className="mt-14 flex flex-col gap-5" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="flex flex-col">
              <label className="font-medium" htmlFor="email">
                {isLogin ? 'Email or username' : 'Email'}
              </label>
              <input
                className="bg-transparent border border-fg-secondary py-3 px-2 w-[300px] mt-2 font-medium rounded-md outline-none"
                id="email"
                placeholder={isLogin ? 'Email or username' : 'Email'}
                {...register('emailOrUsername')}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium" htmlFor="password">
                Password
              </label>
              <input
                className="bg-transparent border border-fg-secondary py-3 px-2 w-[300px] mt-2 font-medium rounded-md outline-none"
                type="password"
                id="password"
                placeholder="Password"
                {...register('password')}
              />
            </div>
            <button
              type="submit"
              className="py-3 px-5 rounded-full text-sub outline-none border-none bg-primary font-semibold mt-2 text-bg-primary"
            >
              Login
            </button>
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
        </>
      </div>
    </div>
  );
};

type LoginForm = {
  emailOrUsername: string;
  password: string;
};
