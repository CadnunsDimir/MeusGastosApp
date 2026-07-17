import { api } from './api';
import type { ProfileDTO, UpdateProfileDTO } from '../types/profile';

export async function getProfile(): Promise<ProfileDTO> {
  const { data } = await api.get('/profile');
  return data;
}

export async function updateProfile(profile: UpdateProfileDTO): Promise<ProfileDTO> {
  const { data } = await api.put('/profile', profile);
  return data;
}
