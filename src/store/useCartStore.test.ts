import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: 1,
  title: 'Futuristic Mouse',
  description: 'Mouse with neon lights',
  price: 50,
  discountPercentage: 10,
  rating: 4.8,
  stock: 15,
  brand: 'Aetheria',
  category: 'electronics',
  thumbnail: 'mouse.png',
  images: [],
};

const mockProduct2: Product = {
  id: 2,
  title: 'Quantum Keyboard',
  description: 'Mechanical quantum keyboard',
  price: 150,
  discountPercentage: 0,
  rating: 4.9,
  stock: 5,
  brand: 'Aetheria',
  category: 'electronics',
  thumbnail: 'keyboard.png',
  images: [],
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalQuantity).toBe(0);
    expect(state.totalAmount).toBe(0);
    expect(state.discountedTotal).toBe(0);
  });

  it('can add a new product to the cart', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    
    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].id).toBe(mockProduct.id);
    expect(state.items[0].quantity).toBe(1);
    expect(state.totalQuantity).toBe(1);
    expect(state.totalAmount).toBe(50);
    // 50 - 10% discount = 45
    expect(state.discountedTotal).toBe(45);
  });

  it('increments quantity when adding an existing product', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().addToCart(mockProduct, 2);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.totalQuantity).toBe(3);
    expect(state.totalAmount).toBe(150);
    expect(state.discountedTotal).toBe(135);
  });

  it('can update item quantity', () => {
    useCartStore.getState().addToCart(mockProduct, 2);
    useCartStore.getState().updateQuantity(mockProduct.id, 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalQuantity).toBe(5);
    expect(state.totalAmount).toBe(250);
    expect(state.discountedTotal).toBe(225);
  });

  it('removes item if quantity is set to 0 or less', () => {
    useCartStore.getState().addToCart(mockProduct, 2);
    useCartStore.getState().updateQuantity(mockProduct.id, 0);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(0);
    expect(state.totalQuantity).toBe(0);
  });

  it('can remove items from cart', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().addToCart(mockProduct2, 1);
    useCartStore.getState().removeFromCart(mockProduct.id);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].id).toBe(mockProduct2.id);
    expect(state.totalQuantity).toBe(1);
    expect(state.totalAmount).toBe(150);
    expect(state.discountedTotal).toBe(150);
  });

  it('can clear the entire cart', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalQuantity).toBe(0);
    expect(state.totalAmount).toBe(0);
    expect(state.discountedTotal).toBe(0);
  });

  it('caps the quantity added at the product stock limit', () => {
    // mockProduct has stock: 15
    useCartStore.getState().addToCart(mockProduct, 20);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(15);
    expect(state.totalQuantity).toBe(15);
  });

  it('caps the updated quantity at the item stock limit', () => {
    // mockProduct2 has stock: 5
    useCartStore.getState().addToCart(mockProduct2, 1);
    useCartStore.getState().updateQuantity(mockProduct2.id, 10);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
  });
});
