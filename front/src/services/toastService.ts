
import toast, { ToastOptions, ToasterProps } from 'react-hot-toast';

type ToastPosition = NonNullable<ToastOptions['position']>;

type ToastConfig = {
    enabled: boolean;
    position: ToastPosition;
    duration: number;
};

type PromiseMessages<T> = {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
};

let toastConfig: ToastConfig = {
    enabled: true,
    position: 'top-right',
    duration: 4000,
};

export const configureToast = (config: Partial<ToastConfig>) => {
    toastConfig = { ...toastConfig, ...config };
};

const isEnabled = () => toastConfig.enabled;

const getBaseOptions = (): ToastOptions => ({
    position: toastConfig.position,
    duration: toastConfig.duration,
    style: {
        minWidth: '320px',
        maxWidth: '440px',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        borderRadius: '16px',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96))',
        color: '#f8fafc',
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: 1.45,
        boxShadow: '0 18px 55px rgba(15, 23, 42, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(14px)',
    },
});

export const toasterOptions: ToasterProps = {
    position: toastConfig.position,
    gutter: 12,
    containerStyle: {
        top: 18,
        right: 18,
    },
    toastOptions: {
        ...getBaseOptions(),
        success: {
            iconTheme: {
                primary: '#22c55e',
                secondary: '#052e16',
            },
        },
        error: {
            duration: 5000,
            iconTheme: {
                primary: '#fb7185',
                secondary: '#450a0a',
            },
        },
    },
};

export const showToast = {
    success: (message: string, options: ToastOptions = {}) => {
        if (!isEnabled()) return null;

        return toast.success(message, {
            ...getBaseOptions(),
            iconTheme: {
                primary: '#22c55e',
                secondary: '#052e16',
            },
            ...options,
        });
    },

    error: (message: string, options: ToastOptions = {}) => {
        if (!isEnabled()) return null;

        return toast.error(message, {
            ...getBaseOptions(),
            duration: 5000,
            iconTheme: {
                primary: '#fb7185',
                secondary: '#450a0a',
            },
            ...options,
        });
    },

    info: (message: string, options: ToastOptions = {}) => {
        if (!isEnabled()) return null;

        return toast(message, {
            ...getBaseOptions(),
            icon: 'i',
            ...options,
        });
    },

    loading: (message: string, options: ToastOptions = {}) => {
        if (!isEnabled()) return null;

        return toast.loading(message, {
            ...getBaseOptions(),
            ...options,
        });
    },

    promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>, options: ToastOptions = {}) => {
        if (!isEnabled()) return promise;

        return toast.promise(
            promise,
            {
                loading: messages.loading || 'Yuklanmoqda...',
                success: messages.success || 'Muvaffaqiyatli bajarildi!',
                error: messages.error || 'Xatolik yuz berdi.',
            },
            {
                ...getBaseOptions(),
                ...options,
            }
        );
    },

    custom: (message: string, options: ToastOptions = {}) => {
        if (!isEnabled()) return null;

        return toast(message, {
            ...getBaseOptions(),
            ...options,
        });
    },

    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },

    remove: (toastId?: string) => {
        toast.remove(toastId);
    },
};

export default toast;
