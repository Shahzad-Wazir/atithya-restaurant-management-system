import { useEffect, useState } from "react";
import {
  getBillingConfig,
  updateBillingConfig,
  getSalesReport,
} from "../../services/operationsService";
import { getMenuItems } from "../../services/menuService";
import { useToast } from "../../context/ToastContext";
import AtithyaLogo from "../../components/AtithyaLogo";
import Loading from "../../components/Loading";

const formatISO = (d) => d.toISOString().slice(0, 10);

export default function BillingAndReports() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("reports"); // "reports" | "charges" | "hero"

  // Sales Report state
  const today = new Date();
  const [startDate, setStartDate] = useState(
    formatISO(new Date(today.getFullYear(), today.getMonth(), 1))
  );
  const [endDate, setEndDate] = useState(formatISO(today));
  const [orderType, setOrderType] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("All");
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);

  // Dynamic Charges & Hero Showcase Config state
  const [config, setConfig] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [savingConfig, setSavingConfig] = useState(false);
  const [newCharge, setNewCharge] = useState({
    name: "",
    type: "flat",
    value: "",
    applyTo: "All",
    isActive: true,
  });

  const loadReport = (sDate = startDate, eDate = endDate, oType = orderType, pMethod = paymentMethod) => {
    setLoadingReport(true);
    getSalesReport({
      startDate: sDate || undefined,
      endDate: eDate || undefined,
      orderType: oType,
      paymentMethod: pMethod,
    })
      .then(setReport)
      .catch(() => addToast("Could not load sales report", "error"))
      .finally(() => setLoadingReport(false));
  };

  useEffect(() => {
    loadReport();
    getBillingConfig()
      .then((cfg) =>
        setConfig({
          ...cfg,
          heroShowcase: cfg.heroShowcase || {
            badge: "Chef's Signature",
            title: "24-Hr Smoked Dal Makhani",
            imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85",
          },
        })
      )
      .catch(() => addToast("Could not load configuration", "error"));
    getMenuItems().then(setMenuItems).catch(() => setMenuItems([]));
  }, []);

  const applyPreset = (preset) => {
    const now = new Date();
    let s = "";
    let e = formatISO(now);

    if (preset === "today") {
      s = formatISO(now);
      e = formatISO(now);
    } else if (preset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      s = formatISO(y);
      e = formatISO(y);
    } else if (preset === "7days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      s = formatISO(d);
    } else if (preset === "thisMonth") {
      s = formatISO(new Date(now.getFullYear(), now.getMonth(), 1));
    } else if (preset === "lastMonth") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      s = formatISO(first);
      e = formatISO(last);
    } else if (preset === "all") {
      s = "";
      e = "";
    }

    setStartDate(s);
    setEndDate(e);
    loadReport(s, e, orderType, paymentMethod);
  };

  const handleExportCSV = () => {
    if (!report?.orders?.length) {
      addToast("No orders in this date range to export", "info");
      return;
    }
    const headers = [
      "Order Number",
      "Date",
      "Guest",
      "Mode",
      "Payment",
      "Payment Status",
      "Subtotal",
      "Discount",
      "GST",
      "Delivery Fee",
      "Packaging",
      "Convenience",
      "Service Charge",
      "Custom Charges",
      "Total Amount",
      "Status",
    ];
    const rows = report.orders.map((o) => {
      const customSum = (o.customCharges || []).reduce((a, c) => a + (c.amount || 0), 0);
      return [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString("en-IN").replace(/,/g, ""),
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        o.orderType,
        o.paymentMethod,
        o.paymentStatus,
        o.subtotal,
        o.discount,
        o.tax,
        o.deliveryFee,
        o.packagingFee || 0,
        o.convenienceFee || 0,
        o.serviceCharge || 0,
        customSum,
        o.totalAmount,
        o.status,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Atithya-Sales-${startDate || "All"}-to-${endDate || "Now"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Sales CSV downloaded!");
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const updated = await updateBillingConfig(config);
      setConfig(updated);
      addToast("Saved! Changes are now live on the customer website.");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handlePickDishForHero = (dishId) => {
    const dish = menuItems.find((m) => m._id === dishId);
    if (!dish) return;
    setConfig((prev) => ({
      ...prev,
      heroShowcase: {
        ...prev.heroShowcase,
        title: dish.name,
        imageUrl: dish.image?.url || prev.heroShowcase.imageUrl,
      },
    }));
    addToast(`Loaded "${dish.name}" into Hero preview — click Save to publish`, "info");
  };

  const handleAddCustomCharge = () => {
    if (!newCharge.name.trim() || newCharge.value === "") {
      addToast("Enter a charge name and amount/percentage", "error");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      customCharges: [
        ...(prev.customCharges || []),
        { ...newCharge, name: newCharge.name.trim(), value: Number(newCharge.value) },
      ],
    }));
    setNewCharge({ name: "", type: "flat", value: "", applyTo: "All", isActive: true });
  };

  const handleRemoveCustomCharge = (idx) => {
    setConfig((prev) => ({
      ...prev,
      customCharges: prev.customCharges.filter((_, i) => i !== idx),
    }));
  };

  const handleToggleCustomCharge = (idx) => {
    setConfig((prev) => ({
      ...prev,
      customCharges: prev.customCharges.map((c, i) =>
        i === idx ? { ...c, isActive: !c.isActive } : c
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown">
            Billing, Hero Showcase &amp; Sales PDF
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Export sales PDFs, adjust live GST/custom fees, or update the homepage Hero dish &amp; image
          </p>
        </div>

        <div className="inline-flex flex-wrap p-1 rounded-xl bg-white border border-borderWarm gap-1">
          {[
            { id: "reports", label: "📄 Sales PDF" },
            { id: "charges", label: "⚙️ GST & Charges" },
            { id: "hero", label: "✦ Hero Dish & Image" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === t.id
                  ? "bg-espresso text-gold"
                  : "text-muted hover:text-brown"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SALES REPORT & PDF DOWNLOAD */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-borderWarm space-y-4 no-print">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted mr-1">Quick Select:</span>
              {[
                { id: "today", label: "Today (Single Day)" },
                { id: "yesterday", label: "Yesterday" },
                { id: "7days", label: "Last 7 Days" },
                { id: "thisMonth", label: "This Month" },
                { id: "lastMonth", label: "Last Month" },
                { id: "all", label: "All Time" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className="px-3 py-1.5 rounded-full bg-ivory border border-borderWarm text-xs font-semibold text-brown hover:border-gold transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-muted">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Order Mode</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-borderWarm text-sm"
                >
                  <option value="All">All Modes</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Dine-In">Dine-In</option>
                  <option value="Takeaway">Takeaway</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Payment</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-borderWarm text-sm"
                >
                  <option value="All">All Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Pay at Table">Pay at Table</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => loadReport(startDate, endDate, orderType, paymentMethod)}
                className="py-2.5 px-4 rounded-xl bg-espresso text-white text-xs font-semibold hover:bg-brown transition"
              >
                Generate Report
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
                >
                  🖨️ Save PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="py-2.5 px-3 rounded-xl bg-ivory border border-borderWarm text-brown text-xs font-semibold hover:border-forest transition"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>

          {loadingReport ? (
            <Loading text="Compiling Atithya sales statement..." />
          ) : report ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-borderWarm space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-borderWarm">
                <div className="space-y-2">
                  <AtithyaLogo size="sm" theme="light" />
                  <div className="text-xs text-muted">
                    <p className="font-semibold text-brown">{report.business?.legalName}</p>
                    <p>{report.business?.invoiceAddress}</p>
                    <p className="font-mono mt-0.5 text-brown">GSTIN: {report.business?.gstin}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right text-xs text-muted">
                  <p className="text-base font-serif font-bold text-brown uppercase tracking-wider">
                    Sales &amp; Tax Statement
                  </p>
                  <p className="mt-1 font-semibold text-primary">
                    Period: {report.period?.startDate} → {report.period?.endDate}
                  </p>
                  <p className="mt-0.5">Generated: {new Date().toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Orders", val: report.summary.orderCount, cls: "text-primary" },
                  { label: "Gross Subtotal", val: `₹${report.summary.grossSubtotal.toLocaleString("en-IN")}`, cls: "text-brown" },
                  { label: "Discounts", val: `−₹${report.summary.totalDiscount.toLocaleString("en-IN")}`, cls: "text-danger" },
                  { label: "GST Collected", val: `₹${report.summary.totalTax.toLocaleString("en-IN")}`, cls: "text-gold-dark" },
                  {
                    label: "Extra Fees",
                    val: `₹${(
                      report.summary.totalDeliveryFee +
                      report.summary.totalPackagingFee +
                      report.summary.totalConvenienceFee +
                      report.summary.totalServiceCharge +
                      report.summary.totalCustomCharges
                    ).toLocaleString("en-IN")}`,
                    cls: "text-info",
                  },
                  { label: "Net Revenue", val: `₹${report.summary.netRevenue.toLocaleString("en-IN")}`, cls: "text-forest" },
                ].map((m) => (
                  <div key={m.label} className="p-3.5 rounded-xl bg-ivory border border-borderWarm">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-muted">{m.label}</p>
                    <p className={`text-lg font-bold mt-1 tabular-nums ${m.cls}`}>{m.val}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-ivory text-muted uppercase border-y border-borderWarm">
                    <tr>
                      <th className="px-3 py-2.5">Invoice #</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Guest &amp; Mode</th>
                      <th className="px-3 py-2.5 text-right">Subtotal</th>
                      <th className="px-3 py-2.5 text-right">GST</th>
                      <th className="px-3 py-2.5 text-right">Fees</th>
                      <th className="px-3 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderWarm">
                    {report.orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-muted">
                          No sales recorded in this date range.
                        </td>
                      </tr>
                    ) : (
                      report.orders.map((o) => {
                        const fees =
                          (o.deliveryFee || 0) +
                          (o.packagingFee || 0) +
                          (o.convenienceFee || 0) +
                          (o.serviceCharge || 0) +
                          (o.customCharges || []).reduce((a, c) => a + (c.amount || 0), 0);
                        return (
                          <tr key={o._id}>
                            <td className="px-3 py-2.5 font-mono font-bold text-brown">{o.orderNumber}</td>
                            <td className="px-3 py-2.5 text-muted">
                              {new Date(o.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="font-medium text-brown">{o.customerName}</span>
                              <span className="text-muted ml-1">({o.orderType} · {o.paymentMethod})</span>
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">₹{o.subtotal}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">₹{o.tax}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">₹{fees}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-forest tabular-nums">₹{o.totalAmount}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: DYNAMIC GST, CONVENIENCE FEE & CUSTOM CHARGES */}
      {activeTab === "charges" && config && (
        <form onSubmit={handleSaveConfig} className="space-y-6 no-print">
          <div className="bg-white rounded-2xl p-6 border border-borderWarm space-y-4">
            <h2 className="text-xl font-serif font-bold text-brown">1. Business Details &amp; GSTIN</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted">Legal Restaurant Name</label>
                <input
                  value={config.legalName || ""}
                  onChange={(e) => setConfig({ ...config, legalName: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">GSTIN Number</label>
                <input
                  value={config.gstin || ""}
                  onChange={(e) => setConfig({ ...config, gstin: e.target.value.toUpperCase() })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm font-mono uppercase"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted">Invoice Address</label>
                <input
                  value={config.invoiceAddress || ""}
                  onChange={(e) => setConfig({ ...config, invoiceAddress: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-borderWarm space-y-4">
            <h2 className="text-xl font-serif font-bold text-brown">2. Core Tax &amp; Billing Charges</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted">GST / Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  step="0.5"
                  value={config.gstRate}
                  onChange={(e) => setConfig({ ...config, gstRate: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Delivery Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={config.deliveryFee}
                  onChange={(e) => setConfig({ ...config, deliveryFee: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Free Delivery Above (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={config.freeDeliveryAbove}
                  onChange={(e) => setConfig({ ...config, freeDeliveryAbove: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Packaging Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={config.packagingFee}
                  onChange={(e) => setConfig({ ...config, packagingFee: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Convenience / Platform Fee</label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={config.convenienceFeeType}
                    onChange={(e) => setConfig({ ...config, convenienceFeeType: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border border-borderWarm text-xs font-semibold"
                  >
                    <option value="flat">Flat ₹</option>
                    <option value="percentage">Percent %</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={config.convenienceFeeValue}
                    onChange={(e) => setConfig({ ...config, convenienceFeeValue: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-borderWarm text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Dine-In Service Charge (%)</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  step="0.5"
                  value={config.dineInServiceChargePercent}
                  onChange={(e) =>
                    setConfig({ ...config, dineInServiceChargePercent: Number(e.target.value) })
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-borderWarm space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-brown">3. Custom Extra Charges</h2>
              <p className="text-xs text-muted mt-0.5">
                Add any new fee (Late Night Surcharge, Festive Handling Fee, Eco-Packaging) — synced live to Checkout &amp; PDF Invoices
              </p>
            </div>

            <div className="grid sm:grid-cols-5 gap-3 items-end bg-ivory p-4 rounded-xl border border-borderWarm">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted">Charge Name</label>
                <input
                  value={newCharge.name}
                  onChange={(e) => setNewCharge({ ...newCharge, name: e.target.value })}
                  placeholder="e.g., Festive Handling Fee"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-borderWarm text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Type &amp; Value</label>
                <div className="flex gap-1 mt-1">
                  <select
                    value={newCharge.type}
                    onChange={(e) => setNewCharge({ ...newCharge, type: e.target.value })}
                    className="px-2 py-2 rounded-xl bg-white border border-borderWarm text-xs"
                  >
                    <option value="flat">₹</option>
                    <option value="percentage">%</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={newCharge.value}
                    onChange={(e) => setNewCharge({ ...newCharge, value: e.target.value })}
                    placeholder="25"
                    className="w-full px-2 py-2 rounded-xl bg-white border border-borderWarm text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Apply To</label>
                <select
                  value={newCharge.applyTo}
                  onChange={(e) => setNewCharge({ ...newCharge, applyTo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-borderWarm text-sm"
                >
                  <option value="All">All Orders</option>
                  <option value="Delivery">Delivery Only</option>
                  <option value="Dine-In">Dine-In Only</option>
                  <option value="Takeaway">Takeaway Only</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCustomCharge}
                className="py-2.5 px-4 rounded-xl bg-espresso text-white text-xs font-semibold hover:bg-brown transition"
              >
                + Add Charge
              </button>
            </div>

            {(config.customCharges || []).length > 0 && (
              <div className="divide-y divide-borderWarm border border-borderWarm rounded-xl overflow-hidden">
                {config.customCharges.map((c, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm bg-white">
                    <div>
                      <span className="font-semibold text-brown">{c.name}</span>
                      <span className="ml-2 text-xs text-forest font-bold">
                        {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-ivory text-muted">
                        {c.applyTo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleCustomCharge(idx)}
                        className={`px-3 py-1 rounded-full font-semibold ${
                          c.isActive ? "bg-forest-soft text-forest" : "bg-stone-200 text-muted"
                        }`}
                      >
                        {c.isActive ? "Active" : "Paused"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomCharge(idx)}
                        className="text-danger font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={savingConfig}
            className="px-8 py-3.5 rounded-xl bg-espresso text-white font-semibold text-sm hover:bg-brown transition shadow-xs disabled:opacity-50"
          >
            {savingConfig ? "Saving..." : "Save Billing & Tax Rules Live"}
          </button>
        </form>
      )}

      {/* TAB 3: ADMIN-EDITABLE HOMEPAGE HERO DISH & IMAGE */}
      {activeTab === "hero" && config && (
        <form onSubmit={handleSaveConfig} className="grid lg:grid-cols-2 gap-6 no-print">
          <div className="bg-white rounded-2xl p-6 border border-borderWarm space-y-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-brown">
                Homepage Hero Featured Dish &amp; Photo
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Pick any dish from your menu catalog or paste a custom image URL — updates the public Hero section live!
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Quick-Fill from Existing Menu Dish</label>
              <select
                defaultValue=""
                onChange={(e) => handlePickDishForHero(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm bg-ivory"
              >
                <option value="" disabled>-- Choose a dish to auto-fill title &amp; image --</option>
                {menuItems.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} (₹{m.price} · {m.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Floating Card Label</label>
              <input
                value={config.heroShowcase?.badge || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroShowcase: { ...config.heroShowcase, badge: e.target.value },
                  })
                }
                placeholder="Chef's Signature"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Featured Dish Title</label>
              <input
                required
                value={config.heroShowcase?.title || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroShowcase: { ...config.heroShowcase, title: e.target.value },
                  })
                }
                placeholder="24-Hr Smoked Dal Makhani"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Hero Dish Image URL</label>
              <input
                required
                value={config.heroShowcase?.imageUrl || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroShowcase: { ...config.heroShowcase, imageUrl: e.target.value },
                  })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-borderWarm text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="px-7 py-3 rounded-xl bg-espresso text-white font-semibold text-sm hover:bg-brown transition disabled:opacity-50"
            >
              {savingConfig ? "Publishing..." : "Publish Hero Showcase Live"}
            </button>
          </div>

          {/* Live Hero Card Preview */}
          <div className="bg-espresso rounded-2xl p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-4">
              Live Homepage Preview
            </p>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gold/30 shadow-2xl">
                <img
                  src={
                    config.heroShowcase?.imageUrl ||
                    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85"
                  }
                  alt={config.heroShowcase?.title || "Hero preview"}
                  className="w-full h-64 sm:h-72 object-cover"
                />
              </div>
              <div className="inline-flex items-center gap-3 mt-4 sm:mt-0 sm:absolute sm:-bottom-4 sm:-left-4 bg-ivory text-brown px-4 py-3 rounded-2xl shadow-xl border border-gold/35">
                <div className="w-9 h-9 rounded-xl bg-espresso text-gold flex items-center justify-center text-base">
                  ✦
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-forest font-bold">
                    {config.heroShowcase?.badge || "Chef's Signature"}
                  </p>
                  <p className="text-sm font-bold text-brown">
                    {config.heroShowcase?.title || "24-Hr Smoked Dal Makhani"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
