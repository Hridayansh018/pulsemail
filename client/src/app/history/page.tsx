"use client";
import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import AuthGuard from "@/components/AuthGuard";
import { fetchCampaigns, deleteCampaign, CampaignRow } from "@/lib/History";
import {
  MdRefresh,
  MdOutlineVisibility,
  MdDeleteOutline,
  MdOutlineInbox,
  MdOutlineGroup,
  MdOutlineSchedule,
} from "react-icons/md";

export default function HistoryPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (e: any) {
      console.error("Failed to load campaigns:", e?.message || e);
      setError("Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      console.error("Delete failed:", e?.message || e);
      alert("Failed to delete campaign. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const labelOf = (v: string[] | string | undefined, sep: string) =>
    Array.isArray(v) ? v.join(sep) : v ?? "";

  const viewCampaign = (c: CampaignRow) => {
    alert(
      `Campaign: ${c.campaign_name}\n\nSubject: ${labelOf(c.subject, ", ")}\n\nMessage: ${labelOf(
        c.message,
        " "
      )}\n\nRecipients: ${c.email_list.join(", ")}`
    );
  };

  const totalEmails = campaigns.reduce((sum, c) => sum + c.email_list.length, 0);

  return (
    <AuthGuard>
      <Nav />

      <main className="mx-auto flex w-full max-w-[1280px] flex-grow flex-col gap-8 px-5 pb-28 pt-24 md:px-16 md:pb-16">
        {/* Metrics */}
        <section className="flex flex-col gap-6 md:flex-row">
          <div className="glass-card flex flex-1 flex-col gap-4 p-8">
            <span className="mono-label text-on-surface-variant">Total Campaigns</span>
            <span className="text-5xl font-bold tracking-tighter text-primary md:text-6xl">
              {campaigns.length}
            </span>
          </div>
          <div className="glass-card flex flex-1 flex-col gap-4 p-8">
            <span className="mono-label text-on-surface-variant">Total Emails Sent</span>
            <span className="text-5xl font-bold tracking-tighter text-primary md:text-6xl">
              {totalEmails.toLocaleString()}
            </span>
          </div>
        </section>

        {/* Header */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-3xl font-semibold tracking-tight text-primary">Campaign History</h2>
            <button onClick={loadCampaigns} className="btn-outline rounded-full text-sm">
              <MdRefresh className="h-[18px] w-[18px]" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="glass-card flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white" />
                <p className="mono-label text-on-surface-variant">Loading campaigns...</p>
              </div>
            </div>
          ) : error ? (
            <div className="glass-card py-16 text-center">
              <p className="mb-4 text-error">{error}</p>
              <button onClick={loadCampaigns} className="btn-outline mx-auto rounded-full text-sm">
                <MdRefresh className="h-[18px] w-[18px]" />
                Try Again
              </button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="glass-card py-16 text-center">
              <MdOutlineInbox className="mx-auto mb-4 h-16 w-16 text-white/20" />
              <h3 className="mb-2 text-xl font-semibold text-on-surface">No campaigns yet</h3>
              <p className="text-on-surface-variant">Launch your first campaign to see it here.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="glass-card hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="mono-label p-4 font-normal text-on-surface-variant">Campaign Name</th>
                        <th className="mono-label p-4 font-normal text-on-surface-variant">Connection</th>
                        <th className="mono-label p-4 font-normal text-on-surface-variant">Subject Preview</th>
                        <th className="mono-label p-4 font-normal text-on-surface-variant">Recipients</th>
                        <th className="mono-label p-4 font-normal text-on-surface-variant">Sent At</th>
                        <th className="mono-label p-4 text-right font-normal text-on-surface-variant">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-on-surface">
                      {campaigns.map((c) => {
                        const subjectLabel = labelOf(c.subject, ", ");
                        return (
                          <tr key={c.id} className="group transition-colors hover:bg-surface-variant/40">
                            <td className="p-4 font-medium text-primary">{c.campaign_name}</td>
                            <td className="p-4 text-on-surface-variant">{c.connection_name}</td>
                            <td className="max-w-xs truncate p-4 text-on-surface-variant" title={subjectLabel}>
                              {subjectLabel}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <MdOutlineGroup className="h-[14px] w-[14px] text-on-surface" />
                                <span className="mono-label text-on-surface">{c.email_list.length}</span>
                              </span>
                            </td>
                            <td className="mono-label p-4 text-on-surface-variant">{formatDate(c.created_at)}</td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  onClick={() => viewCampaign(c)}
                                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-on-surface transition-colors hover:bg-white/10"
                                >
                                  <MdOutlineVisibility className="h-[18px] w-[18px]" />
                                  <span className="mono-label normal-case">View</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(c.id)}
                                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-primary"
                                  aria-label="Delete"
                                >
                                  <MdDeleteOutline className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-4 md:hidden">
                {campaigns.map((c) => (
                  <div key={c.id} className="glass-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-on-surface">{c.campaign_name}</h3>
                      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        <MdOutlineGroup className="h-[14px] w-[14px] text-on-surface" />
                        <span className="mono-label text-on-surface">{c.email_list.length}</span>
                      </span>
                    </div>
                    <p className="mt-2 truncate text-on-surface-variant">
                      Subject: {labelOf(c.subject, ", ") || "—"}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-on-surface-variant">
                      <MdOutlineSchedule className="h-4 w-4" />
                      <span className="mono-label normal-case">{formatDate(c.created_at)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                      <button
                        onClick={() => viewCampaign(c)}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-on-surface transition-colors hover:bg-white/10"
                      >
                        <MdOutlineVisibility className="h-[18px] w-[18px]" />
                        <span className="mono-label normal-case">View</span>
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-primary"
                        aria-label="Delete"
                      >
                        <MdDeleteOutline className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}
