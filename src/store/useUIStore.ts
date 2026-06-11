import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isFilterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  isFilterOpen: false,
  setFilterOpen: (open) => set({ isFilterOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: '',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetFilters: () => set({ searchQuery: '', selectedCategory: '' }),
}));
