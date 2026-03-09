import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    address: { type: String },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema], // Embedded reviews since it's common in MERN
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });

export const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        }
    ],
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    orderStatus: { type: String, default: 'Processing' },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);

const subscriptionSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    status: { type: String, default: 'active' },
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String },
    category: { type: String, default: 'Lifestyle' },
    author: { type: String, default: 'Admin' },
    authorImg: { type: String, default: 'https://i.pravatar.cc/60?u=admin' },
    coverImg: { type: String },
    readTime: { type: String, default: '5 min read' },
    published: { type: Boolean, default: true },
}, { timestamps: true });

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String },
    img: { type: String },
    displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
