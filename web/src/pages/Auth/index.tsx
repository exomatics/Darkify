import { StyledAuth } from './styles';
import LogoIcon from './assets/logo.svg?react';
import { Button, Input } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/authService';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<LoginForm>();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (data: LoginForm) => {
    login?.(data.emailOrUsername, data.password);
  };

  return (
    <StyledAuth>
      <div className="body">
        <div className="logo">
          <LogoIcon width={55} height={55} />
          <span>Darkify</span>
        </div>
        {isLogin && (
          <>
            <form className="form" onSubmit={handleSubmit(handleLogin)}>
              <div className="input">
                <label htmlFor="email">Email or username</label>
                <Input
                  id="email"
                  placeholder="Email or username"
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
              Don't have an account? <a onClick={() => setIsLogin(!isLogin)}>Sign up for Darkify</a>
            </p>
          </>
        )}
        {!isLogin && (
          <>
            <form className="form">
              <div className="input">
                <label htmlFor="email">Email</label>
                <Input id="email" name="email" placeholder="Email" />
              </div>
              <div className="input">
                <label htmlFor="password">Password</label>
                <Input type="password" id="password" name="password" placeholder="Password" />
              </div>
              <Button className="button">Register</Button>
            </form>
            <p className="subtext">
              Already have an account? <a onClick={() => setIsLogin(!isLogin)}>Log in to Darkify</a>
            </p>
          </>
        )}
      </div>
    </StyledAuth>
  );
};

type LoginForm = {
  emailOrUsername: string;
  password: string;
};
