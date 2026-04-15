import { Pressable, Text, ViewStyle } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * Botón reutilizable base del proyecto.
 * Permite mantener consistencia visual y evitar estilos duplicados.
 */
export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: AppButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  const backgroundColor = isPrimary
    ? colors.primary
    : isSecondary
      ? colors.surface
      : "transparent";

  const borderColor = isPrimary ? colors.primary : colors.border;
  const textColor = isPrimary ? colors.white : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor,
        borderWidth: variant === "ghost" ? 0 : 1,
        borderColor,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: radius.lg,
        opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        ...style,
      })}
    >
      <Text
        style={{
          color: textColor,
          textAlign: "center",
          fontSize: typography.bodyLg,
          fontWeight: typography.weightSemibold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}