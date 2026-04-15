import * as SecureStore from "expo-secure-store";

import type { AuthSession } from "@/types/auth";

/**
 * Llave única usada para persistir la sesión del usuario.
 * Centralizarla evita inconsistencias entre lectura y escritura.
 */
const SESSION_KEY = "kivo.auth.session";

/**
 * Guarda la sesión serializada en almacenamiento seguro del dispositivo.
 */
export async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

/**
 * Recupera la sesión almacenada.
 * Regresa null si no existe, si está vacía o si no se puede parsear.
 */
export async function getSession(): Promise<AuthSession | null> {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Elimina la sesión del almacenamiento seguro.
 */
export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}