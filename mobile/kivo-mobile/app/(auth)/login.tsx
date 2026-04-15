import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/layout/screen-container";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { BRAND } from "@/constants/brand";
import { LoginFormValues, loginSchema } from "@/features/auth/auth.schemas";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

/**
 * Pantalla de inicio de sesión del MVP.
 * Valida el formulario y persiste la sesión con Secure Store.
 */
export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
    router.replace("/(protected)");
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 34,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 8,
          }}
        >
          {BRAND.appName}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: 32,
          }}
        >
          {BRAND.tagline}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Correo"
              value={value}
              onChangeText={onChange}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Contraseña"
              value={value}
              onChangeText={onChange}
              placeholder="Tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password?.message}
            />
          )}
        />

        <AppButton
          label={isSubmitting ? "Entrando..." : "Entrar"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={{ marginTop: 8 }}
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{ marginTop: 16 }}
        >
          <Text
            style={{
              color: colors.textMuted,
              textAlign: "center",
              fontSize: 15,
            }}
          >
            Crear cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}