import { Icons } from '../UI/Icons';
import { SidebarElement } from './ui/SidebarElement';

export type SidebarElementDataBase = {
  label: string;
  icon: keyof typeof Icons.Big;
  to?: string;
};

type SidebarElementDataWithChildren = SidebarElementDataBase & {
  expandable: true;
  children: SidebarElementDataBase[];
};

type SidebarElementDataWithoutChildren = SidebarElementDataBase & {
  expandable?: false;
  children?: never;
};

type SidebarElementData = SidebarElementDataWithChildren | SidebarElementDataWithoutChildren;

const sidebarElements: SidebarElementData[] = [
  {
    label: 'Playlists',
    icon: 'Playlist',
    to: '/playlists',
  },
  {
    label: 'Liked Songs',
    icon: 'Like',
    to: '/liked',
  },
  {
    label: 'Albums',
    icon: 'Album',
  },
  {
    label: 'Artists',
    icon: 'Artist',
  },
];

export const Sidebar = () => {
  return (
    <div className="p-3 flex flex-col gap-3 max-w-[248px]" style={{ gridArea: 'sidebar' }}>
      {sidebarElements.map((element) => (
        <SidebarElement
          to={element.to ?? '/'}
          key={element.label}
          icon={element.icon}
          expandable={element.expandable}
          expandedElements={element.children}
        >
          {element.label}
        </SidebarElement>
      ))}
    </div>
  );
};
