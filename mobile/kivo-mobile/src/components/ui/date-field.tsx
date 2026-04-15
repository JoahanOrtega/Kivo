import { useMemo, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";

type DateFieldProps = {
    label: string;
    value: string;
    onChange: (isoDate: string) => void;
    error?: string;
};

function formatIsoToDisplay(isoDate: string): string {
    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}/${month}/${year}`;
}

export function DateField({
    label,
    value,
    onChange,
    error,
}: DateFieldProps) {
    const [showPicker, setShowPicker] = useState(false);

    const selectedDate = useMemo(() => {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }, [value]);

    const handleChange = (
        event: DateTimePickerEvent,
        selected?: Date
    ) => {
        if (Platform.OS !== "ios") {
            setShowPicker(false);
        }

        if (event.type === "dismissed") {
            return;
        }

        if (selected) {
            onChange(selected.toISOString());
        }
    };

    return (
        <View style={{ marginBottom: 16 }}>
            <Text
                style={{
                    fontSize: typography.bodySm,
                    fontWeight: typography.weightSemibold,
                    color: colors.text,
                    marginBottom: 8,
                }}
            >
                {label}
            </Text>

            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowPicker(true)}
                style={{
                    borderWidth: 1,
                    borderColor: error ? colors.danger : colors.border,
                    borderRadius: radius.lg,
                    paddingHorizontal: 14,
                    paddingVertical: 15,
                    backgroundColor: colors.white,
                }}
            >
                <Text
                    style={{
                        fontSize: typography.bodyLg,
                        color: colors.text,
                    }}
                >
                    {formatIsoToDisplay(value)}
                </Text>
            </TouchableOpacity>

            {showPicker ? (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleChange}
                />
            ) : null}

            {error ? (
                <Text
                    style={{
                        marginTop: 6,
                        fontSize: typography.caption,
                        color: colors.danger,
                    }}
                >
                    {error}
                </Text>
            ) : null}
        </View>
    );
}