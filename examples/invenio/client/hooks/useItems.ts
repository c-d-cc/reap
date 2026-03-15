import { useState, useCallback } from "react";
import { apiFetch } from "../api";
import type {
  Item,
  ItemListResponse,
  DashboardResponse,
  Unit,
  Category,
  Transaction,
} from "../../shared/types";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(
    async (p: number = 1, query?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: String(limit) });
        if (query) params.set("q", query);
        const data = await apiFetch<ItemListResponse>(`/items?${params}`);
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const createItem = useCallback(
    async (item: { name: string; sku: string; category: string; unit: string; unitPrice: number }) => {
      const data = await apiFetch<Item>("/items", {
        method: "POST",
        body: JSON.stringify(item),
      });
      return data;
    },
    []
  );

  const updateItem = useCallback(
    async (id: number, item: Partial<{ name: string; sku: string; category: string; unit: string; unitPrice: number }>) => {
      const data = await apiFetch<Item>(`/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(item),
      });
      return data;
    },
    []
  );

  const deleteItem = useCallback(async (id: number) => {
    await apiFetch<{ success: boolean }>(`/items/${id}`, {
      method: "DELETE",
    });
  }, []);

  return {
    items,
    total,
    page,
    limit,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<DashboardResponse>("/dashboard");
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetchDashboard };
}

export function useMasters() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMasters = useCallback(async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([
        apiFetch<Unit[]>("/units"),
        apiFetch<Category[]>("/categories"),
      ]);
      setUnits(u);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUnit = useCallback(async (unit: { name: string; label: string }) => {
    const data = await apiFetch<Unit>("/units", {
      method: "POST",
      body: JSON.stringify(unit),
    });
    return data;
  }, []);

  const deleteUnit = useCallback(async (id: number) => {
    await apiFetch<{ success: boolean }>(`/units/${id}`, {
      method: "DELETE",
    });
  }, []);

  const createCategory = useCallback(async (category: { name: string }) => {
    const data = await apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    return data;
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await apiFetch<{ success: boolean }>(`/categories/${id}`, {
      method: "DELETE",
    });
  }, []);

  return {
    units,
    categories,
    loading,
    fetchMasters,
    createUnit,
    deleteUnit,
    createCategory,
    deleteCategory,
  };
}

export function useTransactions(itemId: number | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (itemId == null) return;
    setLoading(true);
    try {
      const data = await apiFetch<Transaction[]>(`/items/${itemId}/transactions`);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const createTransaction = useCallback(
    async (tx: { type: "in" | "out"; quantity: number; memo: string }) => {
      if (itemId == null) return;
      const data = await apiFetch<Transaction>(`/items/${itemId}/transactions`, {
        method: "POST",
        body: JSON.stringify(tx),
      });
      return data;
    },
    [itemId]
  );

  return { transactions, loading, fetchTransactions, createTransaction };
}
