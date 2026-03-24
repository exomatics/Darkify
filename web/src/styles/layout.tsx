import { ReactNode } from 'react';

export const Layout = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      gridTemplateAreas:
        "'header header'\n" +
        "     'sidebar content'\n" +
        "     'sidebar playbar'",
    }}
    className="grid grid-rows-[54px_1fr_81px] grid-cols-[248px_1fr] h-dvh p-3"
  >
    {children}
  </div>
);

export const MainContent = ({ children }: { children: ReactNode }) => (
  <div
    style={{ gridArea: 'content' }}
    className="border border-bg-secondary mt-1 rounded-xl p-3 overflow-x-auto flex flex-col gap-9"
  >
    {children}
  </div>
);
