import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createOrder } from "../../services/orderService";
import {
  getActiveCoupons,
  validateCoupon,
  getBillingConfig,
} from "../../services/operationsService";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("Delivery");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState(user?.savedAddresses?.[0]?.street || "");
  const [city, setCity] = useState(user?.savedAddresses?.[0]?.city || "Kolkata");
  const [pincode, setPincode] = useState(user?.savedAddresses?.[0]?.pincode || "");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [billing, setBilling] = useState({
    gstRate: 5,
    deliveryFee: 40,
    freeDeliveryAbove: 599,
    packagingFee: 0,
    convenienceFeeType: "flat",
    convenienceFeeValue: 0,
    dineInServiceChargePercent: 0,
    customCharges: [],
  });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    getActiveCoupons().then(setAvailableCoupons).catch(() => {});
    getBillingConfig()
      .then((cfg) => cfg && setBilling(cfg))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-serif font-bold text-brown">Your basket is empty</h2>
        <p className="text-brown/60 mt-2">Add delicious dishes from Atithya's menu before checking out.</p>
        <Link
          to="/menu"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  // Mirror server-side live Admin BillingConfig calculations
  const discount = appliedCoupon?.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const gstRate = Number(billing.gstRate) || 0;
  const tax = Math.round((taxable * gstRate) / 100);

  const deliveryFee =
    orderType === "Delivery"
      ? billing.freeDeliveryAbove > 0 && subtotal >= billing.freeDeliveryAbove
        ? 0
        : Number(billing.deliveryFee) || 0
      : 0;

  const packagingFee =
    orderType === "Delivery" || orderType === "Takeaway"
      ? Number(billing.packagingFee) || 0
      : 0;

  const convenienceFee =
    billing.convenienceFeeValue > 0
      ? billing.convenienceFeeType === "percentage"
        ? Math.round((taxable * billing.convenienceFeeValue) / 100)
        : Number(billing.convenienceFeeValue)
      : 0;

  const serviceCharge =
    orderType === "Dine-In" && billing.dineInServiceChargePercent > 0
      ? Math.round((taxable * billing.dineInServiceChargePercent) / 100)
      : 0;

  const activeCustomCharges = (billing.customCharges || [])
    .filter((c) => c.isActive && (c.applyTo === "All" || c.applyTo === orderType))
    .map((c) => ({
      name: c.name,
      amount:
        c.type === "percentage"
          ? Math.round((taxable * c.value) / 100)
          : Math.round(Number(c.value) || 0),
    }))
    .filter((c) => c.amount > 0);

  const customTotal = activeCustomCharges.reduce((a, c) => a + c.amount, 0);
  const grandTotal =
    taxable + tax + deliveryFee + packagingFee + convenienceFee + serviceCharge + customTotal;

  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) return;
    try {
      const res = await validateCoupon(code, subtotal);
      setAppliedCoupon(res);
      setCouponInput(res.code);
      addToast(`Coupon ${res.code} applied! You save ₹${res.discount}`);
    } catch (err) {
      setAppliedCoupon(null);
      addToast(err.response?.data?.message || "Invalid coupon code", "error");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (orderType === "Delivery" && (!street.trim() || !city.trim())) {
      addToast("Please enter your delivery street and city", "error");
      return;
    }
    if (orderType === "Dine-In" && !tableNumber.trim()) {
      addToast("Please enter your table number (e.g., T-03)", "error");
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrder({
        items: items.map((i) => ({
          menuItem: i._id,
          quantity: i.quantity,
          notes: i.notes || "",
        })),
        orderType,
        tableNumber,
        customerName,
        customerPhone,
        deliveryAddress: { street, city, pincode },
        specialInstructions,
        paymentMethod,
        couponCode: appliedCoupon?.code || "",
      });

      clearCart();
      addToast(`Order ${order.orderNumber} placed successfully!`);
      navigate("/orders");
    } catch (err) {
      addToast(err.response?.data?.message || "Order placement failed", "error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">Secure Checkout</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brown mt-1">
          Complete Your Atithya Order
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
        {/* Left: Order Type, Details & Payment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E7DFD3]">
            <h2 className="text-lg font-bold text-brown mb-4">1. Choose Dining Mode</h2>
            <div className="grid grid-cols-3 gap-3">
              {["Delivery", "Dine-In", "Takeaway"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOrderType(mode)}
                  className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition ${
                    orderType === mode
                      ? "bg-espresso text-gold border-espresso shadow-sm"
                      : "bg-ivory text-brown border-[#DFD5C5] hover:border-primary"
                  }`}
                >
                  {mode === "Delivery" ? "🛵 Delivery" : mode === "Dine-In" ? "🍽️ Dine-In" : "🛍️ Takeaway"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E7DFD3] space-y-4">
            <h2 className="text-lg font-bold text-brown">2. Guest &amp; Fulfillment Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-brown/60">Full Name</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brown/60">Phone Number</label>
                <input
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {orderType === "Delivery" && (
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-brown/60">Street Address / Apartment</label>
                  <input
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House/Flat No, Building, Street"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-brown/60">City</label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brown/60">Pincode</label>
                  <input
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="700016"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {orderType === "Dine-In" && (
              <div>
                <label className="text-xs font-semibold text-brown/60">Table Number</label>
                <input
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., T-03 or VIP-1"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-brown/60">Special Instructions</label>
              <textarea
                rows="2"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Ring doorbell, allergies, cutlery preferences..."
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#DFD5C5] text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E7DFD3]">
            <h2 className="text-lg font-bold text-brown mb-4">3. Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: "UPI", label: "UPI Instant Pay", sub: "GPay, PhonePe, Paytm (Instant Confirm)" },
                { id: "Card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                { id: "Cash on Delivery", label: "Cash on Delivery", sub: "Pay in cash upon arrival" },
                { id: "Pay at Table", label: "Pay at Table / Counter", sub: "For Dine-In or Takeaway" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`text-left p-4 rounded-2xl border transition ${
                    paymentMethod === m.id
                      ? "border-primary bg-ivory ring-1 ring-primary"
                      : "border-[#E5DDD0] hover:border-gold"
                  }`}
                >
                  <p className="font-semibold text-sm text-brown">{m.label}</p>
                  <p className="text-xs text-brown/60 mt-0.5">{m.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E7DFD3] sticky top-24">
            <h2 className="text-lg font-bold text-brown mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i._id} className="flex justify-between text-sm">
                  <div className="pr-2">
                    <p className="font-medium text-brown">
                      {i.quantity} × {i.name}
                    </p>
                    {i.notes && <p className="text-[11px] text-brown/50 italic">“{i.notes}”</p>}
                  </div>
                  <span className="font-semibold text-brown shrink-0">₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Input */}
            <div className="mt-5 pt-4 border-t border-[#EFE8DC]">
              <label className="text-xs font-semibold text-brown/60">Promo / Coupon Code</label>
              <div className="flex gap-2 mt-1.5">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. WELCOME15)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#DFD5C5] text-xs font-mono uppercase outline-none focus:border-primary"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-50 text-danger text-xs font-semibold"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 rounded-xl bg-espresso text-gold text-xs font-semibold hover:bg-brown transition"
                  >
                    Apply
                  </button>
                )}
              </div>

              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {availableCoupons.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-forest-soft text-forest border border-forest/20 hover:bg-forest hover:text-white transition"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Dynamic Totals */}
            <div className="mt-5 pt-4 border-t border-[#EFE8DC] space-y-2 text-sm">
              <div className="flex justify-between text-brown/75">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-forest font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-brown/75">
                <span>GST ({gstRate}%)</span>
                <span>₹{tax}</span>
              </div>
              {orderType === "Delivery" && (
                <div className="flex justify-between text-brown/75">
                  <span>
                    Delivery Fee{" "}
                    {billing.freeDeliveryAbove > 0 &&
                      subtotal >= billing.freeDeliveryAbove &&
                      `(Free above ₹${billing.freeDeliveryAbove})`}
                  </span>
                  <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
              )}
              {packagingFee > 0 && (
                <div className="flex justify-between text-brown/75">
                  <span>Packaging Fee</span>
                  <span>₹{packagingFee}</span>
                </div>
              )}
              {convenienceFee > 0 && (
                <div className="flex justify-between text-brown/75">
                  <span>Convenience Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
              )}
              {serviceCharge > 0 && (
                <div className="flex justify-between text-brown/75">
                  <span>Service Charge ({billing.dineInServiceChargePercent}%)</span>
                  <span>₹{serviceCharge}</span>
                </div>
              )}
              {activeCustomCharges.map((c) => (
                <div key={c.name} className="flex justify-between text-brown/75">
                  <span>{c.name}</span>
                  <span>₹{c.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg text-brown pt-3 border-t border-[#E5DDD0]">
                <span>Total Payable</span>
                <span className="text-forest">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placing}
              className="w-full mt-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition shadow-glow disabled:opacity-50"
            >
              {placing ? "Placing Order..." : `Place Order · ₹${grandTotal}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
