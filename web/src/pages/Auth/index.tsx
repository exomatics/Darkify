import { StyledAuth } from './styles';
import LogoIcon from './assets/logo.svg?react';
import { Button, Input } from '@headlessui/react';
import { useState } from 'react';

export const Auth = () => {
  const [login, setLogin] = useState(true);

  return (
    <StyledAuth>
      <div className="body">
        <div className="logo">
          <LogoIcon width={55} height={55} />
          <span>Darkify</span>
        </div>
        {login && (
          <>
            <form className="form">
              <div className="input">
                <label htmlFor="email">Email or username</label>
                <Input id="email" name="email" placeholder="Email or username" />
              </div>
              <div className="input">
                <label htmlFor="password">Password</label>
                <Input type="password" id="password" name="password" placeholder="Password" />
              </div>
              <Button className="button">Login</Button>
            </form>
            <p className="subtext">
              Don't have an account? <a onClick={() => setLogin(!login)}>Sign up for Darkify</a>
            </p>
          </>
        )}
        {!login && (
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
              Already have an account? <a onClick={() => setLogin(!login)}>Log in to Darkify</a>
            </p>
          </>
        )}
      </div>
    </StyledAuth>
  );
};
