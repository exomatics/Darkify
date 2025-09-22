import { Input } from '@/components/UI/input.tsx';
import { Textarea } from '@/components/UI/textarea.tsx';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/UI/shadcn-io/dropzone';
import { Label } from '@/components/UI/label.tsx';
import { Combobox } from '@/components/UI/combobox.tsx';
import { useUserStore } from '@/features/auth/useUserStore.ts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api.ts';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/UI/button.tsx';
import { useState } from 'react';
import { Track } from '@/components/Track';
import { TrackInfo } from '@/api/gen';
import { Spinner } from '@/components/UI/shadcn-io/spinner';
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/UI/dialog.tsx';
import { useAudioStore } from '@/features/hls-stream/store.ts';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select.tsx';
import { Download } from 'lucide-react';

export const UploadTrack = () => {
  const { register, handleSubmit, setValue, control, reset, watch } = useForm<UploadTrackForm>();
  const { cover, name, track } = useWatch({ control });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const currentUser = useUserStore((store) => store.currentUser);
  const [uploadedTrackId, setUploadedTrackId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<string>('local');
  const playTrack = useAudioStore((store) => store.playTrack);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');

  const [processing, setProcessing] = useState<string | null>(null);
  const [isSuccessDialogOpened, setIsSuccessDialogOpened] = useState<boolean>(false);

  console.log(watch());

  // const featUsers = useQuery({queryKey: ['search-users'], queryFn: api.user.ge})

  const ytdlServiceStatus = useQuery({
    queryKey: ['ytdl'],
    queryFn: () => axios.get('http://localhost:1111/health-check'),
  });

  const isYtdlAvailable = ytdlServiceStatus?.data?.data === 'OK';

  const currentTrack: TrackInfo = {
    name,
    cover_url: coverPreview ?? undefined,
    duration: '',
    id: '',
    artists: [
      {
        id: currentUser?.user_id,
        visible_username: currentUser?.visible_username,
      },
    ],
  };

  const handleFormSubmit = async (data: UploadTrackForm) => {
    try {
      setProcessing('Processing...');
      const track = await api.track.postTracks(data);
      setUploadedTrackId(() => track.id ?? null);
      setIsSuccessDialogOpened(true);
      reset();
    } catch {
      toast.error('Failed to upload track');
    } finally {
      setProcessing(null);
    }
  };

  const handleDropCover = (file: File) => {
    setValue('cover', file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setCoverPreview(e?.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadYtdl = async () => {
    setProcessing('Downloading...');
    try {
      const response = await axios.get('http://localhost:1111/download', {
        responseType: 'blob',
        params: { url: youtubeUrl },
      });
      const mp3Blob = response.data;

      setValue('track', mp3Blob);

      jsmediatags.read(mp3Blob, {
        onSuccess: (tag) => {
          const title = tag?.tags?.title ?? '';
          setValue('name', title);
          if (tag.tags.picture) {
            const picture = tag.tags.picture;
            const byteArray = new Uint8Array(picture.data);
            const blob = new Blob([byteArray], { type: picture.format });
            setValue('cover', blob as File);
            setCoverPreview(URL.createObjectURL(blob));
          }
          setProcessing(null);
        },
        onError: (error) => {
          setProcessing(null);
          toast.error('Failed to get metadata');
          console.error('Failed to get metadata', error);
        },
      });
    } catch (error) {
      toast.error('Failed to download');
      console.error('Failed to download', error);
      setProcessing(null);
    }
  };
  return (
    <div className="p-4 relative">
      <Dialog open={isSuccessDialogOpened} onOpenChange={setIsSuccessDialogOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your track has been successfully published</DialogTitle>
            <DialogDescription>You can play it right now</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Later</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (uploadedTrackId) {
                  playTrack(uploadedTrackId);
                }
                setIsSuccessDialogOpened(false);
              }}
            >
              Play
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {processing && (
        <div className="absolute inset-0 z-20 bg-bg-main/30  backdrop-blur-sm flex justify-center items-center flex-col">
          <Spinner variant="ellipsis" className="text-primary" size={64} />
          <h1 className="text-2xl mt-2">{processing}</h1>
        </div>
      )}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="flex gap-4">
            <div>
              <Label>Track cover</Label>
              <Dropzone
                className="mt-2 w-[300px] h-[300px]"
                accept={{ 'image/*': [] }}
                maxFiles={1}
                maxSize={1024 * 1024 * 10}
                minSize={1024}
                onDrop={(file) => {
                  handleDropCover(file[0]);
                }}
                src={cover ? [cover] : undefined}
                onError={console.error}
              >
                <DropzoneEmptyState />
                <DropzoneContent>
                  {coverPreview && (
                    <div className="h-full w-full">
                      <img
                        alt="Preview"
                        className="absolute top-0 left-0 h-full w-full object-cover"
                        src={coverPreview}
                      />
                    </div>
                  )}
                </DropzoneContent>
              </Dropzone>
            </div>
            <div className="flex-1">
              <Label className="mb-2">Featured artists</Label>
              <Combobox elements={[]} />
              <div className="mt-2 h-[256px] border overflow-auto rounded-md">
                {/* TODO: */}
                {/*<UserListItem userInfo={currentUser} />*/}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Label>Track audio file</Label>
            <Select onValueChange={(value) => setUploadType(value)} value={uploadType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local file</SelectItem>
                <SelectItem disabled={!isYtdlAvailable} value="ytdl">
                  YouTube URL
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 h-[180px]">
            {uploadType === 'local' && (
              <Dropzone
                className="block  w-full h-[180px]"
                accept={{ 'audio/mpeg': [] }}
                maxFiles={1}
                maxSize={1024 * 1024 * 100}
                minSize={1024}
                onDrop={(file) => {
                  setValue('track', file[0]);
                }}
                src={track ? [track] : undefined}
                onError={console.error}
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
            )}
            {uploadType === 'ytdl' && (
              <>
                <Input
                  onInput={(e) => setYoutubeUrl((e.target as HTMLInputElement).value)}
                  value={youtubeUrl}
                  placeholder="YouTube URL"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleDownloadYtdl}>
                    <Download />
                    Download
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex-1">
          <Input {...register('name', { required: true })} label="Track title" className="mb-4" />
          <Textarea {...register('lyrics')} label="Lyrics" className="h-[435px]" />
        </div>
      </div>
      <Track number={1} track={currentTrack} />
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit(handleFormSubmit)}>Upload</Button>
      </div>
    </div>
  );
};
type UploadTrackForm = {
  name: string;
  lyrics: string;
  cover: File;
  track: File;
};
