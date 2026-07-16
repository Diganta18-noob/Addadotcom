"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { SearchInput, EmptyState, DietaryTag } from "@/components/shared";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  categoryName: string;
  image: string;
  isAvailable: boolean;
  tags: string[];
  variants: any[];
  addons: any[];
}

interface Category {
  id: string;
  name: string;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (data.success) {
        // Categories list
        const fetchedCats = (data.data.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
        }));
        setCategories(fetchedCats);

        // Menu items
        const fetchedItems = (data.data.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description || "",
          categoryId: item.categoryId,
          categoryName: item.category?.name || "Uncategorized",
          image: item.image || "",
          isAvailable: item.isAvailable,
          tags: typeof item.tags === "string" ? item.tags.split(",").filter(Boolean) : item.tags || [],
          variants: item.variants || [],
          addons: item.addons || [],
        }));
        setItems(fetchedItems);
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "ALL" || item.categoryName === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const nextAvailable = !item.isAvailable;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: nextAvailable } : i))
    );

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextAvailable }),
      });
      const data = await res.json();
      if (!data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, isAvailable: item.isAvailable } : i))
        );
        toast.error("Failed to update item availability");
        return;
      }
      toast.success(`${item.name} is now ${nextAvailable ? "Available" : "Sold Out"}`);
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isAvailable: item.isAvailable } : i))
      );
      toast.error("Failed to update item availability");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Menu item deleted");
      } else {
        toast.error("Failed to delete menu item");
      }
    } catch {
      toast.error("Error deleting menu item");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem?.name || currentItem.price === undefined || !currentItem.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const isEdit = !!currentItem.id;
      const url = isEdit ? `/api/menu/${currentItem.id}` : "/api/menu";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: currentItem.categoryId,
          name: currentItem.name,
          price: currentItem.price,
          description: currentItem.description,
          image: currentItem.image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
          tags: currentItem.tags ? currentItem.tags.join(",") : "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? "Menu item updated" : "Menu item created");
        setIsEditing(false);
        setCurrentItem(null);
        fetchMenu();
      } else {
        toast.error(data.error || "Failed to save item");
      }
    } catch {
      toast.error("Error saving menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleAddClick = () => {
    setCurrentItem({
      name: "",
      price: 0,
      description: "",
      categoryId: categories[0]?.id || "",
      tags: ["VEG"],
      image: "",
    });
    setIsEditing(true);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        <span className="ml-3 text-muted-foreground">Loading menu items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selectedCategory === "ALL" ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                selectedCategory === cat.name ? "bg-espresso text-cream" : "bg-muted hover:bg-muted/80"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => { setLoading(true); fetchMenu(); }}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-md">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search menu items by name or description..."
        />
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState title="No items found" description="Try creating a new menu item or clearing your search filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={cn(
                "rounded-2xl border border-border bg-card overflow-hidden flex flex-col group relative transition-all hover:shadow-lg",
                !item.isAvailable && "opacity-70"
              )}
            >
              {/* Image Preview */}
              <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={cn(
                      "p-1.5 rounded-full backdrop-blur-md shadow-md text-white transition-colors",
                      item.isAvailable ? "bg-green-600/80 hover:bg-green-600" : "bg-red-600/80 hover:bg-red-600"
                    )}
                    title={item.isAvailable ? "Mark Out of Stock" : "Mark Available"}
                  >
                    {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-serif font-bold text-base line-clamp-1">{item.name}</h3>
                  <span className="font-sans font-bold text-caramel whitespace-nowrap">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-4">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2 py-0.5 bg-muted text-[10px] rounded-full text-muted-foreground font-medium">
                    {item.categoryName}
                  </span>
                  {item.tags.map((tag) => (
                    <DietaryTag key={tag} tag={tag} />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 border border-border rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isEditing && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-background p-6 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-serif text-xl font-bold mb-4">
                {currentItem.id ? "Edit Menu Item" : "Add Menu Item"}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Item Name *</label>
                  <input
                    type="text"
                    value={currentItem.name || ""}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Price (INR) *</label>
                    <input
                      type="number"
                      value={currentItem.price || 0}
                      onChange={(e) => setCurrentItem((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Category *</label>
                    <select
                      value={currentItem.categoryId || ""}
                      onChange={(e) => setCurrentItem((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Description *</label>
                  <textarea
                    value={currentItem.description || ""}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Image URL</label>
                  <input
                    type="text"
                    value={currentItem.image || ""}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Dietary Tags</label>
                  <div className="flex gap-2 flex-wrap">
                    {["VEG", "NON_VEG", "VEGAN", "GLUTEN_FREE", "SPICY"].map((tag) => {
                      const isSelected = currentItem.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const tags = currentItem.tags || [];
                            const updated = tags.includes(tag)
                              ? tags.filter((t) => t !== tag)
                              : [...tags, tag];
                            setCurrentItem((prev) => ({ ...prev, tags: updated }));
                          }}
                          className={cn(
                            "px-3 py-1.5 border rounded-full text-xs font-medium transition-all",
                            isSelected
                              ? "bg-caramel text-espresso border-caramel"
                              : "border-border hover:bg-muted"
                          )}
                        >
                          {tag.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-espresso text-cream rounded-xl text-sm font-semibold hover:bg-espresso-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
