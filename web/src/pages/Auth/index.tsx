import { StyledAuth } from './styles';
import LogoIcon from './assets/logo.svg?react';
import { Button, Input } from '@headlessui/react';
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
    <StyledAuth>
      <div className="body">
        <div className="logo">
          <LogoIcon width={55} height={55} />
          <span>Darkify</span>
        </div>

        <>
          <form className="form" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="input">
              <label htmlFor="email">{isLogin ? 'Email or username' : 'Email'}</label>
              <Input
                id="email"
                placeholder={isLogin ? 'Email or username' : 'Email'}
                {...register('emailOrUsername')}
              />
            </div>
            <div className="input">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                placeholder="Password"
                {...register('password')}
              />
            </div>
            <Button type="submit" className="button">
              Login
            </Button>
          </form>
          <p className="subtext">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <a onClick={() => setIsLogin(!isLogin)}>Sign up for Darkify</a>
          </p>
        </>
      </div>
    </StyledAuth>
  );
};

type LoginForm = {
  emailOrUsername: string;
  password: string;
};
