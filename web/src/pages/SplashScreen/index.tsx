import LogoIcon from './assets/logo.svg?react';

export const SplashScreen = () => {
  return (
    <div className="flex justify-center items-center h-dvh">
      <div className="flex items-center">
        <LogoIcon className="text-primary" width={55} height={55} />
        <span className="text-primary font-bold text-3xl">Darkify</span>
      </div>
    </div>
  );
};
