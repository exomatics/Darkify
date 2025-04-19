import React, { useEffect, useMemo, useRef } from 'react';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';

import type {
  ElementProps,
  FlipOptions,
  OffsetOptions,
  Placement,
  ShiftOptions,
} from '@floating-ui/react';
import { StyledDropdown } from '../../Header/ui/Actions/styles.ts';

type DropdownProps = {
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  children: React.ReactNode;
  visible: boolean;
  setVisible: (newValue: boolean) => void;
  onClose?: () => void;
  offsetOptions?: OffsetOptions | number;
  shiftOptions?: ShiftOptions;
  flipOptions?: FlipOptions;
  enableFlip?: boolean;
  enableDismiss?: boolean;
  placement?: Placement;
  popoverStyles?: React.CSSProperties;
  width?: string;
  height?: string;
  onMountChange?: (newValue: boolean) => void;
};

export const Dropdown = ({
  anchorRef,
  children,
  visible,
  offsetOptions,
  shiftOptions,
  flipOptions,
  enableFlip = true,
  enableDismiss = true,
  placement = 'bottom',
  popoverStyles = {},
  width = 'auto',
  height = 'auto',
  setVisible,
  onClose,
  onMountChange,
}: DropdownProps) => {
  const popupRef = useRef<HTMLElement | null>(null);

  const middleware = useMemo(() => {
    return [
      offsetOptions ? offset(offsetOptions) : undefined,
      enableFlip ? flip(flipOptions) : undefined,
      shift(shiftOptions),
    ].filter(Boolean);
  }, [offsetOptions, enableFlip, flipOptions, shiftOptions]);

  const { refs, floatingStyles, context } = useFloating({
    middleware,
    whileElementsMounted: autoUpdate,
    placement,
    open: visible,
    onOpenChange: (open) => {
      if (!open) {
        onClose?.();
      }
      setVisible(open);
    },
  });

  useEffect(() => {
    if (anchorRef.current) refs.setReference(anchorRef.current);
  }, [anchorRef, refs]);

  const setPopupRef = (node: HTMLElement | null) => {
    popupRef.current = node;
    refs.setFloating(node);
  };

  const dismiss = useDismiss(context, {
    outsidePressEvent: 'click',
  });
  const { getFloatingProps } = useInteractions(
    [enableDismiss ? dismiss : null].filter(Boolean) as ElementProps[],
  );

  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { open: 200, close: 100 },
    initial: { opacity: 0 },
    open: { opacity: 1 },
    close: { opacity: 0 },
  });

  useEffect(() => {
    onMountChange?.(isMounted);
  }, [isMounted, onMountChange]);

  return isMounted ? (
    <FloatingPortal>
      <StyledDropdown
        role="dialog"
        aria-modal="true"
        aria-hidden={!visible}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        ref={setPopupRef}
        style={{ ...floatingStyles, ...styles, ...popoverStyles, width, height }}
        {...getFloatingProps()}
      >
        {children}
      </StyledDropdown>
    </FloatingPortal>
  ) : (
    <FloatingPortal>
      <div />
    </FloatingPortal>
  );
};
