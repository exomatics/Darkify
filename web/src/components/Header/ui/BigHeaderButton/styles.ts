import styled, { css } from 'styled-components';

export const StyledBigHeaderButton = styled.button<{ $active: boolean }>`
  height: 46px;
  padding-left: 21px;
  padding-right: 100px;
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  gap: 18px;
  .icon {
    width: 26px;
  }
  .label {
    color: ${({ theme }) => theme.colors.fg.secondary};
    transition: 200ms color;
  }
  svg path,
  svg rect,
  svg circle {
    transition:
      200ms stroke,
      200ms fill;
  }
  &:hover {
    .label {
      color: ${({ theme }) => theme.colors.fg.primary};
    }
    svg path,
    svg rect,
    svg circle {
      stroke: ${({ theme }) => theme.colors.fg.primary} !important;
    }
  }
  ${({ $active }) =>
    $active &&
    css`
        background-color: ${({ theme }) => theme.colors.bg.primary};
        .label {
          color: ${({ theme }) => theme.colors.fg.primary};
        }
        svg path,
        svg rect,
        svg circle {
          stroke: ${({ theme }) => theme.colors.fg.primary} !important;
          fill: ${({ theme }) => theme.colors.fg.primary} !important;
        }
      }
    `}
`;
