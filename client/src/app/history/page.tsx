"use client";
import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import AuthGuard from "@/components/AuthGuard";
import { fetchCampaigns, deleteCampaign, CampaignRow } from "@/lib/History";

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
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <AuthGuard>
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_15%_20%,rgba(120,98,255,0.35),transparent_40%),radial-gradient(900px_600px_at_80%_70%,rgba(28,49,220,0.55),transparent_45%),linear-gradient(180deg,rgba(10,15,25,0.85),rgba(10,15,25,0.9))]" />
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:3px_3px]" />
        </div>

        <Nav />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Campaign History</h1>
            <button
              onClick={loadCampaigns}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 backdrop-blur-md"
            >
              Refresh
            </button>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <p className="text-white/70">Loading campaigns...</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadCampaigns}
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                >
                  Try Again
                </button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center text-white/70">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white/80 mb-2">No campaigns yet</h3>
                <p className="text-white/60">Create your first campaign to see it here!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-white/90">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Campaign Name</th>
                      <th className="px-4 py-3 font-medium">Connection</th>
                      <th className="px-4 py-3 font-medium">Recipients</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Message Preview</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map((campaign) => {
                      const subjectLabel = Array.isArray(campaign.subject)
                        ? campaign.subject.join(", ")
                        : campaign.subject ?? "";
                      const messageLabel = Array.isArray(campaign.message)
                        ? campaign.message.join(" ")
                        : campaign.message ?? "";

                      return (
                        <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{campaign.campaign_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-white/80">{campaign.connection_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">
                                {campaign.email_list.length}
                              </span>
                              <span className="text-white/60">emails</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="max-w-[200px] truncate text-white/80"
                              title={subjectLabel}
                            >
                              {subjectLabel}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="max-w-[250px] truncate text-white/60"
                              title={messageLabel}
                            >
                              {messageLabel}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-white/70 text-xs">
                              {formatDate(campaign.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  alert(
                                    `Campaign: ${campaign.campaign_name}\n\nSubject: ${subjectLabel}\n\nMessage: ${messageLabel}\n\nRecipients: ${campaign.email_list.join(
                                      ", "
                                    )}`
                                  );
                                }}
                                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(campaign.id)}
                                className="rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats footer */}
          {campaigns.length > 0 && (
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Total campaigns: {campaigns.length}</span>
                <span>
                  Total emails sent:{" "}
                  {campaigns.reduce((sum, c) => sum + c.email_list.length, 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </AuthGuard>
  );
}