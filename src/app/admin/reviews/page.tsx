"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Check, X, Trash2, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Review {
  id: string;
  author: string;
  email: string | null;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews?admin=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: nextStatus } : r)));

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: currentStatus } : r)));
        toast.error("Failed to update status");
      } else {
        toast.success(nextStatus ? "Review approved for public website!" : "Review unapproved");
      }
    } catch {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: currentStatus } : r)));
      toast.error("Error updating review");
    }
  };

  const handleDeleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  if (loading) {
    return (
      <div className="py-20 text-center flex items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        <span className="text-muted-foreground font-semibold">Loading Customer Reviews Queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-caramel" /> Customer Reviews & Ratings Moderation
          </h2>
          <p className="text-xs text-muted-foreground">
            Approve reviews submitted via public invoices to display them on the website landing page.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f ? "bg-espresso text-cream shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f} ({f === "all" ? reviews.length : f === "pending" ? reviews.filter((r) => !r.approved).length : reviews.filter((r) => r.approved).length})
            </button>
          ))}
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="p-12 border border-border rounded-2xl bg-card text-center space-y-2">
          <Star className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="font-semibold text-sm">No reviews found in this view</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          rev.rating >= star ? "text-amber-400 fill-amber-400" : "text-muted border-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm">{rev.author}</span>
                  {rev.email && <span className="text-xs text-muted-foreground">({rev.email})</span>}
                  <span className="text-[10px] text-muted-foreground">• {formatDate(rev.createdAt)}</span>
                </div>

                <p className="text-xs text-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/50">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleApproval(rev.id, rev.approved)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    rev.approved
                      ? "bg-green-500/10 border border-green-500/30 text-green-600 hover:bg-green-500/20"
                      : "bg-espresso text-cream hover:bg-espresso-500"
                  }`}
                >
                  {rev.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {rev.approved ? "Approved" : "Approve"}
                </button>
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
