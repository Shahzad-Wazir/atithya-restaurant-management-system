import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
              toast.type === "error"
                ? "bg-red-950 text-red-100 border-red-800"
                : toast.type === "info"
                ? "bg-obsidian text-amber-100 border-amber-500/40"
                : "bg-obsidian text-white border-primary/50"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                toast.type === "error"
                  ? "bg-red-400"
                  : toast.type === "info"
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
            />
            <span className="leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
