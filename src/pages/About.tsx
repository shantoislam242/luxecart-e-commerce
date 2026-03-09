import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
    ShieldCheck, Truck, RotateCcw, Star, Users, Globe,
    Award, Heart, ChevronRight, ArrowRight, Zap,
} from "lucide-react";

interface TeamMember { id: number; name: string; role: string; img: string; bio: string; displayOrder: number; }


const values = [
    {
        icon: Star,
        title: "Premium Quality",
        description: "Every product in our catalog is hand-picked and quality-tested before it reaches you.",
        color: "bg-amber-50 text-amber-600",
    },
    {
        icon: ShieldCheck,
        title: "100% Authentic",
        description: "We partner directly with brands and authorized distributors to guarantee authenticity.",
        color: "bg-blue-50 text-blue-600",
    },
    {
        icon: Truck,
        title: "Fast Delivery",
        description: "Same-day dispatch and express shipping options to get your orders to you quickly.",
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        icon: RotateCcw,
        title: "Easy Returns",
        description: "Not satisfied? Our 30-day hassle-free return policy has you covered.",
        color: "bg-violet-50 text-violet-600",
    },
    {
        icon: Heart,
        title: "Customer First",
        description: "Every decision we make starts with asking: how does this help our customers?",
        color: "bg-pink-50 text-pink-600",
    },
    {
        icon: Globe,
        title: "Sustainability",
        description: "We work with eco-conscious brands and use minimal, recyclable packaging.",
        color: "bg-teal-50 text-teal-600",
    },
];

const stats = [
    { value: "50K+", label: "Happy Customers", icon: Users },
    { value: "10K+", label: "Products Curated", icon: Award },
    { value: "99.2%", label: "Satisfaction Rate", icon: Star },
    { value: "4.8★", label: "Average Rating", icon: Zap },
];

export default function AboutPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);

    useEffect(() => {
        fetch("/api/team")
            .then((r) => r.json())
            .then((data) => setTeam(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    return (
        <div className="space-y-0 pb-20 -mt-8">
            {/* ── Hero ── */}
            <section className="relative h-[480px] md:h-[560px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=70&w=1400&fm=webp"
                    alt="About LuxeCart"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent" />
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
                            <span className="text-white font-medium">About Us</span>
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            Our Story
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                            About Us
                        </h1>
                        <p className="text-emerald-400 text-2xl font-semibold italic font-serif">
                            Premium. Curated. Trusted.
                        </p>
                        <p className="text-white/80 text-lg max-w-xl leading-relaxed">
                            We're on a mission to make premium shopping accessible to everyone — with hand-picked products, unbeatable service, and a passion for quality.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Our Story ── */}
            <section className="container mx-auto px-4 pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Founded 2020</span>
                        <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                            We Started with a Simple Belief
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            LuxeCart was born from a frustration with low-quality products flooding the market. We believed that everyone deserves access to premium goods without the guesswork — so we built a platform that curates only the best.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            Our team of 50+ experts works tirelessly to source, test, and verify every single product before it goes live on our platform. If it doesn't meet our standards, it doesn't make the cut.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                to="/"
                                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500 active:scale-95 transition-all"
                            >
                                <span>Shop Now</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/blog"
                                className="inline-flex items-center space-x-2 border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:border-emerald-400 transition-all"
                            >
                                Read Our Blog
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=70&w=700&fm=webp"
                            alt="Our Team"
                            className="w-full rounded-[40px] shadow-2xl"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-slate-100">
                            <p className="text-3xl font-bold text-slate-900">6+</p>
                            <p className="text-sm text-slate-500 font-medium">Years of Excellence</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="bg-slate-900 mt-20 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map(({ value, label, icon: Icon }, idx) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <Icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                <p className="text-4xl font-bold text-white">{value}</p>
                                <p className="text-slate-400 text-sm mt-1">{label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-14">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">What We Stand For</span>
                    <h2 className="text-4xl font-bold text-slate-900 mt-3">Our Core Values</h2>
                    <p className="text-slate-500 mt-3 max-w-xl mx-auto">
                        These principles guide every decision we make, from choosing products to handling returns.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {values.map(({ icon: Icon, title, description, color }, idx) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.07 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Team ── */}
            <section className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">The People</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-3">Meet Our Team</h2>
                        <p className="text-slate-500 mt-3">Passionate experts dedicated to bringing you the best.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map(({ id, name, role, img, bio }, idx) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow text-center group"
                            >
                                <div className="relative overflow-hidden h-52">
                                    {img && (
                                        <img
                                            src={img}
                                            alt={name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            referrerPolicy="no-referrer"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6 space-y-2">
                                    <h3 className="font-bold text-slate-900 text-lg">{name}</h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">{role}</p>
                                    <p className="text-slate-500 text-sm leading-relaxed">{bio}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="container mx-auto px-4 py-20">
                <div className="bg-emerald-600 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-50" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Ready to Start Shopping?
                        </h2>
                        <p className="text-emerald-100 text-lg">
                            Browse thousands of curated products and find exactly what you're looking for.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center space-x-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 active:scale-95 transition-all shadow-xl"
                        >
                            <span>Explore Products</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
