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

  // ── Blog Posts Table ───────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      category TEXT DEFAULT 'Lifestyle',
      author TEXT DEFAULT 'Admin',
      authorImg TEXT DEFAULT 'https://i.pravatar.cc/60?u=admin',
      coverImg TEXT,
      readTime TEXT DEFAULT '5 min read',
      published INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published)`);

  // ── Team Members Table ─────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      img TEXT,
      displayOrder INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Contact Messages Table ─────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Seed blog posts ────────────────────────────────────────────────────────
  const blogCount = db.prepare("SELECT COUNT(*) as count FROM blog_posts").get() as { count: number };
  if (blogCount.count === 0) {
    const seedBlogs = [
      {
        title: "10 Must-Have Gadgets for a Smart Home in 2026",
        slug: "smart-home-gadgets-2026",
        excerpt: "From voice assistants to smart lighting — we breakdown the top tech products that will transform your living space.",
        content: "Full article content goes here. Edit this from the admin panel.",
        category: "Electronics",
        author: "Marcus Reid",
        authorImg: "https://i.pravatar.cc/60?u=marcus-r",
        coverImg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=70&w=600&fm=webp",
        readTime: "6 min read",
        published: 1,
      },
      {
        title: "Spring Fashion Trends: What to Wear This Season",
        slug: "spring-fashion-trends-2026",
        excerpt: "Our fashion editors handpicked the key pieces every wardrobe needs — from minimalist staples to bold statement looks.",
        content: "Full article content goes here. Edit this from the admin panel.",
        category: "Fashion",
        author: "Sarah Chen",
        authorImg: "https://i.pravatar.cc/60?u=sarah-c",
        coverImg: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=70&w=600&fm=webp",
        readTime: "5 min read",
        published: 1,
      },
      {
        title: "How to Build a Luxurious Living Room on a Budget",
        slug: "luxurious-living-room-budget",
        excerpt: "You don't need to spend a fortune to achieve a premium-looking home.",
        content: "Full article content goes here. Edit this from the admin panel.",
        category: "Home & Living",
        author: "Priya Patel",
        authorImg: "https://i.pravatar.cc/60?u=priya-p",
        coverImg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=70&w=600&fm=webp",
        readTime: "8 min read",
        published: 1,
      },
    ];
    const insertBlog = db.prepare(`
      INSERT INTO blog_posts (title, slug, excerpt, content, category, author, authorImg, coverImg, readTime, published)
      VALUES (@title, @slug, @excerpt, @content, @category, @author, @authorImg, @coverImg, @readTime, @published)
    `);
    for (const b of seedBlogs) insertBlog.run(b);
  }

  // ── Seed team members ──────────────────────────────────────────────────────
  const teamCount = db.prepare("SELECT COUNT(*) as count FROM team_members").get() as { count: number };
  if (teamCount.count === 0) {
    const seedTeam = [
      { name: "Alex Johnson", role: "Founder & CEO", bio: "10+ years in e-commerce. Passionate about delivering premium experiences.", img: "https://i.pravatar.cc/200?u=alex-johnson", displayOrder: 1 },
      { name: "Sarah Chen", role: "Head of Curation", bio: "Former fashion editor turned product curator with an impeccable eye for quality.", img: "https://i.pravatar.cc/200?u=sarah-chen", displayOrder: 2 },
      { name: "Marcus Reid", role: "CTO", bio: "Building the fastest and most reliable shopping platform in the industry.", img: "https://i.pravatar.cc/200?u=marcus-reid", displayOrder: 3 },
      { name: "Priya Patel", role: "Customer Experience", bio: "Dedicated to making every customer interaction memorable and seamless.", img: "https://i.pravatar.cc/200?u=priya-patel", displayOrder: 4 },
    ];
    const insertTeam = db.prepare(`
      INSERT INTO team_members (name, role, bio, img, displayOrder)
      VALUES (@name, @role, @bio, @img, @displayOrder)
    `);
    for (const t of seedTeam) insertTeam.run(t);
  }


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
