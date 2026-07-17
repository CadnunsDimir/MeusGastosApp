export interface ProfileDTO {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileDTO {
  email: string;
  firstName: string;
  lastName: string;
}
