import { NavLink } from 'react-router';
import styled from 'styled-components';

export const StyledBigHeaderButton = styled(NavLink)`
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
  text-decoration: none;
  .icon,
  .icon-active {
    width: 26px;
  }
  .icon-active {
    display: none;
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
  &.active {
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
    .icon {
      display: none;
    }
    .icon-active {
      display: block;
    }
  }
`;
