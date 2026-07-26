"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Play,
  RotateCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Layers,
  Filter,
  Trash2,
  Edit,
  Power,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerEvent: string;
  conditions: any[];
  actions: any[];
  dedupeKey: string | null;
  dedupeWindow: number;
  createdAt: string;
  _count?: { executions: number };
}

interface LogEntry {
  id: string;
  workflowId: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED" | "RETRYING";
  triggerEvent: string;
  triggeredBy: string | null;
  payload: any;
  result: any;
  error: string | null;
  retryCount: number;
  durationMs: number | null;
  createdAt: string;
  workflow?: { id: string; name: string; triggerEvent: string };
}

const EVENT_TYPES = [
  "ORDER_CREATED",
  "ORDER_STATUS_CHANGED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "INVENTORY_LOW",
  "RESERVATION_CREATED",
  "RESERVATION_CANCELLED",
  "REVIEW_SUBMITTED",
  "TABLE_OCCUPIED",
  "TABLE_FREED",
];

const ACTION_TYPES = [
  "BROADCAST_SSE",
  "FREE_TABLE",
  "OCCUPY_TABLE",
  "MARK_TABLE_NEEDS_CLEANING",
  "MARK_TABLE_RESERVED",
  "AWARD_LOYALTY_POINTS",
  "UPDATE_ORDER_STATUS",
  "UPDATE_INVENTORY",
  "NOTIFY_ADMIN_TOAST",
  "INVALIDATE_CACHE",
];

export default function AutomationAdminPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<Workflow> | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggerEvent: "ORDER_CREATED",
    dedupeWindow: 60,
    conditionsStr: "[]",
    actionsStr: JSON.stringify(
      [
        {
          type: "NOTIFY_ADMIN_TOAST",
          params: { message: "⚡ Custom trigger executed: {{orderNumber}}", toastType: "info" },
        },
      ],
      null,
      2
    ),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wfRes, logsRes] = await Promise.all([
        fetch("/api/automation"),
        fetch(`/api/automation/logs${statusFilter !== "ALL" ? `?status=${statusFilter}` : ""}`),
      ]);

      const wfData = await wfRes.json();
      if (wfData.success && Array.isArray(wfData.data)) {
        setWorkflows(wfData.data);
      }

      const logsData = await logsRes.json();
      if (logsData.success && logsData.data?.logs) {
        setLogs(logsData.data.logs);
      }
    } catch (error) {
      console.error("Error fetching automation data:", error);
      toast.error("Failed to load automation engine state");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleToggle = async (workflow: Workflow) => {
    const newStatus = !workflow.isActive;
    // Optimistic UI update
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflow.id ? { ...w, isActive: newStatus } : w))
    );

    try {
      const res = await fetch(`/api/automation/${workflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Workflow "${workflow.name}" ${newStatus ? "activated" : "deactivated"}`);
      } else {
        fetchData();
        toast.error("Failed to update status");
      }
    } catch {
      fetchData();
      toast.error("Error toggling workflow status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete workflow "${name}"?`)) return;

    try {
      const res = await fetch(`/api/automation/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
        toast.success("Workflow deleted");
      } else {
        toast.error("Failed to delete workflow");
      }
    } catch {
      toast.error("Error deleting workflow");
    }
  };

  const handleRetryLog = async (log: LogEntry) => {
    setRetryingId(log.id);
    try {
      const res = await fetch(`/api/automation/${log.workflowId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: log.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data.message || "Re-triggered workflow execution");
        setTimeout(fetchData, 1000);
      } else {
        toast.error(data.message || "Retry failed");
      }
    } catch {
      toast.error("Error sending retry request");
    } finally {
      setRetryingId(null);
    }
  };

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let conditionsParsed = [];
      let actionsParsed = [];
      try {
        conditionsParsed = JSON.parse(formData.conditionsStr);
      } catch {
        toast.error("Invalid JSON format in conditions");
        return;
      }
      try {
        actionsParsed = JSON.parse(formData.actionsStr);
      } catch {
        toast.error("Invalid JSON format in actions");
        return;
      }

      const isEdit = !!editingWorkflow?.id;
      const url = isEdit ? `/api/automation/${editingWorkflow.id}` : "/api/automation";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          triggerEvent: formData.triggerEvent,
          dedupeWindow: Number(formData.dedupeWindow),
          conditions: conditionsParsed,
          actions: actionsParsed,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? "Rule updated!" : "New automation rule created!");
        setIsModalOpen(false);
        setEditingWorkflow(null);
        fetchData();
      } else {
        toast.error(data.message || "Failed to save workflow");
      }
    } catch {
      toast.error("Error saving workflow");
    }
  };

  const openCreateModal = () => {
    setEditingWorkflow(null);
    setFormData({
      name: "",
      description: "",
      triggerEvent: "ORDER_CREATED",
      dedupeWindow: 60,
      conditionsStr: "[]",
      actionsStr: JSON.stringify(
        [
          {
            type: "NOTIFY_ADMIN_TOAST",
            params: { message: "⚡ Trigger fired: {{orderNumber}}", toastType: "info" },
          },
        ],
        null,
        2
      ),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (wf: Workflow) => {
    setEditingWorkflow(wf);
    setFormData({
      name: wf.name,
      description: wf.description || "",
      triggerEvent: wf.triggerEvent,
      dedupeWindow: wf.dedupeWindow || 60,
      conditionsStr: JSON.stringify(wf.conditions || [], null, 2),
      actionsStr: JSON.stringify(wf.actions || [], null, 2),
    });
    setIsModalOpen(true);
  };

  // Stats calculations
  const totalWorkflows = workflows.length;
  const activeCount = workflows.filter((w) => w.isActive).length;
  const totalLogs = logs.length;
  const failedLogsCount = logs.filter((l) => l.status === "FAILED").length;
  const avgDuration =
    logs.length > 0
      ? Math.round(
          logs.reduce((acc, l) => acc + (l.durationMs || 0), 0) / logs.length
        )
      : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-caramel/30 to-amber-500/20 border border-caramel/40 flex items-center justify-center text-caramel shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Automation Engine
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Event-driven workflow rules, runtime triggers & execution logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-caramel text-espresso font-bold text-xs hover:bg-caramel/90 transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Rule
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Rules</span>
            <Layers className="w-4 h-4 text-caramel" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {activeCount}
            </span>
            <span className="text-xs text-muted-foreground">/ {totalWorkflows} total</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Runs</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {totalLogs}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Failed (Recent)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
            {failedLogsCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-green-500" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {avgDuration} <span className="text-sm font-sans font-normal text-muted-foreground">ms</span>
          </div>
        </div>
      </div>

      {/* Workflow Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-caramel" /> Configured Automation Rules
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {workflows.length} rules registered
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {workflows.map((wf) => {
            const conditionsCount = Array.isArray(wf.conditions) ? wf.conditions.length : 0;
            const actionsCount = Array.isArray(wf.actions) ? wf.actions.length : 0;

            return (
              <div
                key={wf.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4",
                  wf.isActive
                    ? "bg-card border-border hover:border-caramel/40"
                    : "bg-muted/30 border-border/50 opacity-70"
                )}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-base text-foreground">{wf.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-caramel/10 text-caramel border border-caramel/30 text-[10px] font-bold font-mono">
                      ⚡ {wf.triggerEvent}
                    </span>
                    {wf.dedupeWindow > 0 && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Dedupe: {wf.dedupeWindow}s
                      </span>
                    )}
                  </div>
                  {wf.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {wf.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1">
                    <span>
                      Conditions: <strong>{conditionsCount === 0 ? "Always Run" : `${conditionsCount} rules`}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Actions: <strong>{actionsCount} steps</strong>
                    </span>
                    {wf._count?.executions !== undefined && (
                      <>
                        <span>•</span>
                        <span>
                          Executions: <strong>{wf._count.executions} runs</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleToggle(wf)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                      wf.isActive
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 hover:bg-green-500/20"
                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                    )}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {wf.isActive ? "Active" : "Disabled"}
                  </button>

                  <button
                    onClick={() => openEditModal(wf)}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit Rule"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(wf.id, wf.name)}
                    className="p-2 rounded-xl border border-border hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Logs Table */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-caramel" /> Runtime Execution History
          </h2>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["ALL", "SUCCESS", "FAILED", "SKIPPED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold border transition-all shrink-0",
                  statusFilter === st
                    ? "bg-caramel text-espresso border-caramel shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:border-caramel/40"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Status</th>
                  <th className="p-4">Workflow Name</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Triggered By</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No automation logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-max",
                            log.status === "SUCCESS" && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
                            log.status === "FAILED" && "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
                            log.status === "SKIPPED" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          )}
                        >
                          {log.status === "SUCCESS" && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === "FAILED" && <XCircle className="w-3 h-3" />}
                          {log.status === "SKIPPED" && <Clock className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {log.workflow?.name || "Deleted Workflow"}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-caramel">
                        {log.triggerEvent}
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-[11px]">
                        {log.triggeredBy || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {log.durationMs ? `${log.durationMs}ms` : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-foreground transition-colors font-semibold"
                        >
                          Details
                        </button>
                        {log.status === "FAILED" && (
                          <button
                            onClick={() => handleRetryLog(log)}
                            disabled={retryingId === log.id}
                            className="px-2.5 py-1 rounded-lg bg-caramel text-espresso font-bold hover:bg-caramel/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <RotateCw className={cn("w-3 h-3", retryingId === log.id && "animate-spin")} /> Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold">Execution Log Detail</h3>
                <p className="text-xs text-muted-foreground">ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-muted-foreground">Event Payload:</span>
                <pre className="mt-1 p-3 rounded-xl bg-neutral-900 text-green-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              {selectedLog.result && (
                <div>
                  <span className="font-bold text-muted-foreground">Action Execution Results:</span>
                  <pre className="mt-1 p-3 rounded-xl bg-neutral-900 text-blue-300 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.result, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <span className="font-bold text-red-500">Failure Reason:</span>
                  <p className="mt-1 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono">
                    {selectedLog.error}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-espresso text-cream rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold">
                  {editingWorkflow?.id ? "Edit Automation Rule" : "Create Automation Rule"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define event triggers, filtering conditions, and actions
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkflow} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Low Inventory Alert"
                  className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl font-semibold focus:outline-none focus:border-caramel text-sm"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Broadcast toast when inventory reaches threshold"
                  className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl font-medium focus:outline-none focus:border-caramel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Trigger Event *</label>
                  <select
                    value={formData.triggerEvent}
                    onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl font-bold focus:outline-none focus:border-caramel"
                  >
                    {EVENT_TYPES.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Deduplication Window (seconds)</label>
                  <input
                    type="number"
                    value={formData.dedupeWindow}
                    onChange={(e) => setFormData({ ...formData, dedupeWindow: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl font-semibold focus:outline-none focus:border-caramel"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Conditions JSON (Array)</label>
                <textarea
                  rows={3}
                  value={formData.conditionsStr}
                  onChange={(e) => setFormData({ ...formData, conditionsStr: e.target.value })}
                  className="w-full p-3 bg-neutral-900 text-cream font-mono text-[11px] rounded-xl focus:outline-none focus:border-caramel"
                />
                <span className="text-[10px] text-muted-foreground">
                  Example: <code>[{`{"field":"total","operator":"gt","value":1000}`}]</code>
                </span>
              </div>

              <div>
                <label className="font-bold block mb-1">Actions JSON (Array)</label>
                <textarea
                  rows={5}
                  value={formData.actionsStr}
                  onChange={(e) => setFormData({ ...formData, actionsStr: e.target.value })}
                  className="w-full p-3 bg-neutral-900 text-cream font-mono text-[11px] rounded-xl focus:outline-none focus:border-caramel"
                />
                <span className="text-[10px] text-muted-foreground">
                  Supported Action Types: {ACTION_TYPES.join(", ")}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-border rounded-xl font-semibold text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-caramel text-espresso font-bold text-xs rounded-xl hover:bg-caramel/90 shadow-md"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
