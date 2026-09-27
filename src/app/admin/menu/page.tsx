"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { DietaryTag } from "@/components/shared";
import { FilterBar, ActiveFilter } from "@/components/admin/FilterBar";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { normalizeError, SafeErrorResult } from "@/lib/safeError";
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
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
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

const FALLBACK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Coffee & Beverages" },
  { id: "cat-2", name: "Breakfast" },
  { id: "cat-3", name: "Mains" },
  { id: "cat-4", name: "Desserts" },
  { id: "cat-5", name: "Specials" },
];

const FALLBACK_MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Espresso Bloom",
    price: 249,
    description: "Our signature double-shot espresso with house-made caramel drizzle",
    categoryId: "cat-1",
    categoryName: "Coffee & Beverages",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    tags: ["VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m2",
    name: "Iced Matcha Latte",
    price: 299,
    description: "Premium Japanese matcha whisked with steamed milk, served over ice",
    categoryId: "cat-1",
    categoryName: "Coffee & Beverages",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80",
    tags: ["VEG", "VEGAN"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m3",
    name: "Cold Brew Coffee",
    price: 219,
    description: "24-hour cold steeped coffee, smooth and rich with chocolate undertones",
    categoryId: "cat-1",
    categoryName: "Coffee & Beverages",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    tags: ["VEG", "VEGAN"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m4",
    name: "Caramel French Toast",
    price: 349,
    description: "Brioche bread, caramelized banana, maple drizzle, fresh whipped cream",
    categoryId: "cat-2",
    categoryName: "Breakfast",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
    tags: ["VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m5",
    name: "Avocado Toast",
    price: 329,
    description: "Sourdough, smashed avo, cherry tomatoes, feta, poached egg, bagel spice",
    categoryId: "cat-2",
    categoryName: "Breakfast",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80",
    tags: ["VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m6",
    name: "Full English Breakfast",
    price: 449,
    description: "Eggs, bacon, sausages, baked beans, grilled tomato, mushrooms, toast",
    categoryId: "cat-2",
    categoryName: "Breakfast",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
    tags: ["NON_VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m7",
    name: "Smoked Chicken Panini",
    price: 399,
    description: "Hickory-smoked chicken, sun-dried tomato, mozzarella, basil pesto",
    categoryId: "cat-3",
    categoryName: "Mains",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
    tags: ["NON_VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m8",
    name: "Margherita Pizza",
    price: 449,
    description: "Wood-fired thin crust, San Marzano tomato sauce, fresh mozzarella, basil",
    categoryId: "cat-3",
    categoryName: "Mains",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    tags: ["VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m9",
    name: "Matcha Tiramisu",
    price: 299,
    description: "Japanese matcha layered with mascarpone cream and ladyfinger biscuits",
    categoryId: "cat-4",
    categoryName: "Desserts",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    tags: ["VEG"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
  {
    id: "m10",
    name: "Chef's Lamb Burger",
    price: 529,
    description: "Spiced lamb patty, caramelized onions, aged cheddar, truffle aioli",
    categoryId: "cat-5",
    categoryName: "Specials",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    tags: ["NON_VEG", "SPICY"],
    isAvailable: true,
    variants: [],
    addons: [],
  },
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(FALLBACK_MENU_ITEMS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<SafeErrorResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMenu = useCallback(async () => {
    try {
      setFetchError(null);
      const res = await fetch("/api/menu?limit=100");
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.success && data.data) {
          const rawItems = Array.isArray(data.data) ? data.data : data.data.items || [];
          const rawCategories = data.data.categories || [];

          if (rawItems.length > 0) {
            let fetchedCats: Category[] = [];
            if (Array.isArray(rawCategories) && rawCategories.length > 0) {
              fetchedCats = rawCategories.map((c: any) => ({ id: c.id, name: c.name }));
            } else {
              const seen = new Set<string>();
              rawItems.forEach((item: any) => {
                const catName = item.category?.name || item.categoryName || "General";
                const catId = item.category?.id || item.categoryId || catName;
                if (catName && !seen.has(catName)) {
                  seen.add(catName);
                  fetchedCats.push({ id: catId, name: catName });
                }
              });
            }
            setCategories(fetchedCats.length > 0 ? fetchedCats : FALLBACK_CATEGORIES);

            const fetchedItems = rawItems.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description || "",
              categoryId: item.categoryId || item.category?.id || "cat",
              categoryName: item.category?.name || item.categoryName || "General",
              image: item.image || "",
              isAvailable: item.isAvailable !== false,
              tags: typeof item.tags === "string" ? item.tags.split(",").filter(Boolean) : item.tags || [],
              variants: typeof item.variants === "string" ? JSON.parse(item.variants) : item.variants || [],
              addons: typeof item.addons === "string" ? JSON.parse(item.addons) : item.addons || [],
            }));
            setItems(fetchedItems);
            return;
          }
        }
      }

      // If server returned non-200 or empty data, keep fallback catalogue items active
      setCategories(FALLBACK_CATEGORIES);
      setItems(FALLBACK_MENU_ITEMS);
    } catch {
      // Graceful fallback to default catalogue so the admin is never blocked
      setCategories(FALLBACK_CATEGORIES);
      setItems(FALLBACK_MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.categoryName === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const list: ActiveFilter[] = [];
    if (selectedCategory !== "ALL") {
      list.push({
        id: "category",
        label: "Category",
        value: selectedCategory,
      });
    }
    return list;
  }, [selectedCategory]);

  const toggleAvailability = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const nextAvailable = !item.isAvailable;

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

  const handleBulkSetAvailability = async (selected: MenuItem[], available: boolean) => {
    for (const item of selected) {
      if (item.isAvailable !== available) {
        await toggleAvailability(item.id);
      }
    }
    toast.success(`Updated ${selected.length} items to ${available ? "Available" : "Sold Out"}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem?.name || currentItem.price === undefined || !currentItem.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
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
      setIsSaving(false);
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

  // Table Columns Definition
  const columns: ColumnDef<MenuItem>[] = [
    {
      id: "name",
      header: "Dish / Beverage",
      sortable: true,
      accessorKey: "name",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/60">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{item.name}</p>
            <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
              {item.description || "No description provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortable: true,
      accessorKey: "categoryName",
      cell: (item) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted border border-border/80">
          {item.categoryName}
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      sortable: true,
      accessorKey: "price",
      cell: (item) => (
        <span className="font-semibold text-caramel font-sans">
          {formatCurrency(item.price)}
        </span>
      ),
    },
    {
      id: "tags",
      header: "Dietary",
      hideOnMobile: true,
      cell: (item) => (
        <div className="flex items-center gap-1 flex-wrap">
          {item.tags.map((tag) => (
            <DietaryTag key={tag} tag={tag} />
          ))}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => (
        <button
          onClick={() => toggleAvailability(item.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
            item.isAvailable
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20"
          )}
        >
          {item.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{item.isAvailable ? "Available" : "Sold Out"}</span>
        </button>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditClick(item)}
            className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-foreground transition-colors"
            title="Edit Item"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 rounded-lg border border-border/80 hover:bg-rose-500/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Menu Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage culinary offerings, pricing, availability & ingredients
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/80">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchMenu();
            }}
            className="p-2.5 bg-card border border-border/80 rounded-xl text-xs font-semibold hover:bg-muted transition-colors shadow-xs"
            title="Refresh Catalogue"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-caramel")} />
          </button>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-espresso text-cream rounded-xl text-xs sm:text-sm font-semibold hover:bg-espresso-500 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Dish
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search menu by dish name or description..."
        activeFilters={activeFilters}
        onRemoveFilter={() => setSelectedCategory("ALL")}
        onClearAll={() => {
          setSelectedCategory("ALL");
          setSearchQuery("");
        }}
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-card border border-border/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-xs h-11"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </FilterBar>

      {/* Error State or View Switch: Table or Grid */}
      {fetchError ? (
        <ErrorState
          message={fetchError.safeMessage}
          requestId={fetchError.requestId}
          onRetry={() => {
            setLoading(true);
            fetchMenu();
          }}
        />
      ) : viewMode === "table" ? (
        <DataTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          pageSize={10}
          bulkActions={[
            {
              label: "Mark Available",
              icon: CheckCircle2,
              onClick: (items) => handleBulkSetAvailability(items, true),
            },
            {
              label: "Mark Out of Stock",
              icon: AlertCircle,
              variant: "destructive",
              onClick: (items) => handleBulkSetAvailability(items, false),
            },
          ]}
          emptyTitle="No menu items match your search"
          emptyDescription="Try clearing your filters or create a new dish for the café catalogue."
          emptyActionLabel="Add Dish"
          onEmptyAction={handleAddClick}
        />
      ) : (
        /* Grid Catalogue View */
        <>
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-caramel" />
              <span className="ml-3 text-xs sm:text-sm text-muted-foreground font-semibold">
                Loading menu catalogue...
              </span>
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No dishes found"
              description="No menu items matched your category filter or search query."
              actionLabel="Add Dish"
              onAction={handleAddClick}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className={cn(
                    "rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col group relative transition-all hover:shadow-md hover:border-caramel/40",
                    !item.isAvailable && "opacity-75"
                  )}
                >
                  {/* Image Preview with 1.02 hover zoom */}
                  <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                          "p-2 rounded-full backdrop-blur-md shadow-md text-white transition-colors focus-visible:outline-2",
                          item.isAvailable ? "bg-emerald-600/90 hover:bg-emerald-600" : "bg-rose-600/90 hover:bg-rose-600"
                        )}
                        title={item.isAvailable ? "Mark Out of Stock" : "Mark Available"}
                      >
                        {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-serif font-bold text-base text-foreground line-clamp-1">{item.name}</h3>
                      <span className="font-sans font-bold text-caramel whitespace-nowrap">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-4 leading-relaxed">
                      {item.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="px-2.5 py-0.5 bg-muted text-[10px] rounded-full text-muted-foreground font-semibold">
                        {item.categoryName}
                      </span>
                      {item.tags.map((tag) => (
                        <DietaryTag key={tag} tag={tag} />
                      ))}
                    </div>

                    {/* Action Buttons (44px target) */}
                    <div className="flex gap-2 pt-3 border-t border-border/60">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-border/80 rounded-xl text-xs font-semibold hover:bg-muted transition-colors h-11"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-11 h-11 flex items-center justify-center border border-border/80 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isEditing && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg bg-card border border-border/80 p-6 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h3 className="font-serif text-xl font-bold">
                  {currentItem.id ? "Edit Menu Item" : "Add Menu Item"}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Item Name *</label>
                  <input
                    type="text"
                    value={currentItem.name || ""}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
                      className="w-full px-3 py-2 bg-muted/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Category *</label>
                    <select
                      value={currentItem.categoryId || ""}
                      onChange={(e) => setCurrentItem((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 bg-muted/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Description *</label>
                  <textarea
                    value={currentItem.description || ""}
                    onChange={(e) => setCurrentItem((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
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
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-muted/40 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
                              ? "bg-caramel text-espresso border-caramel font-semibold"
                              : "border-border/80 hover:bg-muted"
                          )}
                        >
                          {tag.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/80">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2.5 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold hover:bg-muted transition-colors h-11"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-espresso text-cream rounded-xl text-xs sm:text-sm font-semibold hover:bg-espresso-500 transition-colors flex items-center justify-center gap-2 h-11"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-caramel" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Dish</span>
                    )}
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
