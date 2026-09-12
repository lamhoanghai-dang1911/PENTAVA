export type RegisterRequestDTO = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequestDTO = {
  email: string;
  password: string;
};

export type VerifyOtpRequestDTO = {
  email: string;
  otpCode: string;
};

export type GoogleLoginRequestDTO = {
  idToken: string;
};
