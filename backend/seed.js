// Run with: npm run seed (or node seed.js)
// Idempotently seeds optional env-configured accounts, 24 curated Atithya menu items,
// 10 dining tables, 4 active promo coupons, and sample orders/reservations.
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./src/models/user.model");
const MenuItem = require("./src/models/menuItem.model");
const Table = require("./src/models/table.model");
const Coupon = require("./src/models/coupon.model");
const Order = require("./src/models/order.model");
const Reservation = require("./src/models/reservation.model");

const SAMPLE_MENU = [
  // STARTERS (5)
  {
    name: "Tandoori Paneer Tikka",
    description: "Cottage cheese cubes marinated in smoked saffron yogurt and royal spices, charred in clay tandoor with bell peppers.",
    category: "Starter",
    price: 340,
    dietary: "Veg",
    spiceLevel: "Medium",
    prepTime: 18,
    calories: 320,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    ratingCount: 42,
    image: { url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80", public_id: "" },
  },
  {
    name: "Murgh Malai Kebab",
    description: "Melt-in-mouth chicken morsels infused with cardamom, cashew cream, and mild white pepper, roasted over live charcoal.",
    category: "Starter",
    price: 390,
    dietary: "Non-Veg",
    spiceLevel: "Mild",
    prepTime: 20,
    calories: 380,
    isFeatured: true,
    isBestseller: false,
    rating: 4.7,
    ratingCount: 31,
    image: { url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80", public_id: "" },
  },
  {
    name: "Crispy Lotus Stem Honey Chilli",
    description: "Thinly sliced lotus stem wok-tossed with toasted sesame, smoked chilli glaze, and fresh spring onions.",
    category: "Starter",
    price: 310,
    dietary: "Vegan",
    spiceLevel: "Spicy",
    prepTime: 15,
    calories: 270,
    isFeatured: false,
    isBestseller: false,
    rating: 4.6,
    ratingCount: 19,
    image: { url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80", public_id: "" },
  },
  {
    name: "Hara Bhara Royal Kebab",
    description: "Pan-seared spinach, green pea, and roasted chana medallions stuffed with spiced hung curd and cashew nuts.",
    category: "Starter",
    price: 295,
    dietary: "Veg",
    spiceLevel: "Mild",
    prepTime: 14,
    calories: 260,
    isFeatured: false,
    isBestseller: true,
    rating: 4.7,
    ratingCount: 36,
    image: { url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80", public_id: "" },
  },
  {
    name: "Amritsari Ajwaini Fish Tikka",
    description: "Fresh river sole fillets marinated in carom seeds, Kashmiri chilli, and gram flour, seared golden with mint dip.",
    category: "Starter",
    price: 445,
    dietary: "Non-Veg",
    spiceLevel: "Medium",
    prepTime: 18,
    calories: 350,
    isFeatured: false,
    isBestseller: false,
    rating: 4.8,
    ratingCount: 25,
    image: { url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", public_id: "" },
  },

  // MAIN COURSE (6)
  {
    name: "Atithya Royal Dal Makhani",
    description: "Black urad lentils slow-simmered for 24 hours over charcoal embers, finished with cultured butter and fenugreek.",
    category: "Main Course",
    price: 420,
    dietary: "Veg",
    spiceLevel: "Mild",
    prepTime: 15,
    calories: 440,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    ratingCount: 68,
    image: { url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", public_id: "" },
  },
  {
    name: "Old Delhi Butter Chicken",
    description: "Tandoor-roasted pulled chicken simmered in a velvety heirloom tomato and makhani gravy with kasuri methi.",
    category: "Main Course",
    price: 495,
    dietary: "Non-Veg",
    spiceLevel: "Mild",
    prepTime: 20,
    calories: 520,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    ratingCount: 84,
    image: { url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", public_id: "" },
  },
  {
    name: "Paneer Lababdar",
    description: "Soft malai paneer cooked in a rich onion-tomato masala enriched with melon seeds, ginger juliennes, and cream.",
    category: "Main Course",
    price: 410,
    dietary: "Veg",
    spiceLevel: "Medium",
    prepTime: 18,
    calories: 460,
    isFeatured: false,
    isBestseller: false,
    rating: 4.6,
    ratingCount: 27,
    image: { url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80", public_id: "" },
  },
  {
    name: "Palak Paneer Lazeez",
    description: "Silky blanched baby spinach tempered with roasted garlic and cumin, folded with house-made malai cottage cheese.",
    category: "Main Course",
    price: 385,
    dietary: "Veg",
    spiceLevel: "Mild",
    prepTime: 16,
    calories: 390,
    isFeatured: false,
    isBestseller: false,
    rating: 4.7,
    ratingCount: 33,
    image: { url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80", public_id: "" },
  },
  {
    name: "Kadhai Murgh Peshawari",
    description: "Bone-in chicken braised with freshly pounded coriander seeds, smoked red chillies, tomatoes, and charred bell peppers.",
    category: "Main Course",
    price: 480,
    dietary: "Non-Veg",
    spiceLevel: "Spicy",
    prepTime: 22,
    calories: 510,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    ratingCount: 44,
    image: { url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80", public_id: "" },
  },
  {
    name: "Malai Kofta Shahi",
    description: "Crisp paneer and khoya dumplings stuffed with pistachios and raisins, bathed in a saffron-cashew royal gravy.",
    category: "Main Course",
    price: 430,
    dietary: "Veg",
    spiceLevel: "Mild",
    prepTime: 20,
    calories: 480,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    ratingCount: 29,
    image: { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80", public_id: "" },
  },

  // CHEF'S SPECIAL (4)
  {
    name: "Kashmiri Rogan Josh",
    description: "Succulent slow-braised lamb shanks cooked with Kashmiri red chillies, fennel, and aromatic whole garam masala.",
    category: "Chef's Special",
    price: 620,
    dietary: "Non-Veg",
    spiceLevel: "Spicy",
    prepTime: 25,
    calories: 560,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    ratingCount: 39,
    image: { url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80", public_id: "" },
  },
  {
    name: "Awadhi Subz Dum Biryani",
    description: "Long-grain aged basmati layered with saffron-infused seasonal vegetables, caramelized onions, and mint, sealed under pastry.",
    category: "Chef's Special",
    price: 440,
    dietary: "Veg",
    spiceLevel: "Medium",
    prepTime: 22,
    calories: 490,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    ratingCount: 51,
    image: { url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80", public_id: "" },
  },
  {
    name: "Hyderabadi Dum Gosht Biryani",
    description: "Tender marinated mutton slow-cooked on dum with saffron basmati, fried shallots, and served with burhani raita.",
    category: "Chef's Special",
    price: 595,
    dietary: "Non-Veg",
    spiceLevel: "Spicy",
    prepTime: 28,
    calories: 620,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    ratingCount: 73,
    image: { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80", public_id: "" },
  },
  {
    name: "Atithya Maharaja Thali",
    description: "Grand royal platter featuring Dal Makhani, Paneer Lababdar, seasonal sabzi, saffron pulao, 2 assorted breads, raita, and dessert.",
    category: "Chef's Special",
    price: 690,
    dietary: "Veg",
    spiceLevel: "Medium",
    prepTime: 22,
    calories: 820,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    ratingCount: 64,
    image: { url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", public_id: "" },
  },

  // BREADS & RICE (3)
  {
    name: "Garlic & Coriander Butter Naan",
    description: "Hand-stretched leavened sourdough flatbread baked crisp in our tandoor and brushed with roasted garlic butter.",
    category: "Breads & Rice",
    price: 95,
    dietary: "Veg",
    spiceLevel: "None",
    prepTime: 8,
    calories: 210,
    isFeatured: false,
    isBestseller: true,
    rating: 4.7,
    ratingCount: 62,
    image: { url: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&q=80", public_id: "" },
  },
  {
    name: "Flaky Lachha Paratha",
    description: "Multi-layered whole wheat artisan flatbread brushed with desi ghee and baked crisp in the clay oven.",
    category: "Breads & Rice",
    price: 85,
    dietary: "Veg",
    spiceLevel: "None",
    prepTime: 8,
    calories: 230,
    isFeatured: false,
    isBestseller: false,
    rating: 4.6,
    ratingCount: 28,
    image: { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80", public_id: "" },
  },
  {
    name: "Saffron Jeera Pulao",
    description: "Fluffy basmati rice tempered with cumin seeds, bay leaf, ghee, and Kashmiri saffron strands.",
    category: "Breads & Rice",
    price: 220,
    dietary: "Veg",
    spiceLevel: "None",
    prepTime: 12,
    calories: 310,
    isFeatured: false,
    isBestseller: false,
    rating: 4.5,
    ratingCount: 22,
    image: { url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80", public_id: "" },
  },

  // DESSERTS (3)
  {
    name: "Shahi Gulab Jamun with Rabri",
    description: "Warm khoya dumplings soaked in rose-cardamom syrup, served over chilled saffron-pistachio rabri.",
    category: "Dessert",
    price: 240,
    dietary: "Veg",
    spiceLevel: "None",
    prepTime: 10,
    calories: 390,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    ratingCount: 57,
    image: { url: "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=800&q=80", public_id: "" },
  },
  {
    name: "Kesar Pista Rasmalai",
    description: "Delicate cottage cheese medallions poached in chilled saffron-infused reduced milk garnished with toasted pistachios.",
    category: "Dessert",
    price: 225,
    dietary: "Veg",
    spiceLevel: "None",
    prepTime: 6,
    calories: 310,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    ratingCount: 41,
    image: { url: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80", public_id: "" },
  },
  {
    name: "Belgian Dark Chocolate Lava Tart",
    description: "Warm molten 70% dark chocolate center paired with Madagascar vanilla bean gelato and toasted hazelnuts.",
    category: "Dessert",
    price: 290,
    dietary: "Egg",
    spiceLevel: "None",
    prepTime: 14,
    calories: 430,
    isFeatured: false,
    isBestseller: false,
    rating: 4.7,
    ratingCount: 28,
    image: { url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80", public_id: "" },
  },

  // BEVERAGES (3)
  {
    name: "Kesar Mango Lassi",
    description: "Alphonso mango puree churned with artisanal dahi, crushed green cardamom, and roasted pistachio slivers.",
    category: "Beverage",
    price: 180,
    dietary: "Veg",
    spiceLevel: "None",
    prepTime: 6,
    calories: 240,
    isFeatured: false,
    isBestseller: true,
    rating: 4.8,
    ratingCount: 45,
    image: { url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&q=80", public_id: "" },
  },
  {
    name: "Smoked Kokum & Ginger Cooler",
    description: "Tangy Konkan kokum reduction muddled with fresh ginger, mint, black salt, and sparkling soda.",
    category: "Beverage",
    price: 165,
    dietary: "Vegan",
    spiceLevel: "None",
    prepTime: 5,
    calories: 110,
    isFeatured: false,
    isBestseller: false,
    rating: 4.6,
    ratingCount: 21,
    image: { url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", public_id: "" },
  },
  {
    name: "Royal Kashmiri Kahwa",
    description: "Fragrant green tea brewed with saffron strands, cinnamon bark, crushed green cardamom, and slivered almonds.",
    category: "Beverage",
    price: 155,
    dietary: "Vegan",
    spiceLevel: "None",
    prepTime: 7,
    calories: 60,
    isFeatured: false,
    isBestseller: false,
    rating: 4.8,
    ratingCount: 34,
    image: { url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80", public_id: "" },
  },
];

const SAMPLE_TABLES = [
  { tableNumber: "T-01", name: "Lotus Duo", capacity: 2, zone: "Indoor", status: "Available" },
  { tableNumber: "T-02", name: "Champagne Alcove", capacity: 2, zone: "Indoor", status: "Available" },
  { tableNumber: "T-03", name: "Saffron Table", capacity: 4, zone: "Indoor", status: "Available" },
  { tableNumber: "T-04", name: "Haveli Hearth", capacity: 4, zone: "Indoor", status: "Available" },
  { tableNumber: "T-05", name: "Grand Family", capacity: 6, zone: "Indoor", status: "Available" },
  { tableNumber: "T-06", name: "Garden Veranda", capacity: 4, zone: "Outdoor", status: "Available" },
  { tableNumber: "T-07", name: "Banyan Courtyard", capacity: 6, zone: "Outdoor", status: "Available" },
  { tableNumber: "T-08", name: "Skyline Duo", capacity: 2, zone: "Rooftop", status: "Available" },
  { tableNumber: "T-09", name: "Starlight Terrace", capacity: 4, zone: "Rooftop", status: "Available" },
  { tableNumber: "VIP-1", name: "Maharaja Private Suite", capacity: 10, zone: "VIP Lounge", status: "Available" },
];

const SAMPLE_COUPONS = [
  {
    code: "WELCOME15",
    description: "15% off on your first order at Atithya (up to ₹200)",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 300,
    maxDiscount: 200,
    usageLimit: 500,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: "ATITHYA100",
    description: "Flat ₹100 off on orders above ₹699",
    discountType: "flat",
    discountValue: 100,
    minOrderAmount: 699,
    maxDiscount: 100,
    usageLimit: 300,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: "FEAST20",
    description: "20% off on family feasts above ₹1200 (up to ₹400)",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 1200,
    maxDiscount: 400,
    usageLimit: 200,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: "ROYAL250",
    description: "Flat ₹250 off on celebratory orders above ₹1800",
    discountType: "flat",
    discountValue: 250,
    minOrderAmount: 1800,
    maxDiscount: 250,
    usageLimit: 150,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Atithya seeding...");

  const accounts = [
    process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD
      ? {
          name: process.env.SEED_ADMIN_NAME || "Atithya Admin",
          email: process.env.SEED_ADMIN_EMAIL,
          password: process.env.SEED_ADMIN_PASSWORD,
          role: "admin",
          phone: process.env.SEED_ADMIN_PHONE || "+91 00000 00001",
        }
      : null,
    process.env.SEED_KITCHEN_EMAIL && process.env.SEED_KITCHEN_PASSWORD
      ? {
          name: process.env.SEED_KITCHEN_NAME || "Kitchen Staff",
          email: process.env.SEED_KITCHEN_EMAIL,
          password: process.env.SEED_KITCHEN_PASSWORD,
          role: "kitchen",
          phone: process.env.SEED_KITCHEN_PHONE || "+91 00000 00002",
        }
      : null,
    process.env.SEED_USER_EMAIL && process.env.SEED_USER_PASSWORD
      ? {
          name: process.env.SEED_USER_NAME || "Guest User",
          email: process.env.SEED_USER_EMAIL,
          password: process.env.SEED_USER_PASSWORD,
          role: "user",
          phone: process.env.SEED_USER_PHONE || "+91 00000 00003",
        }
      : null,
  ].filter(Boolean);

  const createdUsers = {};
  if (accounts.length === 0) {
    console.log("No SEED_* account credentials found in .env; skipping user account creation.");
  }
  for (const acc of accounts) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = await User.create(acc);
      console.log(`Created ${acc.role} account.`);
    } else {
      console.log(`Account already exists for role: ${acc.role}`);
    }
    createdUsers[acc.role] = user;
  }

  // Upsert menu items by name so new Atithya signature dishes are always added cleanly
  let addedMenu = 0;
  for (const dish of SAMPLE_MENU) {
    const exists = await MenuItem.findOne({ name: dish.name });
    if (!exists) {
      await MenuItem.create(dish);
      addedMenu += 1;
    }
  }
  const menuDocs = await MenuItem.find();
  console.log(`Added ${addedMenu} new Atithya dishes (Total in catalog: ${menuDocs.length}).`);

  // Upsert tables by tableNumber
  let addedTables = 0;
  for (const tbl of SAMPLE_TABLES) {
    const exists = await Table.findOne({ tableNumber: tbl.tableNumber });
    if (!exists) {
      await Table.create(tbl);
      addedTables += 1;
    }
  }
  const tableDocs = await Table.find();
  console.log(`Added ${addedTables} new tables (Total tables: ${tableDocs.length}).`);

  // Upsert coupons by code
  for (const c of SAMPLE_COUPONS) {
    const exists = await Coupon.findOne({ code: c.code });
    if (!exists) {
      await Coupon.create(c);
      console.log(`Created coupon: ${c.code}`);
    }
  }

  // Seed initial sample Orders if none exist
  const orderCount = await Order.countDocuments();
  if (orderCount === 0 && menuDocs.length >= 4 && createdUsers.user) {
    const sampleOrders = [
      {
        orderNumber: "ATH-DEMO-1001",
        user: createdUsers.user._id,
        items: [
          { menuItem: menuDocs[0]._id, name: menuDocs[0].name, price: menuDocs[0].price, image: menuDocs[0].image.url, dietary: menuDocs[0].dietary, quantity: 1 },
          { menuItem: menuDocs[3]._id, name: menuDocs[3].name, price: menuDocs[3].price, image: menuDocs[3].image.url, dietary: menuDocs[3].dietary, quantity: 1 },
        ],
        orderType: "Dine-In",
        tableNumber: "T-03",
        customerName: createdUsers.user.name,
        customerPhone: createdUsers.user.phone,
        subtotal: menuDocs[0].price + menuDocs[3].price,
        tax: Math.round((menuDocs[0].price + menuDocs[3].price) * 0.05),
        deliveryFee: 0,
        discount: 0,
        totalAmount: Math.round((menuDocs[0].price + menuDocs[3].price) * 1.05),
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        transactionId: "UPI-DEMO-1001",
        status: "Preparing",
        estimatedPrepMinutes: 20,
        statusHistory: [
          { status: "Confirmed", note: "Order confirmed via UPI" },
          { status: "Preparing", note: "Kitchen started preparation" },
        ],
      },
      {
        orderNumber: "ATH-DEMO-1002",
        user: createdUsers.user._id,
        items: [
          { menuItem: menuDocs[1]._id, name: menuDocs[1].name, price: menuDocs[1].price, image: menuDocs[1].image.url, dietary: menuDocs[1].dietary, quantity: 2 },
        ],
        orderType: "Delivery",
        customerName: createdUsers.user.name,
        customerPhone: createdUsers.user.phone,
        deliveryAddress: { street: "42 Park Street", city: "Kolkata", pincode: "700016" },
        subtotal: menuDocs[1].price * 2,
        tax: Math.round(menuDocs[1].price * 2 * 0.05),
        deliveryFee: 0,
        discount: 100,
        couponCode: "ATITHYA100",
        totalAmount: Math.round((menuDocs[1].price * 2 - 100) * 1.05),
        paymentMethod: "Card",
        paymentStatus: "Paid",
        transactionId: "CRD-DEMO-1002",
        status: "Delivered",
        estimatedPrepMinutes: 35,
        statusHistory: [
          { status: "Confirmed", note: "Order confirmed via Card" },
          { status: "Delivered", note: "Delivered to guest" },
        ],
      },
    ];
    await Order.insertMany(sampleOrders);
    console.log("Seeded 2 sample orders for Dashboard & Kitchen Display.");
  }

  // Seed initial sample Reservation if none exist
  const resCount = await Reservation.countDocuments();
  if (resCount === 0 && tableDocs.length > 0 && createdUsers.user) {
    const today = new Date().toISOString().slice(0, 10);
    await Reservation.create({
      bookingCode: "ATH-RES-DEMO1",
      user: createdUsers.user._id,
      guestName: createdUsers.user.name,
      guestEmail: createdUsers.user.email,
      guestPhone: createdUsers.user.phone,
      table: tableDocs[2]._id,
      date: today,
      timeSlot: "20:00",
      partySize: 4,
      zone: tableDocs[2].zone,
      occasion: "Family Gathering",
      specialRequests: "Window side seating preferred",
      status: "Confirmed",
    });
    console.log("Seeded 1 sample table reservation.");
  }

  console.log("\nAtithya seed completed successfully!");
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
