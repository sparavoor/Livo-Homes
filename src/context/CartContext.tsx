'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase';

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
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);
  const prevUserRef = useRef(user);

  // Determine storage key
  const storageKey = user ? `livo_cart_${user.id}` : 'livo_cart_guest';

  // Load cart from DB for logged in users
  const loadCartFromDb = async (userId: string) => {
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (!cartItems || cartItems.length === 0) return [];

      // Fetch product details for these items
      const productIds = cartItems.map((ci: any) => ci.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Map back to CartItem format
      return cartItems.map((ci: any) => {
        const product = products?.find((p: any) => p.id === ci.product_id);
        return {
          id: ci.product_id,
          name: product?.name || 'Unknown Product',
          price: Number(product?.price) || 0,
          image: product?.image || '',
          description: product?.description || '',
          quantity: ci.quantity
        };
      });
    } catch (e) {
      console.error('Failed to load cart from DB:', e);
      return [];
    }
  };

  // Sync cart to DB
  const syncCartToDb = async (userId: string, currentItems: CartItem[]) => {
    try {
      // Simplest approach: Delete all and re-insert
      // In a production app, upserting or delta-syncing is better
      await supabase.from('cart_items').delete().eq('user_id', userId);
      
      if (currentItems.length > 0) {
        const toInsert = currentItems.map(item => ({
          user_id: userId,
          product_id: item.id,
          quantity: item.quantity
        }));
        await supabase.from('cart_items').insert(toInsert);
      }
    } catch (e) {
      console.error('Failed to sync cart to DB:', e);
    }
  };

  // Load cart whenever storageKey changes
  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      const guestCart = localStorage.getItem('livo_cart_guest');
      let initialItems: CartItem[] = [];

      if (user) {
        // Logged in: Try to load from DB first
        const dbItems = await loadCartFromDb(user.id);
        initialItems = dbItems;

        // If guest cart exists, merge it
        if (guestCart && guestCart !== '[]') {
          try {
            const guestItems = JSON.parse(guestCart);
            const merged = [...initialItems];
            
            guestItems.forEach((gItem: CartItem) => {
              const existing = merged.find(uItem => uItem.id === gItem.id);
              if (existing) {
                existing.quantity += gItem.quantity;
              } else {
                merged.push(gItem);
              }
            });
            
            initialItems = merged;
            // Sync merged cart back to DB
            await syncCartToDb(user.id, initialItems);
            localStorage.removeItem('livo_cart_guest');
          } catch (e) {
            console.error('Failed to merge guest cart', e);
          }
        }
      } else {
        // Guest: Load from localStorage
        if (guestCart) {
          try {
            initialItems = JSON.parse(guestCart);
          } catch (e) {
            console.error('Failed to parse guest cart', e);
          }
        }
      }

      setItems(initialItems);
      setLoading(false);
    };

    initCart();
  }, [user]);

  // Handle logout: clear cart items when user logs out
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setItems([]);
    }
    prevUserRef.current = user;
  }, [user]);

  // Save cart to localStorage and DB on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(items));

    // Save to DB if logged in
    if (user && !loading) {
      syncCartToDb(user.id, items);
    }
  }, [items, storageKey, user, loading]);

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
        loading,
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
