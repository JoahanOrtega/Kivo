import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FormScreenContainer } from "@/components/layout/form-screen-container";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { getCategoriesByType, getPaymentMethods } from "@/features/transactions/transaction-catalogs.service";
import { transactionSchema, type TransactionFormValues } from "@/features/transactions/transaction.schemas";
import { createTransaction } from "@/features/transactions/transactions.service";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";
import type { Category, PaymentMethod } from "@/types/catalogs";

export default function AddTransactionScreen() {
  const session = useAuthStore((state) => state.session);

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      categoryId: "",
      paymentMethodId: "",
      concept: "",
      note: "",
    },
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setIsLoadingCatalogs(true);

        const [loadedCategories, loadedPaymentMethods] = await Promise.all([
          getCategoriesByType(selectedType),
          getPaymentMethods(),
        ]);

        setCategories(loadedCategories);
        setPaymentMethods(loadedPaymentMethods);

        setValue("categoryId", loadedCategories[0]?.id ?? "");
        setValue("paymentMethodId", loadedPaymentMethods[0]?.id ?? "");
      } finally {
        setIsLoadingCatalogs(false);
      }
    };

    void loadCatalogs();
  }, [selectedType, setValue]);

  const onSubmit = async (values: TransactionFormValues) => {
    if (!session?.user.id) {
      return;
    }

    Keyboard.dismiss();

    await createTransaction({
      userId: session.user.id,
      type: values.type,
      amount: Number(values.amount),
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      concept: values.concept?.trim() || null,
      note: values.note?.trim() || null,
      transactionDate: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <FormScreenContainer>
      <View style={{ flex: 1, justifyContent: "center", paddingVertical: 12 }}>
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Nuevo movimiento
          </Text>

          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: colors.textMuted,
            }}
          >
            Registra un ingreso o egreso en tu base local.
          </Text>
        </View>

        {isLoadingCatalogs ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              padding: 18,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Tipo
            </Text>

            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={() => onChange("expense")}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        value === "expense" ? colors.primary : colors.border,
                      backgroundColor:
                        value === "expense" ? colors.primary : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: value === "expense" ? "#FFFFFF" : colors.text,
                        fontWeight: "600",
                      }}
                    >
                      Egreso
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onChange("income")}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        value === "income" ? colors.primary : colors.border,
                      backgroundColor:
                        value === "income" ? colors.primary : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: value === "income" ? "#FFFFFF" : colors.text,
                        fontWeight: "600",
                      }}
                    >
                      Ingreso
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <Controller
              control={control}
              name="amount"
              render={({ field: { value, onChange } }) => (
                <AppInput
                  label="Monto"
                  value={value}
                  onChangeText={onChange}
                  placeholder="0.00"
                  keyboardType="numeric"
                  error={errors.amount?.message}
                />
              )}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Categoría
            </Text>

            <Controller
              control={control}
              name="categoryId"
              render={({ field: { value, onChange } }) => (
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => onChange(category.id)}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          value === category.id ? colors.primary : colors.border,
                        backgroundColor:
                          value === category.id ? colors.primary : "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          color: value === category.id ? "#FFFFFF" : colors.text,
                          fontWeight: "600",
                        }}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            {errors.categoryId?.message ? (
              <Text
                style={{
                  marginTop: -8,
                  marginBottom: 16,
                  fontSize: 13,
                  color: colors.danger,
                }}
              >
                {errors.categoryId.message}
              </Text>
            ) : null}

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Método de pago
            </Text>

            <Controller
              control={control}
              name="paymentMethodId"
              render={({ field: { value, onChange } }) => (
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => onChange(method.id)}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          value === method.id ? colors.primary : colors.border,
                        backgroundColor:
                          value === method.id ? colors.primary : "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          color: value === method.id ? "#FFFFFF" : colors.text,
                          fontWeight: "600",
                        }}
                      >
                        {method.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            {errors.paymentMethodId?.message ? (
              <Text
                style={{
                  marginTop: -8,
                  marginBottom: 16,
                  fontSize: 13,
                  color: colors.danger,
                }}
              >
                {errors.paymentMethodId.message}
              </Text>
            ) : null}

            <Controller
              control={control}
              name="concept"
              render={({ field: { value, onChange } }) => (
                <AppInput
                  label="Concepto"
                  value={value ?? ""}
                  onChangeText={onChange}
                  placeholder="Ej. DiDi, Nómina, Apple bill"
                />
              )}
            />

            <Controller
              control={control}
              name="note"
              render={({ field: { value, onChange } }) => (
                <AppInput
                  label="Nota"
                  value={value ?? ""}
                  onChangeText={onChange}
                  placeholder="Opcional"
                />
              )}
            />

            <AppButton
              label={isSubmitting ? "Guardando..." : "Guardar movimiento"}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </View>
    </FormScreenContainer>
  );
}