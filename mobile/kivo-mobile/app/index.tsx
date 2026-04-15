import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

/**
 * Ruta raíz de la app.
 * Decide si el usuario debe entrar al flujo público o privado
 * una vez que la sesión ya fue hidratada.
 */
export default function IndexScreen() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/home" : "/login"} />;
}