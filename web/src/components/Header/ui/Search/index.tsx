import styled, { css } from 'styled-components';
import { Icons } from '../../../UI/Icons';
import { useEffect, useRef, useState } from 'react';

const StyledSearch = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  width: 350px;
  height: 46px;
  cursor: pointer;
  padding-left: 21px;
  padding-right: 21px;
  border-radius: 10px;
  transition: 300ms background;

  .icon {
    width: 22px;
    height: 22px;
  }
  input {
    background: transparent;
    height: 100%;
    flex: 1;
    padding-left: 15px;
    outline: none;
    border: none;
    color: ${({ theme }) => theme.colors.fg.primary};
    font-size: 14px;
    letter-spacing: 3%;
    cursor: pointer;
  }
  .icon {
    svg path,
    svg rect,
    svg circle {
      transition: 300ms stroke;
    }
  }
  input::placeholder {
    transition: 300ms color;
  }
  &:hover {
    input::placeholder {
      color: ${({ theme }) => theme.colors.fg.primary};
    }
    .icon {
      svg path,
      svg rect,
      svg circle {
        stroke: ${({ theme }) => theme.colors.fg.primary};
      }
    }
  }

  ${({ $active }) =>
    $active &&
    css`
      background-color: ${({ theme }) => theme.colors.bg.primary};
      input::placeholder {
        color: ${({ theme }) => theme.colors.fg.primary};
      }
      .icon {
        svg path,
        svg rect,
        svg circle {
          stroke: ${({ theme }) => theme.colors.fg.primary};
        }
      }
      cursor: text;
      input {
        cursor: text;
      }
    `}
`;

export const HeaderSearch = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);

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

  console.log(active);

  return (
    <StyledSearch $active={active} onClick={() => inputRef?.current?.focus()}>
      <div className="icon">
        <Icons.Big.Search />
      </div>
      <input ref={inputRef} type="text" placeholder="Search" />
    </StyledSearch>
  );
};
