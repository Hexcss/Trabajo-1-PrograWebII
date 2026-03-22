import type { SuccessResponse, UploadFileResponse } from '@trabajo/types';
import { apiClient } from './http-client';

export const filesService = {
  upload(file: File, folder?: string) {
    const payload = new FormData();
    payload.append('file', file);
    if (folder?.trim()) {
      payload.append('folder', folder.trim());
    }
    return apiClient.post<UploadFileResponse, FormData>('/files/upload', payload);
  },
  remove(url: string) {
    return apiClient.delete<SuccessResponse>('/files', { query: { url } });
  },
};
