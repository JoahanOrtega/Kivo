import { Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { getMonthLabel } from "@/utils/date-options";

type MonthSelectorProps = {
    month: number;
    year: number;
    onPrevious: () => void;
    onNext: () => void;
};

export function MonthSelector({
    month,
    year,
    onPrevious,
    onNext,
}: MonthSelectorProps) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: spacing.lg,
            }}
        >
            <TouchableOpacity
                onPress={onPrevious}
                activeOpacity={0.8}
                style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 14,
                }}
            >
                <Text
                    style={{
                        color: colors.text,
                        fontSize: typography.bodyLg,
                        fontWeight: typography.weightSemibold,
                    }}
                >
                    ←
                </Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
                <Text
                    style={{
                        color: colors.text,
                        fontSize: typography.bodyLg,
                        fontWeight: typography.weightBold,
                    }}
                >
                    {getMonthLabel(month)}
                </Text>

                <Text
                    style={{
                        color: colors.textMuted,
                        fontSize: typography.bodySm,
                        marginTop: 2,
                    }}
                >
                    {year}
                </Text>
            </View>

            <TouchableOpacity
                onPress={onNext}
                activeOpacity={0.8}
                style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 14,
                }}
            >
                <Text
                    style={{
                        color: colors.text,
                        fontSize: typography.bodyLg,
                        fontWeight: typography.weightSemibold,
                    }}
                >
                    →
                </Text>
            </TouchableOpacity>
        </View>
    );
}