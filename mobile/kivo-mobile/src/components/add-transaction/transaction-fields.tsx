import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { View } from "react-native";

import { AppCard } from "@/components/ui/app-card";
import { AppInput } from "@/components/ui/app-input";
import { DateField } from "@/components/ui/date-field";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import type { TransactionFormValues } from "@/features/transactions/transaction.schemas";

// ─── Props ────────────────────────────────────────────────────────────────────
// Recibimos control y errors de react-hook-form directamente.
// Esto permite que los campos sigan conectados al formulario del padre
// sin necesidad de pasar cada valor y onChange individualmente.
interface TransactionFieldsProps {
    control: Control<TransactionFormValues>;
    errors: FieldErrors<TransactionFormValues>;
}

// ─── Componente ───────────────────────────────────────────────────────────────
// Agrupa los cuatro campos principales del formulario de transacción.
// Al recibir control directamente, cada Controller sigue registrado
// en el formulario del componente padre — la validación funciona igual.
export function TransactionFields({
    control,
    errors,
}: TransactionFieldsProps) {
    return (
        <AppCard style={{ marginBottom: spacing.lg }}>
            {/* ── Monto ── */}
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
                        // Fuente grande para el monto — es el dato más importante
                        inputStyle={{
                            fontSize: 28,
                            fontWeight: typography.weightBold,
                            paddingVertical: 18,
                        }}
                    />
                )}
            />

            {/* ── Fecha ── */}
            {/* Resuelve el problema #4 — DateField maneja internamente
                la conversión entre Date y string "YYYY-MM-DD" */}
            <Controller
                control={control}
                name="transactionDate"
                render={({ field: { value, onChange } }) => (
                    <DateField
                        label="Fecha"
                        value={value}
                        onChange={onChange}
                        error={errors.transactionDate?.message}
                    />
                )}
            />

            {/* ── Concepto ── */}
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

            {/* ── Nota ── */}
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
        </AppCard>
    );
}