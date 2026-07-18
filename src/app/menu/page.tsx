"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Filter,
  X,
  Plus,
  Minus,
  Clock,
  ShoppingCart,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { cn, formatCurrency } from "@/lib/utils";
import { DietaryTag, MenuCardSkeleton, EmptyState, SearchInput } from "@/components/shared";
import type { MenuItemType, CategoryType, MenuVariant, MenuAddon } from "@/types";

// ─── Demo Data (used when API isn't available) ──────────────

const demoCategories: CategoryType[] = [
  { id: "cat-1", name: "Coffee & Beverages", slug: "coffee-beverages", image: null, sortOrder: 0 },
  { id: "cat-2", name: "Breakfast", slug: "breakfast", image: null, sortOrder: 1 },
  { id: "cat-3", name: "Mains", slug: "mains", image: null, sortOrder: 2 },
  { id: "cat-4", name: "Desserts", slug: "desserts", image: null, sortOrder: 3 },
  { id: "cat-5", name: "Specials", slug: "specials", image: null, sortOrder: 4 },
];

const demoItems: MenuItemType[] = [
  // Coffee & Beverages
  { id: "m1", categoryId: "cat-1", name: "Espresso Bloom", slug: "espresso-bloom", description: "Our signature double-shot espresso with house-made caramel drizzle", price: 249, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 5, sortOrder: 0, isSpecial: false, isBestseller: true, variants: [{ name: "Size", options: [{ label: "Small", priceModifier: 0 }, { label: "Medium", priceModifier: 40 }, { label: "Large", priceModifier: 80 }] }], addons: [{ name: "Extra Shot", price: 40 }, { name: "Oat Milk", price: 30 }, { name: "Caramel Syrup", price: 25 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m2", categoryId: "cat-1", name: "Iced Matcha Latte", slug: "iced-matcha-latte", description: "Premium Japanese matcha whisked with steamed milk, served over ice", price: 299, image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80", tags: ["VEG", "VEGAN"], isAvailable: true, prepTime: 5, sortOrder: 1, isSpecial: false, isBestseller: false, variants: [{ name: "Size", options: [{ label: "Regular", priceModifier: 0 }, { label: "Large", priceModifier: 50 }] }], addons: [{ name: "Extra Matcha", price: 50 }, { name: "Vanilla Syrup", price: 25 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m3", categoryId: "cat-1", name: "Cold Brew Coffee", slug: "cold-brew", description: "24-hour cold steeped coffee, smooth and rich with chocolate undertones", price: 219, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80", tags: ["VEG", "VEGAN"], isAvailable: true, prepTime: 3, sortOrder: 2, isSpecial: false, isBestseller: true, variants: [{ name: "Size", options: [{ label: "Regular", priceModifier: 0 }, { label: "Large", priceModifier: 40 }] }], addons: [{ name: "Vanilla Sweet Cream", price: 35 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m4", categoryId: "cat-1", name: "Rose Chai Latte", slug: "rose-chai-latte", description: "Aromatic Indian chai infused with rose, cardamom, and warm spices", price: 199, image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 7, sortOrder: 3, isSpecial: true, isBestseller: false, variants: [{ name: "Size", options: [{ label: "Regular", priceModifier: 0 }, { label: "Large", priceModifier: 40 }] }], addons: [{ name: "Extra Rose Syrup", price: 20 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m5", categoryId: "cat-1", name: "Fresh Orange Juice", slug: "fresh-oj", description: "Freshly squeezed oranges, no added sugar", price: 179, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80", tags: ["VEG", "VEGAN", "GLUTEN_FREE"], isAvailable: true, prepTime: 5, sortOrder: 4, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Ginger Shot", price: 20 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m6", categoryId: "cat-1", name: "Classic Hot Chocolate", slug: "hot-chocolate", description: "Belgian dark chocolate melted into steamed milk, topped with marshmallows", price: 259, image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 6, sortOrder: 5, isSpecial: false, isBestseller: false, variants: [{ name: "Size", options: [{ label: "Regular", priceModifier: 0 }, { label: "Large", priceModifier: 50 }] }], addons: [{ name: "Whipped Cream", price: 30 }, { name: "Hazelnut Syrup", price: 25 }], recipe: [], createdAt: "", updatedAt: "" },

  // Breakfast
  { id: "m7", categoryId: "cat-2", name: "Caramel French Toast", slug: "caramel-french-toast", description: "Brioche bread, caramelized banana, maple drizzle, fresh whipped cream", price: 349, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 15, sortOrder: 0, isSpecial: false, isBestseller: true, variants: [], addons: [{ name: "Extra Banana", price: 30 }, { name: "Ice Cream Scoop", price: 60 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m8", categoryId: "cat-2", name: "Avocado Toast", slug: "avocado-toast", description: "Sourdough, smashed avo, cherry tomatoes, feta, poached egg, everything bagel spice", price: 329, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 10, sortOrder: 1, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Extra Egg", price: 40 }, { name: "Smoked Salmon", price: 120 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m9", categoryId: "cat-2", name: "Full English Breakfast", slug: "full-english", description: "Eggs, bacon, sausages, baked beans, grilled tomato, mushrooms, toast", price: 449, image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80", tags: ["NON_VEG"], isAvailable: true, prepTime: 20, sortOrder: 2, isSpecial: false, isBestseller: false, variants: [{ name: "Eggs", options: [{ label: "Scrambled", priceModifier: 0 }, { label: "Fried", priceModifier: 0 }, { label: "Poached", priceModifier: 0 }] }], addons: [{ name: "Extra Bacon", price: 60 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m10", categoryId: "cat-2", name: "Acai Bowl", slug: "acai-bowl", description: "Blended acai, granola, fresh berries, banana, chia seeds, honey drizzle", price: 379, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80", tags: ["VEG", "VEGAN", "GLUTEN_FREE"], isAvailable: true, prepTime: 8, sortOrder: 3, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Protein Powder", price: 40 }, { name: "Peanut Butter", price: 30 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m11", categoryId: "cat-2", name: "Masala Omelette", slug: "masala-omelette", description: "Three-egg omelette with onions, tomatoes, green chillies, served with toast", price: 249, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80", tags: ["VEG", "SPICY"], isAvailable: true, prepTime: 12, sortOrder: 4, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Cheese", price: 40 }, { name: "Mushrooms", price: 30 }], recipe: [], createdAt: "", updatedAt: "" },

  // Mains
  { id: "m12", categoryId: "cat-3", name: "Smoked Chicken Panini", slug: "smoked-chicken-panini", description: "Hickory-smoked chicken, sun-dried tomato, mozzarella, basil pesto on ciabatta", price: 399, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80", tags: ["NON_VEG"], isAvailable: true, prepTime: 15, sortOrder: 0, isSpecial: false, isBestseller: true, variants: [], addons: [{ name: "Extra Cheese", price: 50 }, { name: "Fries", price: 80 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m13", categoryId: "cat-3", name: "Margherita Pizza", slug: "margherita-pizza", description: "Wood-fired thin crust, San Marzano tomato sauce, fresh mozzarella, basil", price: 449, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 20, sortOrder: 1, isSpecial: false, isBestseller: false, variants: [{ name: "Size", options: [{ label: "Regular (8\")", priceModifier: 0 }, { label: "Large (12\")", priceModifier: 150 }] }], addons: [{ name: "Olives", price: 40 }, { name: "Jalapenos", price: 30 }, { name: "Extra Cheese", price: 60 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m14", categoryId: "cat-3", name: "Grilled Chicken Salad", slug: "grilled-chicken-salad", description: "Mixed greens, grilled chicken, avocado, cherry tomatoes, balsamic vinaigrette", price: 379, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80", tags: ["NON_VEG", "GLUTEN_FREE"], isAvailable: true, prepTime: 12, sortOrder: 2, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Feta Cheese", price: 40 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m15", categoryId: "cat-3", name: "Paneer Tikka Wrap", slug: "paneer-tikka-wrap", description: "Tandoori-spiced paneer, mint chutney, pickled onions, crunchy slaw in a whole wheat wrap", price: 329, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80", tags: ["VEG", "SPICY"], isAvailable: true, prepTime: 15, sortOrder: 3, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Extra Paneer", price: 60 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m16", categoryId: "cat-3", name: "Truffle Mushroom Pasta", slug: "truffle-mushroom-pasta", description: "Penne in creamy truffle sauce with sautéed wild mushrooms and parmesan", price: 429, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 18, sortOrder: 4, isSpecial: true, isBestseller: false, variants: [], addons: [{ name: "Grilled Chicken", price: 100 }, { name: "Extra Truffle Oil", price: 60 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m17", categoryId: "cat-3", name: "Fish & Chips", slug: "fish-and-chips", description: "Beer-battered fish fillet, crispy fries, tartar sauce, mushy peas", price: 479, image: "https://images.unsplash.com/photo-1580217593608-61931ceac56e?w=600&q=80", tags: ["NON_VEG"], isAvailable: false, prepTime: 20, sortOrder: 5, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Coleslaw", price: 40 }], recipe: [], createdAt: "", updatedAt: "" },

  // Desserts
  { id: "m18", categoryId: "cat-4", name: "Matcha Tiramisu", slug: "matcha-tiramisu", description: "Japanese matcha layered with mascarpone cream and ladyfinger biscuits", price: 299, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 5, sortOrder: 0, isSpecial: false, isBestseller: true, variants: [], addons: [], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m19", categoryId: "cat-4", name: "Molten Chocolate Cake", slug: "molten-chocolate", description: "Warm Belgian chocolate fondant with a gooey center, served with vanilla ice cream", price: 349, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 15, sortOrder: 1, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Extra Ice Cream", price: 50 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m20", categoryId: "cat-4", name: "New York Cheesecake", slug: "ny-cheesecake", description: "Classic creamy cheesecake with berry compote and whipped cream", price: 279, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80", tags: ["VEG"], isAvailable: true, prepTime: 5, sortOrder: 2, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Extra Berry Sauce", price: 30 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m21", categoryId: "cat-4", name: "Affogato", slug: "affogato", description: "Vanilla bean gelato drowned in a shot of hot espresso", price: 229, image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80", tags: ["VEG", "GLUTEN_FREE"], isAvailable: true, prepTime: 3, sortOrder: 3, isSpecial: false, isBestseller: false, variants: [], addons: [{ name: "Extra Shot", price: 40 }, { name: "Biscotti", price: 35 }], recipe: [], createdAt: "", updatedAt: "" },

  // Specials
  { id: "m22", categoryId: "cat-5", name: "Chef's Lamb Burger", slug: "chefs-lamb-burger", description: "Spiced lamb patty, caramelized onions, aged cheddar, truffle aioli, brioche bun", price: 529, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", tags: ["NON_VEG", "SPICY"], isAvailable: true, prepTime: 20, sortOrder: 0, isSpecial: true, isBestseller: false, variants: [], addons: [{ name: "Fries", price: 80 }, { name: "Onion Rings", price: 70 }], recipe: [], createdAt: "", updatedAt: "" },
  { id: "m23", categoryId: "cat-5", name: "Saffron Risotto", slug: "saffron-risotto", description: "Arborio rice slow-cooked with saffron, white wine, parmesan, and grilled asparagus", price: 499, image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&q=80", tags: ["VEG", "GLUTEN_FREE"], isAvailable: true, prepTime: 25, sortOrder: 1, isSpecial: true, isBestseller: false, variants: [], addons: [{ name: "Grilled Prawns", price: 150 }], recipe: [], createdAt: "", updatedAt: "" },
];

// ─── Menu Card Component ────────────────────────────────────

function MenuCard({ item, onOpenDetail }: { item: MenuItemType; onOpenDetail: (item: MenuItemType) => void }) {
  const defaultFallback = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80";
  const [imgSrc, setImgSrc] = useState(item.image || defaultFallback);

  useEffect(() => {
    setImgSrc(item.image || defaultFallback);
  }, [item.image]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:shadow-espresso/5 transition-all duration-300 hover:-translate-y-1",
        !item.isAvailable && "opacity-60"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imgSrc}
          onError={() => setImgSrc(defaultFallback)}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.isBestseller && (
            <span className="px-2.5 py-1 bg-caramel text-espresso text-[10px] font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Bestseller
            </span>
          )}
          {item.isSpecial && (
            <span className="px-2.5 py-1 bg-espresso text-caramel text-[10px] font-bold rounded-full">
              Chef&apos;s Special
            </span>
          )}
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* Prep time */}
        {item.prepTime && item.isAvailable && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
            <Clock className="w-3 h-3" />
            {item.prepTime} min
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.map((tag) => (
            <DietaryTag key={tag} tag={tag} />
          ))}
        </div>

        <h3 className="font-serif text-base font-semibold line-clamp-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-caramel font-sans">
              {formatCurrency(item.price)}
            </span>
            {item.variants.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">onwards</span>
            )}
          </div>

          <button
            onClick={() => onOpenDetail(item)}
            disabled={!item.isAvailable}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold transition-all",
              item.isAvailable
                ? "bg-espresso text-cream hover:bg-espresso-500 hover:shadow-md"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {item.isAvailable ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Item Detail Modal ──────────────────────────────────────

function DetailModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: MenuItemType;
  onClose: () => void;
  onAddToCart: (item: MenuItemType, selectedVariant?: any, selectedAddons?: any[], note?: string) => void;
}) {
  const defaultFallback = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80";
  const [modalImgSrc, setModalImgSrc] = useState(item.image || defaultFallback);

  useEffect(() => {
    setModalImgSrc(item.image || defaultFallback);
  }, [item.image]);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // Initialize variants with first option
  useEffect(() => {
    const initial: Record<string, string> = {};
    item.variants.forEach((v: MenuVariant) => {
      if (v.options.length > 0) {
        initial[v.name] = v.options[0].label;
      }
    });
    setSelectedVariants(initial);
  }, [item]);

  // Calculate price
  const variantModifier = useMemo(() => {
    let mod = 0;
    item.variants.forEach((v: MenuVariant) => {
      const selected = selectedVariants[v.name];
      const option = v.options.find((o) => o.label === selected);
      if (option) mod += option.priceModifier;
    });
    return mod;
  }, [item.variants, selectedVariants]);

  const addonTotal = useMemo(() => {
    return item.addons
      .filter((a: MenuAddon) => selectedAddons.includes(a.name))
      .reduce((sum, a: MenuAddon) => sum + a.price, 0);
  }, [item.addons, selectedAddons]);

  const unitPrice = item.price + variantModifier + addonTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const variantLabel = Object.values(selectedVariants).join(", ") || null;

    addItem({
      menuItemId: item.id,
      menuItemName: item.name,
      menuItemImage: item.image,
      quantity,
      variant: variantLabel,
      variantPrice: item.price + variantModifier,
      addons: item.addons
        .filter((a: MenuAddon) => selectedAddons.includes(a.name))
        .map((a: MenuAddon) => ({ name: a.name, price: a.price })),
      note,
      unitPrice,
    });

    onClose();
    setTimeout(() => openCart(), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] bg-background rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-video flex-shrink-0">
          <Image
            src={modalImgSrc}
            onError={() => setModalImgSrc(defaultFallback)}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <DietaryTag key={tag} tag={tag} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold">{item.name}</h2>
            <p className="text-muted-foreground mt-2">{item.description}</p>
            {item.prepTime && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {item.prepTime} min prep time
              </div>
            )}
          </div>

          {/* Variants */}
          {item.variants.map((variant: MenuVariant) => (
            <div key={variant.name}>
              <h3 className="text-sm font-semibold mb-3">{variant.name}</h3>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [variant.name]: option.label,
                      }))
                    }
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                      selectedVariants[variant.name] === option.label
                        ? "bg-espresso text-cream border-espresso"
                        : "border-border hover:border-espresso/50 hover:bg-muted"
                    )}
                  >
                    {option.label}
                    {option.priceModifier > 0 && (
                      <span className="ml-1 text-xs opacity-70">
                        +{formatCurrency(option.priceModifier)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Addons */}
          {item.addons.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Add-ons</h3>
              <div className="space-y-2">
                {item.addons.map((addon: MenuAddon) => (
                  <label
                    key={addon.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      selectedAddons.includes(addon.name)
                        ? "border-caramel bg-caramel/5"
                        : "border-border hover:border-caramel/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          selectedAddons.includes(addon.name)
                            ? "bg-caramel border-caramel"
                            : "border-border"
                        )}
                      >
                        {selectedAddons.includes(addon.name) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{addon.name}</span>
                    </div>
                    <span className="text-sm text-caramel font-medium">
                      +{formatCurrency(addon.price)}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedAddons.includes(addon.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddons((prev) => [...prev, addon.name]);
                        } else {
                          setSelectedAddons((prev) => prev.filter((a) => a !== addon.name));
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Special Instructions</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., less sugar, no ice, allergies..."
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-3 bg-muted rounded-xl px-2 py-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-espresso text-cream rounded-xl font-semibold hover:bg-espresso-500 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            Add — {formatCurrency(totalPrice)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Menu Page ─────────────────────────────────────────

export default function MenuPage() {
  const [categories, setCategories] = useState<CategoryType[]>(demoCategories);
  const [items, setItems] = useState<MenuItemType[]>(demoItems);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [loading, setLoading] = useState(true);

  const allTags = ["VEG", "NON_VEG", "VEGAN", "GLUTEN_FREE", "SPICY"];

  // Fetch Menu from API
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.categories && data.data.categories.length > 0) {
          setCategories(data.data.categories);
        }
        if (data.data.items && data.data.items.length > 0) {
          const mapped = data.data.items.map((item: any) => ({
            ...item,
            tags: typeof item.tags === "string" ? item.tags.split(",").filter(Boolean) : item.tags || [],
          }));
          setItems(mapped);
        }
      }
    } catch (error) {
      console.error("Failed to load menu API, using local demo data.", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items;

    if (activeCategory !== "all") {
      const cat = categories.find((c) => c.slug === activeCategory);
      if (cat) result = result.filter((i) => i.categoryId === cat.id);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    if (activeTags.length > 0) {
      result = result.filter((i) =>
        activeTags.some((tag) => i.tags.includes(tag))
      );
    }

    return result;
  }, [items, activeCategory, searchQuery, activeTags, categories]);

  // Chef's specials
  const specials = items.filter((i) => i.isSpecial && i.isAvailable);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "AddaDotCom Café Menu",
    "description": "Premium Coffee, Beverages, Breakfast, Mains, and Desserts",
    "hasMenuSection": categories.map((cat) => ({
      "@type": "MenuSection",
      "name": cat.name,
      "hasMenuItem": filteredItems
        .filter((item) => item.categoryId === cat.id)
        .map((item) => ({
          "@type": "MenuItem",
          "name": item.name,
          "description": item.description,
          "offers": {
            "@type": "Offer",
            "price": item.price,
            "priceCurrency": "INR"
          }
        }))
    }))
  };

  return (
    <div className="pt-20 pb-24 lg:pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="bg-espresso text-cream py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              Our Menu
            </h1>
            <p className="text-cream-200/70 mt-3 max-w-md mx-auto">
              Crafted with love using the finest ingredients
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search menu items..."
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  activeTags.includes(tag)
                    ? "bg-caramel text-espresso border-caramel"
                    : "border-border hover:border-caramel/50"
                )}
              >
                {tag.replace("_", "-")}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeCategory === "all"
                  ? "bg-espresso text-cream shadow-md"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  activeCategory === cat.slug
                    ? "bg-espresso text-cream shadow-md"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chef's Specials */}
        {activeCategory === "all" && specials.length > 0 && !searchQuery && activeTags.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-caramel" />
              <h2 className="font-serif text-xl font-bold">Chef&apos;s Specials</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specials.map((item) => (
                <MenuCard key={item.id} item={item} onOpenDetail={setSelectedItem} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Search className="w-7 h-7 text-muted-foreground" />}
            title="No items found"
            description="Try adjusting your search or filters"
            action={
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTags([]);
                  setActiveCategory("all");
                }}
                className="px-5 py-2 bg-espresso text-cream rounded-full text-sm font-medium hover:bg-espresso-500 transition-colors"
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems
                .filter((i) => !i.isSpecial || activeCategory !== "all" || searchQuery || activeTags.length > 0)
                .map((item) => (
                  <MenuCard key={item.id} item={item} onOpenDetail={setSelectedItem} />
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
