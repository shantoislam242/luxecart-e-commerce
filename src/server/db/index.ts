import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Product, BlogPost, TeamMember } from "../models/index.ts";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/luxecart");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDatabase();
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // ── Seed Admin User ──────────────────────────────────────────────────────
    const adminExists = await User.findOne({ email: "admin@luxecart.com" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "Admin User",
        email: "admin@luxecart.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user seeded: admin@luxecart.com / admin123");
    }

    // ── Seed Products ────────────────────────────────────────────────────────
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const seedProducts = [
        {
          name: "Premium Wireless Headphones",
          description: "High-quality sound with noise cancellation.",
          category: "Electronics",
          price: 299.99,
          stock: 50,
          images: ["https://picsum.photos/seed/headphones/600/400"]
        },
        {
          name: "Minimalist Leather Watch",
          description: "Elegant design for every occasion.",
          category: "Accessories",
          price: 149.50,
          stock: 30,
          images: ["https://picsum.photos/seed/watch/600/400"]
        },
        {
          name: "Smart Fitness Tracker",
          description: "Monitor your health and activity 24/7.",
          category: "Electronics",
          price: 79.99,
          stock: 100,
          images: ["https://picsum.photos/seed/tracker/600/400"]
        }
      ];
      await Product.insertMany(seedProducts);
      console.log("Products seeded");
    }

    // ── Seed Blog Posts ──────────────────────────────────────────────────────
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
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
          published: true,
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
          published: true,
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
          published: true,
        },
      ];
      await BlogPost.insertMany(seedBlogs);
      console.log("Blogs seeded");
    }

    // ── Seed Team Members ────────────────────────────────────────────────────
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      const seedTeam = [
        { name: "Alex Johnson", role: "Founder & CEO", bio: "10+ years in e-commerce. Passionate about delivering premium experiences.", img: "https://i.pravatar.cc/200?u=alex-johnson", displayOrder: 1 },
        { name: "Sarah Chen", role: "Head of Curation", bio: "Former fashion editor turned product curator with an impeccable eye for quality.", img: "https://i.pravatar.cc/200?u=sarah-chen", displayOrder: 2 },
        { name: "Marcus Reid", role: "CTO", bio: "Building the fastest and most reliable shopping platform in the industry.", img: "https://i.pravatar.cc/200?u=marcus-reid", displayOrder: 3 },
        { name: "Priya Patel", role: "Customer Experience", bio: "Dedicated to making every customer interaction memorable and seamless.", img: "https://i.pravatar.cc/200?u=priya-patel", displayOrder: 4 },
      ];
      await TeamMember.insertMany(seedTeam);
      console.log("Team members seeded");
    }
  } catch (error: any) {
    console.error("Seeding error:", error.message);
  }
};

