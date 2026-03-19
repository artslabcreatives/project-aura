import { api } from '@/lib/api';

export interface SetupTwoFactorResponse {
    secret: string;
    qr_code_url: string;
}

export interface ConfirmTwoFactorResponse {
    message: string;
    recovery_codes: string[];
}

export interface RecoveryCodesResponse {
    recovery_codes: string[];
}

export const twoFactorService = {
    enable: async () => {
        return api.post<SetupTwoFactorResponse>('/two-factor/enable', {});
    },

    confirm: async (code: string) => {
        return api.post<ConfirmTwoFactorResponse>('/two-factor/confirm', { code });
    },

    disable: async (password: string) => {
        return api.post<{ message: string }>('/two-factor/disable', { password });
    },

    getRecoveryCodes: async (password: string) => {
        return api.post<RecoveryCodesResponse>('/two-factor/recovery-codes', { password });
    },

    regenerateRecoveryCodes: async (password: string) => {
        return api.post<RecoveryCodesResponse>('/two-factor/recovery-codes/regenerate', { password });
    },
};
