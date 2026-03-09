import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
    ChevronRight, Mail, Phone, MapPin, Clock, Send,
    MessageSquare, CheckCircle, Facebook, Twitter, Instagram,
} from "lucide-react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200)); // Simulate send
        setSubmitted(true);
        setLoading(false);
    };

    const contactInfo = [
        {
            icon: MapPin,
            label: "Visit Us",
            value: "123 Commerce Way, Suite 100, Digital City, DC 12345",
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            icon: Phone,
            label: "Call Us",
            value: "+1 (555) 123-4567",
            href: "tel:+15551234567",
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: Mail,
            label: "Email Us",
            value: "support@luxecart.com",
            href: "mailto:support@luxecart.com",
            color: "bg-violet-50 text-violet-600",
        },
        {
            icon: Clock,
            label: "Business Hours",
            value: "Mon–Fri: 9 AM – 6 PM EST",
            color: "bg-amber-50 text-amber-600",
        },
    ];

    const faqs = [
        { q: "How long does shipping take?", a: "Standard shipping takes 3–5 business days. Express shipping is available at checkout for 1–2 day delivery." },
        { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy. Items must be in original condition. Contact us to initiate a return." },
        { q: "Are all products authentic?", a: "Yes! Every product is sourced directly from brands or authorized distributors. We guarantee 100% authenticity." },
        { q: "Can I track my order?", a: "Absolutely. Once your order ships, you'll receive a tracking link via email. You can also view it in your profile." },
    ];

    return (
        <div className="space-y-0 pb-20 -mt-8">
            {/* ── Hero ── */}
            <section className="relative h-[480px] md:h-[560px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=70&w=1400&fm=webp"
                    alt="Contact Us"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 md:px-16 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white font-medium">Contact</span>
                        </div>
                        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>We're Here to Help</span>
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                            Contact Us
                        </h1>
                        <p className="text-blue-300 text-2xl font-semibold italic font-serif">
                            Let's Talk
                        </p>
                        <p className="text-white/80 text-lg max-w-xl leading-relaxed">
                            Have a question, feedback, or need support? Our team responds within 24 hours — usually much faster.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Contact Info Cards ── */}
            <section className="container mx-auto px-4 pt-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {contactInfo.map(({ icon: Icon, label, value, href, color }, idx) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                            {href ? (
                                <a href={href} className="text-slate-700 font-medium hover:text-emerald-600 transition-colors text-sm">
                                    {value}
                                </a>
                            ) : (
                                <p className="text-slate-700 font-medium text-sm">{value}</p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Form & Map ── */}
            <section className="container mx-auto px-4 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Send a Message</h2>
                        <p className="text-slate-500 text-sm mb-8">Fill out the form and we'll get back to you within 24 hours.</p>

                        {submitted ? (
                            <div className="text-center py-12 space-y-4">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                                <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                                <p className="text-slate-500">Thank you for reaching out. We'll respond to your message shortly.</p>
                                <button
                                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                    className="mt-4 text-emerald-600 font-bold hover:underline"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Order issue, product question..."
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Message</label>
                                    <textarea
                                        rows={5}
                                        required
                                        placeholder="Tell us how we can help..."
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Map placeholder + Social */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-6"
                    >
                        {/* Map embed placeholder */}
                        <div className="relative rounded-[40px] overflow-hidden h-72 bg-slate-100 border border-slate-200">
                            <iframe
                                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060%2C40.7128%2C-73.9960%2C40.7228&layer=mapnik"
                                className="w-full h-full border-0"
                                title="Office Location"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 pointer-events-none rounded-[40px] ring-1 ring-inset ring-slate-200" />
                        </div>

                        {/* FAQ */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
                            <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                {faqs.map(({ q, a }) => (
                                    <div key={q} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                        <p className="text-sm font-bold text-slate-800 mb-1">{q}</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="bg-slate-900 rounded-3xl p-8 space-y-4">
                            <h3 className="text-white font-bold">Follow Us</h3>
                            <div className="flex space-x-3">
                                {[
                                    { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                                    { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                                    { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                                ].map(({ Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="w-10 h-10 bg-white/10 hover:bg-emerald-500 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                            <p className="text-slate-400 text-sm">We're active on social media and reply to DMs daily.</p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
