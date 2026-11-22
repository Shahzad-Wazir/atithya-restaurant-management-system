import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem("atithya_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("atithya_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem, quantity = 1, notes = "") => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i._id === menuItem._id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
          notes: notes || updated[idx].notes,
        };
        return updated;
      }
      return [
        ...prev,
        {
          _id: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image?.url || menuItem.image || "",
          dietary: menuItem.dietary || "Veg",
          prepTime: menuItem.prepTime || 15,
          quantity,
          notes,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateNotes = (id, notes) => {
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, notes } : item))
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => setItems([]);

  const summary = useMemo(() => {
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return { itemCount, subtotal };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        updateNotes,
        removeItem,
        clearCart,
        ...summary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
