import * as React from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/UI/label.tsx';
import { useId } from 'react';

function Textarea({
  className,
  label,
  ...props
}: React.ComponentProps<'textarea'> & { label?: string }) {
  const id = useId();
  return (
    <>
      {label && (
        <Label className="mb-2" htmlFor={id}>
          {label}
        </Label>
      )}
      <textarea
        data-slot="textarea"
        className={cn(
          'resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-4 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </>
  );
}

export { Textarea };
