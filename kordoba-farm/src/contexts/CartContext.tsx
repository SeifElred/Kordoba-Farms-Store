"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_KEY = "kordoba_cart";

export type CartLineItem = {
  id: string;
  occasion: string;
  product: string;
  specialCutId: string;
  specialCutLabel: string;
  slaughterDate: string;
  distribution: string;
  weightSelection: string;
  weightLabel?: string;
  videoProof: boolean;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  note: string;
  /** Cached for display; derived from product + weight when adding. */
  minPrice: number;
  maxPrice: number;
  productLabel: string;
};

type CartContextValue = {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, "id">) => string;
  updateItem: (id: string, item: Partial<CartLineItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemById: (id: string) => CartLineItem | undefined;
  /** @deprecated Use items.length; true if cart has at least one item. */
  cart: CartLineItem[] | null;
};

const CartContext = createContext<CartContextValue | null>(null);

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x: unknown): x is CartLineItem =>
        x != null &&
        typeof x === "object" &&
        typeof (x as CartLineItem).id === "string" &&
        typeof (x as CartLineItem).product === "string" &&
        typeof (x as CartLineItem).occasion === "string"
    );
  } catch {
    return [];
  }
}

function writeCart(items: CartLineItem[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const persist = useCallback((next: CartLineItem[]) => {
    setItems(next);
    writeCart(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartLineItem, "id">): string => {
      const id = generateId();
      const line: CartLineItem = { ...item, id };
      const next = [...items, line];
      persist(next);
      return id;
    },
    [items, persist]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<CartLineItem>) => {
      const next = items.map((x) => (x.id === id ? { ...x, ...patch } : x));
      persist(next);
    },
    [items, persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((x) => x.id !== id));
    },
    [items, persist]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const getItemById = useCallback(
    (id: string) => items.find((x) => x.id === id),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      getItemById,
      cart: items.length > 0 ? items : null,
    }),
    [items, addItem, updateItem, removeItem, clearCart, getItemById]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
