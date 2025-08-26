export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
