import Backdrop from './assets/backdrop.svg?react';
import mockCover from './mock.png';
import mockArtist from './mockArtist.png';
import { CardGridElementType } from '../CardsGrid/types';
import clsx from 'clsx';

export const Card = ({ title, type }: { title: string; type?: CardGridElementType }) => {
  return (
    <div
      className={clsx(
        'group transition-colors rounded-xl max-w-[170px] flex flex-col items-center cursor-pointer',
        {
          'h-full pt-[9px] hover:bg-[#95e6d315]': type === CardGridElementType.Artist,
        },
      )}
    >
      <Backdrop
        className={clsx('w-[156px] mt-[2px]', { hidden: type === CardGridElementType.Artist })}
      />
      <div
        className={clsx('w-[170px] h-[170px] rounded-xl', {
          'flex justify-center items-center': type === CardGridElementType.Artist,
        })}
      >
        <img
          alt="cover"
          className={clsx('object-cover', {
            'rounded-xl': type === CardGridElementType.Playlist,
            'rounded-full w-[90%]': type === CardGridElementType.Artist,
          })}
          src={type === CardGridElementType.Artist ? mockArtist : mockCover}
        />
      </div>
      <div
        className={clsx('pt-4 px-2 pb-3 mt-[-10px] rounded-b-xl  transition-colors', {
          'bg-[#95e6d315]': type === CardGridElementType.Playlist,
        })}
      >
        <div className="flex justify-between items-center max-w-[170px]">
          <div className="whitespace-nowrap text-ellipsis overflow-hidden max-w-[130px]">
            {title}
          </div>
          <span
            className={clsx('text-sub text-[#95e6d3]', {
              hidden: type === CardGridElementType.Artist,
            })}
          >
            50
          </span>
        </div>
        <p
          className={clsx('text-fg-secondary leading-none mt-2', {
            hidden: type === CardGridElementType.Artist,
          })}
        >
          <span className="text-small">Linkin Park, System Of A Down, Coal Chamber...</span>
        </p>
      </div>
    </div>
  );
};
