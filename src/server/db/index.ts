import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../../ecommerce.db");
console.log("Database path:", dbPath);
export const db = new Database(dbPath);

// ── Performance pragmas ─────────────────────────────────────────────────────
// WAL = far better concurrent reads; cache_size = 64 MB in-memory page cache
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -65536"); // 64 MB
db.pragma("temp_store = MEMORY");
db.pragma("mmap_size = 268435456"); // 256 MB mmap


export function initDB() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      address TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price REAL NOT NULL,
      discount REAL DEFAULT 0,
      images TEXT, -- JSON string array
      stock INTEGER DEFAULT 0,
      ratings REAL DEFAULT 0,
      numReviews INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Performance indexes — make LIKE queries on category/name instant ──
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_name     ON products(name)`);

  // Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      shippingAddress TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      totalPrice REAL NOT NULL,
      isPaid INTEGER DEFAULT 0,
      paidAt DATETIME,
      orderStatus TEXT DEFAULT 'Processing',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `);

  // Order Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      FOREIGN KEY (orderId) REFERENCES orders (id),
      FOREIGN KEY (productId) REFERENCES products (id)
    )
  `);

  // Reviews Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (productId) REFERENCES products (id)
    )
  `);

  // Subscriptions Table (Newsletter)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial data if empty
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const seedProducts = [
      {
        name: "Premium Wireless Headphones",
        description: "High-quality sound with noise cancellation.",
        category: "Electronics",
        price: 299.99,
        stock: 50,
        images: JSON.stringify(["https://picsum.photos/seed/headphones/600/400"])
      },
      {
        name: "Minimalist Leather Watch",
        description: "Elegant design for every occasion.",
        category: "Accessories",
        price: 149.50,
        stock: 30,
        images: JSON.stringify(["https://picsum.photos/seed/watch/600/400"])
      },
      {
        name: "Smart Fitness Tracker",
        description: "Monitor your health and activity 24/7.",
        category: "Electronics",
        price: 79.99,
        stock: 100,
        images: JSON.stringify(["https://picsum.photos/seed/tracker/600/400"])
      }
    ];

    const insert = db.prepare(`
      INSERT INTO products (name, description, category, price, stock, images)
      VALUES (@name, @description, @category, @price, @stock, @images)
    `);

    for (const p of seedProducts) {
      insert.run(p);
    }
  }

  // Seed Admin User if not exists — only hash password once, on first creation
  const adminExists = db.prepare("SELECT id, role FROM users WHERE email = ?").get("admin@luxecart.com") as any;

  if (!adminExists) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync("admin123", salt);
    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run("Admin User", "admin@luxecart.com", hashedPassword, "admin");
    console.log("Admin user seeded: admin@luxecart.com / admin123");
  } else if (adminExists.role !== "admin") {
    // Only fix role — skip expensive bcrypt if password already set
    db.prepare("UPDATE users SET role = 'admin' WHERE email = ?")
      .run("admin@luxecart.com");
    console.log("Admin role restored for admin@luxecart.com");
  } else {
    console.log("Admin user OK: admin@luxecart.com");
  }

  const verifyAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@luxecart.com") as any;
  console.log("Admin verification:", {
    exists: !!verifyAdmin,
    role: verifyAdmin?.role,
    email: verifyAdmin?.email
  });

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Database tables:", tables.map((t: any) => t.name));
}
