import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    message: "Selecciona el tipo de movimiento",
  }),
  amount: z
    .string()
    .min(1, "Ingresa un monto")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: "Ingresa un monto válido",
    }),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  paymentMethodId: z.string().min(1, "Selecciona un método de pago"),
  concept: z.string().optional(),
  note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;