"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Star,
  Coffee,
  UtensilsCrossed,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { HeroTitle } from "@/components/animations/HeroTitle";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { useScrollReveal } from "@/components/animations/useScrollReveal";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { NumberTicker } from "@/components/animations/NumberTicker";
import { CardSpotlight } from "@/components/animations/CardSpotlight";
import { ShinyText } from "@/components/animations/ShinyText";
import { Marquee } from "@/components/animations/Marquee";
import { SegmentedTabs } from "@/components/animations/SegmentedTabs";
import { MouseAura } from "@/components/animations/MouseAura";
import { TextReveal } from "@/components/animations/TextReveal";
import { FloatingDock } from "@/components/animations/FloatingDock";

// ─── Hero Section ───────────────────────────────────────────

function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-espresso">
      {/* Background Image */}
      <div className="absolute -top-32 -bottom-32 inset-x-0 z-0 will-change-transform" style={{ transform: "translateZ(0)" }}>
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
      </div>

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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-caramel/20 backdrop-blur-md text-caramel rounded-full text-sm font-medium mb-6 border border-caramel/40 shadow-sm">
              <Sparkles className="w-4 h-4 text-caramel animate-pulse" />
              <ShinyText className="font-semibold text-caramel">
                Kolkata&apos;s Premier Specialty Café &amp; Adda
              </ShinyText>
            </span>
          </motion.div>

          <HeroTitle
            text="AddaDotCom"
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            delay={0.4}
          />

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
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <MagneticButton>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-caramel text-espresso rounded-full text-sm font-semibold hover:bg-caramel-300 transition-all shadow-lg shadow-caramel/30 hover:shadow-xl hover:shadow-caramel/40"
              >
                <UtensilsCrossed className="w-4 h-4" />
                View Menu
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link
                href="/reserve"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
              >
                <CalendarDays className="w-4 h-4" />
                Reserve a Table
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
              >
                <Coffee className="w-4 h-4" />
                Order Online
              </Link>
            </MagneticButton>
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

// ─── Ticker / Highlights Marquee (Animata style) ────────────

const marqueeHighlights = [
  { text: "⭐ 4.9 Rating (2,500+ Google Reviews)", tag: "Top Rated" },
  { text: "☕ 100% Single-Origin Arabica Roasts", tag: "Artisan Coffee" },
  { text: "🥐 Fresh French Viennoiserie Daily", tag: "Bakery" },
  { text: "🌿 Farm-To-Cup Ethically Sourced Beans", tag: "Sustainable" },
  { text: "⚡ Contactless Table QR Ordering", tag: "Fast & Easy" },
  { text: "🏆 Best Specialty Café in Salt Lake 2026", tag: "Award Winner" },
  { text: "🍰 Handcrafted Basque Cheesecakes", tag: "Desserts" },
];

function HighlightsMarquee() {
  return (
    <div className="py-3 bg-espresso-950 border-y border-caramel/20 overflow-hidden text-cream relative z-10 shadow-lg">
      <Marquee pauseOnHover duration="35s" repeat={4}>
        {marqueeHighlights.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-cream-50/5 border border-cream-50/10 backdrop-blur-md mx-2 hover:border-caramel/40 transition-colors"
          >
            <span className="text-xs font-semibold text-cream-100 whitespace-nowrap">
              {item.text}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-caramel/20 text-caramel">
              {item.tag}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}

// ─── About Section ──────────────────────────────────────────

function AboutSection() {
  const statsRef = useScrollReveal<HTMLDivElement>(0.12);

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

            <div ref={statsRef} className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
              {[
                { rawValue: 2019, label: "Est. Year", suffix: "" },
                { rawValue: 15000, label: "Happy Guests", suffix: "+" },
                { rawValue: 4.8, label: "Rating Score", suffix: " ★", decimalPlaces: 1 },
              ].map((stat) => (
                <div key={stat.label} data-reveal className="h-full">
                  <CardSpotlight
                    spotlightColor="rgba(212, 160, 86, 0.15)"
                    className="p-3 sm:p-5 text-center rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 hover:border-caramel/40 h-full flex flex-col items-center justify-center transition-all"
                  >
                    <div className="font-serif text-2xl sm:text-3xl font-bold text-caramel">
                      <NumberTicker
                        value={stat.rawValue}
                        suffix={stat.suffix}
                        decimalPlaces={stat.decimalPlaces || 0}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                      {stat.label}
                    </div>
                  </CardSpotlight>
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
    description: "Our signature double-shot espresso infused with house-made salted caramel and velvet foam",
    price: 249,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    tag: "Bestseller #1",
    category: "coffee",
    hasBeam: true,
  },
  {
    name: "Caramel French Toast",
    description: "Fluffy brioche, caramelized bananas, Madagascar vanilla maple drizzle, chantilly cream",
    price: 349,
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
    tag: "Chef's Pick",
    category: "food",
  },
  {
    name: "Smoked Chicken Panini",
    description: "Hickory-smoked chicken breast, sun-dried tomato tapenade, buffalo mozzarella, fresh pesto",
    price: 399,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
    tag: "Popular Lunch",
    category: "food",
  },
  {
    name: "Matcha Tiramisu",
    description: "Ceremonial Japanese Uji matcha layered with mascarpone mousse and coffee-soaked savoiardi",
    price: 299,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    tag: "Artisan Dessert",
    category: "dessert",
  },
  {
    name: "Iced Spanish Cortado",
    description: "Rich espresso cut with warm condensed milk and cold single-origin micro-foam",
    price: 269,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80",
    tag: "Barista Special",
    category: "coffee",
  },
  {
    name: "Basque Burnt Cheesecake",
    description: "Silky caramelized Spanish cheesecake with wild forest berry compote and citrus zest",
    price: 329,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80",
    tag: "Must Try",
    category: "dessert",
  },
];

const dishCategories = [
  { id: "all", label: "All Favorites" },
  { id: "coffee", label: "Brews & Coffee", icon: Coffee },
  { id: "food", label: "Gourmet Bites", icon: UtensilsCrossed },
  { id: "dessert", label: "Signature Sweets", icon: Sparkles },
];

function FeaturedSection() {
  const dishesGridRef = useScrollReveal<HTMLDivElement>(0.12);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredDishes = selectedCategory === "all"
    ? featuredDishes
    : featuredDishes.filter((dish) => dish.category === selectedCategory);

  return (
    <section className="py-20 lg:py-28 bg-muted/30 noise-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
            Curated Menu
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
            Chef &amp; Barista Highlights
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            Handcrafted beverages and gourmet plates loved by our regulars
          </p>

          {/* Skiper UI style Segmented Tabs */}
          <div className="mt-8 flex justify-center">
            <SegmentedTabs
              tabs={dishCategories}
              activeTab={selectedCategory}
              onChange={setSelectedCategory}
              layoutId="dish-category-pill"
            />
          </div>
        </div>

        <div ref={dishesGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredDishes.map((dish) => (
            <div key={dish.name} data-reveal className="group h-full">
              <CardSpotlight
                spotlightColor="rgba(212, 160, 86, 0.16)"
                className="h-full rounded-2xl overflow-hidden border border-border/80 bg-card hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {dish.hasBeam && (
                  <BorderBeam
                    size={160}
                    duration={8}
                    colorFrom="#D4A056"
                    colorTo="#7A5650"
                  />
                )}

                <div>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-espresso/80 backdrop-blur-md text-caramel text-xs font-bold rounded-full border border-caramel/30">
                      {dish.tag}
                    </span>
                  </div>

                  <div className="p-5 pb-2">
                    <h3 className="font-serif text-xl font-bold group-hover:text-caramel transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <span className="text-xl font-bold text-caramel font-sans">
                      {formatCurrency(dish.price)}
                    </span>
                    <Link
                      href="/menu"
                      className="px-5 py-2 bg-espresso text-cream text-xs font-semibold rounded-full hover:bg-espresso-500 transition-colors shadow-sm"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </CardSpotlight>
            </div>
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
  const testimonialsGridRef = useScrollReveal<HTMLDivElement>(0.15);
  const [reviewsList, setReviewsList] = useState(testimonials);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetched) {
          setFetched(true);
          fetch("/api/reviews?limit=6")
            .then((r) => r.json())
            .then(({ data }) => {
              if (Array.isArray(data) && data.length > 0) {
                setReviewsList(
                  data.map((r: any) => ({
                    name: r.author || "Valued Customer",
                    role: "Verified Guest",
                    avatar: (r.author || "VG").slice(0, 2).toUpperCase(),
                    rating: r.rating || 5,
                    text: r.comment || r.text || "Loved the experience at AddaDotCom!",
                  }))
                );
              }
            })
            .catch(() => {});
        }
      },
      { rootMargin: "300px" }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [fetched]);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
            What People Say
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
            Guest Reviews
          </h2>
        </div>

        <div ref={testimonialsGridRef} className="grid md:grid-cols-3 gap-6">
          {reviewsList.map((testimonial, idx) => (
            <div key={idx} data-reveal className="h-full">
              <CardSpotlight
                spotlightColor="rgba(212, 160, 86, 0.12)"
                className="p-6 rounded-2xl border border-border/80 bg-card hover:shadow-xl transition-all h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-caramel text-caramel" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                    &quot;{testimonial.text}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-espresso flex items-center justify-center text-cream text-xs font-bold border border-caramel/20">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardSpotlight>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Location Section ───────────────────────────────────────

function LocationSection() {
  const contactInfoRef = useScrollReveal<HTMLDivElement>(0.15);
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMapVisible(true);
      },
      { rootMargin: "200px" }
    );
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <span className="text-caramel text-sm font-semibold tracking-wider uppercase">
                Visit Us
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
                Find Us Here
              </h2>
            </div>

            <div ref={contactInfoRef} className="space-y-6">
              <div data-reveal className="flex items-start gap-4">
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

              <div data-reveal className="flex items-start gap-4">
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

              <div data-reveal className="flex items-start gap-4">
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

            <div className="flex flex-wrap items-center gap-4">
              <MagneticButton>
                <Link
                  href="/reserve"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-espresso text-cream rounded-full text-sm font-semibold hover:bg-espresso-500 transition-colors"
                >
                  <CalendarDays className="w-4 h-4" />
                  Reserve a Table
                </Link>
              </MagneticButton>
              <a
                href="https://maps.google.com/?q=Salt+Lake+Sector+V,+Kolkata,+West+Bengal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-semibold hover:bg-muted transition-colors"
              >
                <MapPin className="w-4 h-4 text-caramel" />
                Get Directions
              </a>
            </div>
          </div>

          <motion.div
            ref={mapRef}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border shadow-lg h-[400px] lg:h-[500px]"
          >
            {mapVisible ? (
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
            ) : (
              <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                <MapPin className="w-8 h-8 text-muted-foreground/30" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ─────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success(`🎉 Subscribed! We'll send updates to ${email}`);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

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

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-green-400 font-semibold text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Thank you for subscribing!
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubscribe}
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
          )}
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
    <div className="scroll-smooth relative">
      <MouseAura />
      <FloatingDock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <HighlightsMarquee />
      <AboutSection />
      <FeaturedSection />
      <TestimonialsSection />
      <LocationSection />
      <NewsletterSection />
    </div>
  );
}
