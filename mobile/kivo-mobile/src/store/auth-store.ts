import { create } from "zustand";

import { clearSession, getSession, saveSession } from "@/services/secure-session";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthState = {
    isAuthenticated: boolean;
    isHydrated: boolean;
    session: AuthSession | null;
    hydrateSession: () => Promise<void>;
    login: (payload: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    isHydrated: false,
    session: null,

    /**
     * Carga la sesión persistida al iniciar la app.
     * Esto permite restaurar el estado autenticado tras cerrar y abrir la aplicación.
     */
    hydrateSession: async () => {
        try {
            const storedSession = await getSession();

            set({
                session: storedSession,
                isAuthenticated: Boolean(storedSession),
                isHydrated: true,
            });
        } catch (error) {
            console.error("Error hydrating session:", error);

            set({
                session: null,
                isAuthenticated: false,
                isHydrated: true,
            });
        }
    },

    /**
     * Inicio de sesión temporal del MVP.
     * Simula una autenticación exitosa y persiste la sesión localmente.
     * Más adelante reemplazaremos esto por el login real contra backend.
     */
    login: async ({ email }: { email: string; password: string }) => {
        const normalizedEmail = email.trim().toLowerCase();

        const mockUser: AuthUser = {
            id: "local-user-1",
            name: "Johan",
            email: normalizedEmail,
        };

        const mockSession: AuthSession = {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: mockUser,
        };

        await saveSession(mockSession);

        set({
            session: mockSession,
            isAuthenticated: true,
        });
    },

    /**
     * Cierra la sesión en memoria y elimina la sesión persistida del dispositivo.
     */
    logout: async () => {
        await clearSession();

        set({
            session: null,
            isAuthenticated: false,
        });
    },
}));