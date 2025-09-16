import { Icons } from '../../../UI/Icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import clsx from 'clsx';

export const HeaderSearch = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const latestLocation = useRef<string | null>(null);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    const input = inputRef.current;
    const onFocus = () => {
      setActive(true);
    };
    const onBlur = () => {
      setActive(false);
    };
    input?.addEventListener('focus', onFocus);
    input?.addEventListener('blur', onBlur);

    return () => {
      input?.removeEventListener('focus', onBlur);
    };
  }, []);

  const inputHandler: React.FormEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      console.log(e.target.value);
      if (e.target.value.trim().length > 0) {
        setSearchParams({ search: e.target.value });
        if (location.pathname !== '/search') {
          latestLocation.current = location.pathname;
          navigate('/search');
          console.log(location.pathname);
        }
      } else {
        console.log(latestLocation.current);
        navigate(latestLocation.current);
      }
    },
    [location.pathname, navigate, setSearchParams],
  );

  return (
    <div
      className={clsx(
        'group flex items-center w-[350px] h-12 cursor-pointer px-5 rounded-xl transition-colors ml-3',
        active ? 'bg-bg-primary' : '',
      )}
      onClick={() => inputRef?.current?.focus()}
    >
      <div className="w-5 h-5">
        <Icons.Big.Search
          className={clsx(
            'transition-colors group-hover:text-fg-primary',
            active ? 'text-fg-primary' : 'text-fg-secondary',
          )}
        />
      </div>
      <input
        className="group-hover:placeholder:text-fg-primary bg-transparent h-full flex-1 pl-4 outline-none border-none text-fg-primary text-base cursor-text focus:placeholder:text-fg-primary placeholder:transition-colors"
        onInput={inputHandler}
        ref={inputRef}
        type="text"
        placeholder="Search"
      />
    </div>
  );
};
