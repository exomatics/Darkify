import { StyledAuth } from './styles';
import LogoIcon from './assets/logo.svg?react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/authService';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: LoginForm) => {
    await login(data.emailOrUsername, data.password);
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
              <div className="grid w-full max-w-lg items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input className="bg-transparent" type="email" id="email" placeholder="Email" />
              </div>
              <div className="grid w-full max-w-lg items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  className="bg-transparent"
                  type="password"
                  id="password"
                  placeholder="Password"
                />
              </div>
              <Button variant="default">Button</Button>
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
                {/* <Input id="email" name="email" placeholder="Email" /> */}
              </div>
              <div className="input">
                <label htmlFor="password">Password</label>
                {/* <Input type="password" id="password" name="password" placeholder="Password" /> */}
              </div>
              <Button>Register</Button>
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
