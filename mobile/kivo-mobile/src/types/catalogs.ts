export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  isActive: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  type: string | null;
  isDefault: boolean;
  isActive: boolean;
};