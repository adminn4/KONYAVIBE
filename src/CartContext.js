import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Sepete Ekle
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Her eklenen ürüne benzersiz bir ID ekledim.
      const uniqueItem = { ...item, uniqueId: Date.now().toString() + Math.random().toString() };
      return [uniqueItem, ...prevCart];
    });
  };

  // Sepetten Çıkar
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.uniqueId !== id));
  };

  // Sepeti Temizle
  const clearCart = () => {
    setCart([]);
  };

  // Toplam Tutar
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);