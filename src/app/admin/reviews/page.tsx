"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Check,
  X,
  Trash2,
  Loader2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { normalizeError, SafeErrorResult } from "@/lib/safeError";
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
  const [fetchError, setFetchError] = useState<SafeErrorResult | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchReviews = async () => {
    try {
      setFetchError(null);
      const res = await fetch("/api/reviews?admin=true");
      if (!res.ok) {
        throw new Error("SERVER_ERROR");
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("INVALID_CONTENT_TYPE");
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data);
      } else {
        setFetchError(normalizeError(data?.message || data?.error, "Failed to load customer reviews."));
      }
    } catch (err) {
      setFetchError(normalizeError(err, "Unable to load customer feedback queue at this time."));
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
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await handleToggleApproval(id, false);
    }
    setSelectedIds(new Set());
    toast.success(`Approved ${ids.length} reviews`);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filter === "pending" && r.approved) return false;
      if (filter === "approved" && !r.approved) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAuthor = r.author.toLowerCase().includes(q);
        const matchesComment = r.comment.toLowerCase().includes(q);
        return matchesAuthor || matchesComment;
      }
      return true;
    });
  }, [reviews, filter, searchQuery]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const pendingCount = useMemo(() => {
    return reviews.filter((r) => !r.approved).length;
  }, [reviews]);

  if (loading && reviews.length === 0) {
    return (
      <div className="py-24 text-center flex items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        <span className="text-muted-foreground font-semibold text-sm">
          Loading Customer Reviews Queue...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Rating Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-caramel" />
            Customer Reviews & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xl">
            Audit guest ratings submitted via digital invoices before publishing to the public showcase.
          </p>
        </div>

        {/* Rating Scorecard Cards */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-card border border-border/80 text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Avg Rating
            </span>
            <div className="flex items-center justify-center gap-1 font-serif text-lg font-bold text-caramel">
              <Star className="w-4 h-4 fill-caramel text-caramel" />
              <span>{avgRating} / 5</span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-card border border-border/80 text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Pending
            </span>
            <span className="font-serif text-lg font-bold text-amber-500">
              {pendingCount}
            </span>
          </div>

          <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-card border border-border/80 text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Total
            </span>
            <span className="font-serif text-lg font-bold text-foreground">
              {reviews.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by author or review text..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent h-11 shadow-xs"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/80 self-start sm:self-auto">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all h-9 flex items-center gap-1.5 ${
                filter === f
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{f}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-bold">
                {f === "all"
                  ? reviews.length
                  : f === "pending"
                  ? pendingCount
                  : reviews.length - pendingCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List or Error State */}
      {fetchError ? (
        <ErrorState
          message={fetchError.safeMessage}
          requestId={fetchError.requestId}
          onRetry={() => {
            setLoading(true);
            fetchReviews();
          }}
        />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews in this queue"
          description="There are currently no guest reviews matching your selected status filter or search query."
        />
      ) : (
        <div className="grid gap-3.5">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-card border border-border/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-caramel/30 transition-colors"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          rev.rating >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-bold text-sm text-foreground">{rev.author}</span>
                  {rev.email && (
                    <span className="text-xs text-muted-foreground">({rev.email})</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    • {formatDate(rev.createdAt)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 italic bg-muted/30 p-3 rounded-xl border border-border/50 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Moderation Controls (44px target) */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleToggleApproval(rev.id, rev.approved)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors h-11 min-w-[100px] justify-center ${
                    rev.approved
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20"
                      : "bg-espresso text-cream hover:bg-espresso-500 shadow-xs"
                  }`}
                >
                  {rev.approved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {rev.approved ? "Approved" : "Approve"}
                </button>
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/80 rounded-xl transition-colors"
                  title="Delete review"
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
