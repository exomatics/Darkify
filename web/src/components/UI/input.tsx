import * as React from 'react';

import { cn } from '@/lib/utils';
import { useId } from 'react';
import { Label } from '@/components/UI/label.tsx';

function Input({
  className,
  type,
  label,
  ...props
}: React.ComponentProps<'input'> & { label?: string; ref?: React.Ref<HTMLInputElement> }) {
  const id = useId();

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        ref={props.ref}
        type={type}
        id={id}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-11 w-full min-w-0 rounded-md border  bg-transparent px-4 py-3 text-md shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
