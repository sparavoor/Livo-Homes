'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './auth-context';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const isInitialMount = useRef(true);
  const prevUserRef = useRef(user);

  // Determine storage key
  const storageKey = user ? `livo_cart_${user.id}` : 'livo_cart_guest';

  // Load cart whenever storageKey changes
  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey);
    const guestCart = localStorage.getItem('livo_cart_guest');

    if (user && guestCart && guestCart !== '[]') {
      // Merge guest cart into user cart on login
      try {
        const guestItems = JSON.parse(guestCart);
        const userItems = savedCart ? JSON.parse(savedCart) : [];
        
        // Simple merge: add guest items to user items, merging duplicates
        const mergedItems = [...userItems];
        guestItems.forEach((gItem: CartItem) => {
          const existing = mergedItems.find(uItem => uItem.id === gItem.id);
          if (existing) {
            existing.quantity += gItem.quantity;
          } else {
            mergedItems.push(gItem);
          }
        });
        
        setItems(mergedItems);
        localStorage.removeItem('livo_cart_guest');
        return;
      } catch (e) {
        console.error('Failed to merge guest cart', e);
      }
    }

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [storageKey, user]);

  // Handle logout: clear cart items when user logs out
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setItems([]);
      localStorage.removeItem('livo_cart_guest'); // Also clear guest cart for a fresh start
    }
    prevUserRef.current = user;
  }, [user]);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
