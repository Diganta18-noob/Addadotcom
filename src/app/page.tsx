"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Coffee,
  UtensilsCrossed,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

// ─── Hero Section ───────────────────────────────────────────

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
      {/* Background Image */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80"
          alt="Café background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-espresso/30" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-caramel/20 backdrop-blur-sm text-caramel rounded-full text-sm font-medium mb-6 border border-caramel/30">
              <Sparkles className="w-4 h-4" />
              Welcome to
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Adda
            <span className="text-caramel">Dot</span>
            Com
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-lg"
          >
            Where every cup tells a story and every meal brings people together.
            Experience the warmth of authentic café culture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-caramel text-espresso rounded-full text-sm font-semibold hover:bg-caramel-300 transition-all shadow-lg shadow-caramel/30 hover:shadow-xl hover:shadow-caramel/40 hover:-translate-y-0.5"
            >
              <UtensilsCrossed className="w-4 h-4" />
              View Menu
            </Link>
            <Link
              href="/reserve"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <CalendarDays className="w-4 h-4" />
              Reserve a Table
            </Link>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <Coffee className="w-4 h-4" />
              Order Online
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── About Section ──────────────────────────────────────────

function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
                  alt="Inside AddaDotCom café"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden border-4 border-background shadow-xl hidden sm:block">
                <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"
                    alt="Signature coffee"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
              Our Story
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              A Place Where{" "}
              <span className="text-gradient">Stories Brew</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Born from a passion for perfect coffee and a love for bringing
                people together, AddaDotCom is more than just a café — it&apos;s a
                gathering place. &quot;Adda&quot; means a lively hangout, and we&apos;ve built
                this space to be exactly that.
              </p>
              <p>
                Every bean is ethically sourced and roasted in-house. Our chefs
                craft each dish with seasonal, locally-sourced ingredients. From
                our signature Espresso Bloom to our famous Caramel French Toast,
                everything is made with love and care.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "2019", label: "Est." },
                { value: "15K+", label: "Happy Guests" },
                { value: "4.8", label: "Rating ★" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-muted/50">
                  <div className="font-serif text-2xl font-bold text-caramel">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Dishes ────────────────────────────────────────

const featuredDishes = [
  {
    name: "Espresso Bloom",
    description: "Our signature double-shot espresso with house-made caramel",
    price: 249,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    tag: "Bestseller",
  },
  {
    name: "Caramel French Toast",
    description: "Brioche bread, caramelized banana, maple drizzle, whipped cream",
    price: 349,
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
    tag: "Chef's Pick",
  },
  {
    name: "Smoked Chicken Panini",
    description: "Hickory-smoked chicken, sun-dried tomato, mozzarella, pesto",
    price: 399,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
    tag: "Popular",
  },
  {
    name: "Matcha Tiramisu",
    description: "Japanese matcha layered with mascarpone and ladyfinger",
    price: 299,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    tag: "New",
  },
];

function FeaturedSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredDishes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
            Must Try
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
            Our Bestsellers
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Handpicked favourites loved by our regulars
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDishes.map((dish, index) => (
            <motion.div
              key={dish.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group"
            >
              <div className="rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:shadow-espresso/5 transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-caramel text-espresso text-xs font-bold rounded-full">
                    {dish.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {dish.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-caramel font-sans">
                      {formatCurrency(dish.price)}
                    </span>
                    <Link
                      href="/menu"
                      className="px-4 py-2 bg-espresso text-cream text-xs font-semibold rounded-full hover:bg-espresso-500 transition-colors"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-caramel font-semibold hover:text-caramel-600 transition-colors group"
          >
            View Full Menu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ───────────────────────────────────────────

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Food Blogger",
    avatar: "PS",
    rating: 5,
    text: "The best coffee in Kolkata, hands down. The Espresso Bloom is absolutely divine, and the ambiance is perfect for both work and leisure.",
  },
  {
    name: "Rahul Verma",
    role: "Regular Customer",
    avatar: "RV",
    rating: 5,
    text: "We celebrate every weekend here. The staff remembers our names, the food is consistently amazing, and the vibe is unmatched.",
  },
  {
    name: "Ananya Patel",
    role: "Photographer",
    avatar: "AP",
    rating: 5,
    text: "Not just a café, it's an experience. Every dish is Instagram-worthy, and the Caramel French Toast? Life-changing!",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
            What People Say
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
            Guest Reviews
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-caramel text-caramel" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-espresso flex items-center justify-center text-cream text-xs font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Location Section ───────────────────────────────────────

function LocationSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
                Visit Us
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
                Find Us Here
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-caramel/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-caramel" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Café Street, Salt Lake Sector V,
                    <br />
                    Kolkata, West Bengal 700091
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-caramel/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-caramel" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Opening Hours</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Mon – Fri: 7:00 AM – 11:00 PM</p>
                    <p>Saturday: 8:00 AM – 11:30 PM</p>
                    <p>Sunday: 8:00 AM – 10:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-caramel/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-caramel" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Contact</h3>
                  <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                  <p className="text-sm text-muted-foreground">hello@addadotcom.cafe</p>
                </div>
              </div>
            </div>

            <Link
              href="/reserve"
              className="inline-flex items-center gap-2 px-8 py-3 bg-espresso text-cream rounded-full text-sm font-semibold hover:bg-espresso-500 transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Reserve a Table
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border shadow-lg h-[400px] lg:h-[500px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.062086438075!2d88.42831201533!3d22.572646290874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275ade687271b%3A0xe5ec827d04fef40!2sSalt%20Lake%20Sector%20V%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AddaDotCom Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ─────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 lg:py-28 bg-espresso text-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-caramel/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-sage/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Coffee className="w-10 h-10 text-caramel mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Stay in the Loop
          </h2>
          <p className="text-cream-200/70 mb-8 max-w-lg mx-auto">
            Subscribe to get exclusive offers, new menu updates, and early
            access to special events.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-full bg-cream-200/10 text-cream placeholder:text-cream-200/40 border border-cream-200/20 focus:outline-none focus:ring-2 focus:ring-caramel/50 text-sm"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-caramel text-espresso rounded-full text-sm font-semibold hover:bg-caramel-300 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Home Page ─────────────────────────────────────────

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "AddaDotCom",
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    "@id": "http://localhost:3000",
    "url": "http://localhost:3000",
    "telephone": "+91 98765 43210",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Café Street, Salt Lake Sector V",
      "addressLocality": "Kolkata",
      "addressRegion": "West Bengal",
      "postalCode": "700091",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:00",
        "closes": "23:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "23:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "08:00",
        "closes": "22:00"
      }
    ],
    "menu": "http://localhost:3000/menu"
  };

  return (
    <div className="scroll-smooth">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AboutSection />
      <FeaturedSection />
      <TestimonialsSection />
      <LocationSection />
      <NewsletterSection />
    </div>
  );
}
