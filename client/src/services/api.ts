import { VideoItem, LibraryStatus, SystemResponse } from '../types';

export interface VideosApiResponse {
  success: boolean;
  status: LibraryStatus;
  videos: VideoItem[];
  error?: string;
}

export async function fetchVideos(): Promise<VideosApiResponse> {
  const response = await fetch('/api/videos');
  if (!response.ok) {
    throw new Error(`Ошибка загрузки списка видео: ${response.statusText}`);
  }
  return response.json();
}

export async function refreshVideos(): Promise<VideosApiResponse> {
  const response = await fetch('/api/videos/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Ошибка обновления библиотеки: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSystemInfo(): Promise<SystemResponse> {
  const response = await fetch('/api/system/info');
  if (!response.ok) {
    throw new Error(`Ошибка получения системной информации: ${response.statusText}`);
  }
  return response.json();
}
