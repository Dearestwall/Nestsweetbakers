'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Cake } from '@/lib/types';

interface CartItem extends Cake {
  quantity: number;
  customization?: string;
  flavor: string; // Required field
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  totalPrice: number;
  isHydrated: boolean;
  addToCart: (item: Cake, quantity?: number, customization?: string, flavor?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('nestsweetsCart');
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize cart from localStorage after mount
  useEffect(() => {
    setCart(readCartFromStorage());
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('nestsweetsCart', JSON.stringify(cart));
      } catch {
        // ignore
      }
    }
  }, [cart, isHydrated]);

  const addToCart = (item: Cake, quantity = 1, customization?: string, flavor?: string) => {
    setCart(prev => {
      const found = prev.find(p => p.id === item.id && p.customization === customization);
      if (found) {
        return prev.map(p =>
          p.id === item.id && p.customization === customization
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }
      
      // Create proper CartItem with required flavor field
      const newCartItem: CartItem = {
        ...item,
        quantity,
        customization,
        flavor: flavor || item.flavors?.[0] || 'Default', // Ensure flavor is always present
      };
      
      return [...prev, newCartItem];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((t, i) => t + i.basePrice * i.quantity, 0), [cart]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartCount, 
      totalPrice, 
      isHydrated,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
