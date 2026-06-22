interface ApiErrorResponse {
    response?: {
        status: number
        data: { message?: string; errors?: Record<string, unknown> }
    }
}

export const handleAuthError = (error: ApiErrorResponse): AuthError => {
    if (!error.response) {
        return { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR' }
    }

    const { status, data } = error.response

    switch (status) {
        case 400:
            return { message: data.message ?? 'Invalid request. Please check your input.', code: 'BAD_REQUEST' }
        case 401:
            return { message: data.message ?? 'Invalid credentials. Please try again.', code: 'UNAUTHORIZED' }
        case 403:
            return { message: data.message ?? 'Access denied. Insufficient permissions.', code: 'FORBIDDEN' }
        case 404:
            return { message: data.message ?? 'Resource not found.', code: 'NOT_FOUND' }
        case 422:
            return { message: data.message ?? 'Validation error.', code: 'VALIDATION_ERROR', errors: data.errors ?? {} }
        case 429:
            return { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' }
        case 500:
        case 502:
        case 503:
            return { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' }
        default:
            return { message: data.message ?? 'An unexpected error occurred.', code: 'UNKNOWN_ERROR' }
    }
}
