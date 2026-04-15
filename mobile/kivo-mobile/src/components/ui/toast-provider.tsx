import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";

type ToastVariant = "success" | "error" | "info";

type ToastState = {
    visible: boolean;
    message: string;
    variant: ToastVariant;
};

type ToastContextValue = {
    showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Proveedor global de toasts.
 * Muestra mensajes breves y no bloqueantes para feedback del usuario.
 */
export function ToastProvider({ children }: PropsWithChildren) {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: "",
        variant: "info",
    });

    const translateY = useRef(new Animated.Value(-30)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -30,
                duration: 220,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setToast((prev) => ({
                ...prev,
                visible: false,
                message: "",
            }));
        });
    }, [opacity, translateY]);

    const showToast = useCallback(
        (message: string, variant: ToastVariant = "info") => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }

            setToast({
                visible: true,
                message,
                variant,
            });

            translateY.setValue(-30);
            opacity.setValue(0);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 240,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();

            hideTimeoutRef.current = setTimeout(() => {
                hideToast();
            }, 2400);
        },
        [hideToast, opacity, translateY]
    );

    const contextValue = useMemo(
        () => ({
            showToast,
        }),
        [showToast]
    );

    const backgroundColor =
        toast.variant === "success"
            ? colors.success
            : toast.variant === "error"
                ? colors.danger
                : colors.text;

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            {toast.visible ? (
                <View pointerEvents="none" style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.toast,
                            {
                                backgroundColor,
                                opacity,
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        <Text style={styles.toastText}>{toast.message}</Text>
                    </Animated.View>
                </View>
            ) : null}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }

    return context;
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 70,
        left: 16,
        right: 16,
        zIndex: 999,
    },
    toast: {
        borderRadius: radius.lg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
    },
    toastText: {
        color: colors.white,
        fontSize: typography.bodyMd,
        fontWeight: typography.weightSemibold,
    },
});