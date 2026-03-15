export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface Unit {
  id: number;
  name: string;
  label: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  itemId: number;
  type: "in" | "out";
  quantity: number;
  memo: string | null;
  createdBy: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardResponse {
  totalItems: number;
  totalValue: number;
  lowStockItems: Item[];
  recentTransactions: (Transaction & { itemName: string })[];
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
