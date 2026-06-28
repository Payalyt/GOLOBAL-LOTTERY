import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Ticket {
  id: number;
  numbers: number[];
  price: number;
  gameName: string;
  isFavorite: boolean;
}

interface CartContextType {
  tickets: Ticket[];
  addTickets: (tickets: Ticket[]) => void;
  removeTicket: (id: number) => void;
  toggleFavorite: (id: number) => void;
  updateTicket: (id: number, numbers: number[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const addTickets = (newTickets: Ticket[]) => {
    setTickets((prev) => [...prev, ...newTickets.map(t => ({...t, isFavorite: false}))]);
  };

  const removeTicket = (id: number) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setTickets((prev) => prev.map((t) => t.id === id ? {...t, isFavorite: !t.isFavorite} : t));
  };

  const updateTicket = (id: number, numbers: number[]) => {
    setTickets((prev) => prev.map((t) => t.id === id ? {...t, numbers} : t));
  };

  const clearCart = () => {
    setTickets([]);
  };

  return (
    <CartContext.Provider value={{ tickets, addTickets, removeTicket, toggleFavorite, updateTicket, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
