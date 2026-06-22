export type UserRole = string;

export interface AuthUser {
    token: string;
    userId: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    permission: string[];
}

export interface CurrentUser {
    _id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    roles: UserRole[];
    isEmailVerified: boolean;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'ARCHIVE';
}

export interface ApiSuccess<T> {
    success: true;
    message: string;
    data?: T;
    redirect?: boolean;
    url?: string;
}

export interface ApiError {
    success: false;
    message: string;
    statusCode?: number;
}

export interface LoginResponse {
    success: true;
    redirect: boolean;
    message: string;
    url: string;
    user: AuthUser;
}

export interface RegisterResponse {
    success: true;
    message: string;
    data: {
        email: string;
        verificationExpiresAt: string;
        redirectUrl: string;
    };
}

export interface ForgotPasswordResponse {
    success: true;
    message: string;
}

export interface ResetPasswordResponse {
    success: true;
    message: string;
}

export interface ConfirmVerificationResponse {
    success: true;
    redirect: boolean;
    message: string;
    url: string;
    user: AuthUser;
}

export interface ResendVerificationResponse {
    success: true;
    message: string;
    data: {
        verificationExpiresAt: string;
    };
}

export interface RegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export interface LoginForm {
    email: string;
    password: string;
}

export interface ResetPasswordForm {
    password: string;
    confirmPassword: string;
}

export interface ConfirmVerificationForm {
    email: string;
    verificationcode: string;
}

export interface AuthContextType {
    user: CurrentUser | null;
    token: string | null;
    login: (data: LoginForm) => Promise<void>;
    register: (data: RegisterForm) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}
