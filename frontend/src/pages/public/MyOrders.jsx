import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, cancelMyOrder } from "../../services/orderService";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import AtithyaLogo from "../../components/AtithyaLogo";
import Loading from "../../components/Loading";

const STEPS = ["Pending", "Confirmed", "Preparing", "Ready", "Delivered"];

const STATUS_BADGE = {
  Pending: "bg-[#FBF3E2] text-warning",
  Confirmed: "bg-ivory text-brown border border-gold/40",
  Preparing: "bg-primary-soft text-primary-dark",
  Ready: "bg-espresso text-gold",
  "Out for Delivery": "bg-espresso text-gold",
  Served: "bg-forest-soft text-forest",
  Delivered: "bg-forest-soft text-forest",
  Cancelled: "bg-[#FCECEB] text-danger",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const { addItem, setIsOpen } = useCart();
  const { addToast } = useToast();

  const fetchOrders = () => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    const onFocus = () => fetchOrders();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelMyOrder(orderId, "Cancelled by customer");
      addToast("Order cancelled", "info");
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || "Cannot cancel order", "error");
    }
  };

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addItem(
        {
          _id: item.menuItem,
          name: item.name,
          price: item.price,
          image: item.image,
          dietary: item.dietary,
        },
        item.quantity
      );
    });
    addToast("Items added to your basket!");
    setIsOpen(true);
  };

  if (loading) return <Loading text="Loading your Atithya orders..." />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 no-print">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">Order Tracking</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brown mt-1">My Orders</h1>
        </div>
        <Link
          to="/menu"
          className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
        >
          + Order More Food
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7DFD3]">
          <p className="text-lg font-semibold text-brown">No orders yet</p>
          <p className="text-sm text-brown/60 mt-1">
            Explore our menu and place your first order at Atithya.
          </p>
          <Link
            to="/menu"
            className="inline-block mt-5 px-6 py-2.5 rounded-full bg-espresso text-gold text-sm font-semibold"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-6 no-print">
          {orders.map((order) => {
            const currentStepIdx =
              order.status === "Served" || order.status === "Delivered"
                ? 4
                : order.status === "Out for Delivery"
                ? 3
                : STEPS.indexOf(order.status);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-[#E7DFD3] shadow-2xs space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFE8DC]">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-brown text-base">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          STATUS_BADGE[order.status] || "bg-ivory text-brown"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-ivory text-brown/75 text-xs font-medium">
                        {order.orderType} {order.tableNumber && `· ${order.tableNumber}`}
                      </span>
                    </div>
                    <p className="text-xs text-brown/55 mt-1">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · Payment: {order.paymentMethod} ({order.paymentStatus})
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-brown/55">Total Amount</p>
                    <p className="text-xl font-bold text-forest">₹{order.totalAmount}</p>
                  </div>
                </div>

                {order.status !== "Cancelled" && (
                  <div className="grid grid-cols-5 gap-2">
                    {STEPS.map((step, idx) => {
                      const active = idx <= currentStepIdx;
                      return (
                        <div key={step} className="text-center">
                          <div
                            className={`h-1.5 rounded-full mb-1.5 transition-all ${
                              active ? "bg-primary" : "bg-[#E7DFD3]"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-medium ${
                              active ? "text-brown font-semibold" : "text-brown/45"
                            }`}
                          >
                            {step === "Delivered" && order.orderType === "Dine-In" ? "Served" : step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-brown/85">
                      <span>
                        <strong>{item.quantity}×</strong> {item.name}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EFE8DC]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="px-4 py-2 rounded-xl border border-[#DFD5C5] text-xs font-semibold text-brown hover:border-gold"
                    >
                      🧾 View / Download PDF Invoice
                    </button>
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 rounded-xl bg-ivory text-primary-dark text-xs font-semibold hover:bg-primary hover:text-white transition"
                    >
                      ↻ Reorder
                    </button>
                  </div>

                  {["Pending", "Confirmed"].includes(order.status) && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="text-xs font-semibold text-danger hover:underline"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable GST Tax Invoice Modal with Full Dynamic Charge Breakdown */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-espresso/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-5 border-b border-[#E7DFD3]">
              <div>
                <AtithyaLogo size="sm" theme="light" />
                <p className="text-[11px] text-brown/65 mt-2">
                  {invoiceOrder.invoiceMeta?.legalName || "Atithya Hospitality Pvt. Ltd."}
                </p>
                <p className="text-[10px] text-brown/55">
                  {invoiceOrder.invoiceMeta?.address || "24 Park Mansion, Park Street, Kolkata"}
                </p>
                {invoiceOrder.invoiceMeta?.gstin && (
                  <p className="text-[10px] font-mono text-brown/75 mt-0.5">
                    GSTIN: {invoiceOrder.invoiceMeta.gstin}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-brown/70">
                <p className="font-bold text-brown">TAX INVOICE</p>
                <p className="font-mono mt-0.5">{invoiceOrder.orderNumber}</p>
                <p>{new Date(invoiceOrder.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            <div className="py-4 text-xs text-brown/75 space-y-1 border-b border-[#EFE8DC]">
              <p><strong>Guest:</strong> {invoiceOrder.customerName} ({invoiceOrder.customerPhone})</p>
              <p><strong>Type:</strong> {invoiceOrder.orderType} {invoiceOrder.tableNumber && `(Table ${invoiceOrder.tableNumber})`}</p>
              <p><strong>Payment:</strong> {invoiceOrder.paymentMethod} · {invoiceOrder.paymentStatus} · Ref: {invoiceOrder.transactionId}</p>
            </div>

            <table className="w-full text-xs my-4">
              <thead>
                <tr className="text-left text-brown/55 border-b border-[#E7DFD3]">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {invoiceOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-medium text-brown">{it.name}</td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right">₹{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-[#E7DFD3] pt-3 space-y-1.5 text-xs text-brown/80">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{invoiceOrder.subtotal}</span></div>
              {invoiceOrder.discount > 0 && (
                <div className="flex justify-between text-forest font-semibold">
                  <span>Discount ({invoiceOrder.couponCode})</span>
                  <span>−₹{invoiceOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST ({invoiceOrder.gstRate ?? 5}%)</span>
                <span>₹{invoiceOrder.tax}</span>
              </div>
              {invoiceOrder.deliveryFee > 0 && (
                <div className="flex justify-between"><span>Delivery Fee</span><span>₹{invoiceOrder.deliveryFee}</span></div>
              )}
              {invoiceOrder.packagingFee > 0 && (
                <div className="flex justify-between"><span>Packaging Fee</span><span>₹{invoiceOrder.packagingFee}</span></div>
              )}
              {invoiceOrder.convenienceFee > 0 && (
                <div className="flex justify-between"><span>Convenience Fee</span><span>₹{invoiceOrder.convenienceFee}</span></div>
              )}
              {invoiceOrder.serviceCharge > 0 && (
                <div className="flex justify-between"><span>Service Charge</span><span>₹{invoiceOrder.serviceCharge}</span></div>
              )}
              {(invoiceOrder.customCharges || []).map((c, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{c.name}</span>
                  <span>₹{c.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-brown pt-2 border-t border-[#E7DFD3]">
                <span>Grand Total</span>
                <span className="text-forest">₹{invoiceOrder.totalAmount}</span>
              </div>
            </div>

            <p className="text-center text-[11px] text-brown/50 mt-6 italic">
              Thank you for dining with Atithya — Atithi Devo Bhava.
            </p>

            <div className="flex gap-3 mt-6 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-espresso text-gold text-xs font-semibold hover:bg-primary hover:text-white transition"
              >
                Print / Save PDF Invoice
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-[#DFD5C5] text-xs font-semibold text-brown"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
