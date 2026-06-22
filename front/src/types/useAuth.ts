export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    lastName: string;
    username: string;
    password: string;
    firstName: string;
    confirmPassword: string;
    acceptTerms: boolean;
};

export type VerifyPayload = {
    email: string;
    code: string;
};

export type ResetPasswordPayload = {
    token: string;
    password: string;
};

export type ApiError = {
    message?: string;
};

export type User = {
    id: string;
    email: string;
    avatar: string;
    firstName: string;
    name?: string;
    permission: string[];
};

export type AuthResponse = {
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
        token: string;
        permission: string[];
    };
};
