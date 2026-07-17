import { api } from "./api";

interface LogoutPayloadDTO {
   refreshToken: string
}

export async function logoutApi(payload: LogoutPayloadDTO) {
  await api.post('/auth/logout', payload);
}