"use client";
import Nav from "@/components/Nav";
import toast, { Toaster } from 'react-hot-toast';
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  fetchConnections,
  createConnection as apiCreateConnection,
  Connection,
} from "@/lib/COnnection";
import { logCampaign } from "@/lib/History";

import AuthGuard from "@/components/AuthGuard";

type Row = Record<string, string>;

type CampaignPayload = {
  email_list: string[];
  HOST_EMAIL: string;
  HOST_APP_PASSWORD: string;
  subject?: string[];
  message?: string[];
};

type SendOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [selectedSubjectCol, setSelectedSubjectCol] = useState<string>("");
  const [selectedMessageCol, setSelectedMessageCol] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const emailList = useMemo(() => {
    if (!selectedCol) return [];
    return rows.map((r) => (r[selectedCol] ?? "").toString().trim()).filter(Boolean);
  }, [rows, selectedCol]);

  // State for subject and message form inputs
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Connections state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const selectedConnection = useMemo(
    () => connections.find((c) => c.id === selectedConnectionId) || null,
    [connections, selectedConnectionId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [connName, setConnName] = useState("");
  const [connEmail, setConnEmail] = useState("");
  const [connAppPass, setConnAppPass] = useState("");
  const [connPending, setConnPending] = useState(false);
  const [connNotice, setConnNotice] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignPending, setCampaignPending] = useState(false);

  useEffect(() => {
    // Load connections on mount (if logged in)
    (async () => {
      try {
        const list = await fetchConnections();
        setConnections(list);
        if (list.length > 0) setSelectedConnectionId(list[0].id);
      } catch (e: any) {
        console.error("Failed to load connections:", e?.message || e);
        toast.error("Failed to load connections.");
      }
    })();
  }, []);

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setSelectedCol(parsed.headers[0] ? String(parsed.headers[0]) : ""); // Fixed
      
      toast.success(`CSV uploaded successfully! Found ${parsed.rows.length} rows.`);
    } catch (error: any) {
      toast.error("Failed to parse CSV file. Please check the format.");
    }
  }

  async function handleCreateCampaign() {
    if (!selectedConnection) {
      toast.error("Select a connection or create one first.");
      return;
    }
    if (emailList.length === 0) {
      toast.error("Please select an email column with at least one address.");
      return;
    }

    const url = "https://pulsemail-production.up.railway.app/api/send-mails/";

    try {
      setCampaignPending(true);
      
      // Show loading toast
      const loadingToast = toast.loading("Sending emails...");

      // Create subject and message arrays based on column selection or input fields
      let subjectArray: string[] | undefined;
      let messageArray: string[] | undefined;

      // Handle subject: use column data if selected, otherwise use input field
      if (selectedSubjectCol && selectedSubjectCol.trim()) {
        // Use CSV column data - map each email to its corresponding subject
        subjectArray = rows
          .filter((r) => (r[selectedCol] ?? "").toString().trim()) // Only include rows with valid emails
          .map((r) => (r[selectedSubjectCol] ?? "").toString().trim() || "No Subject");
      } else if (subject.trim()) {
        // Use input field - same subject for all emails
        subjectArray = emailList.map(() => subject);
      }

      // Handle message: use column data if selected, otherwise use input field
      if (selectedMessageCol && selectedMessageCol.trim()) {
        // Use CSV column data - map each email to its corresponding message
        messageArray = rows
          .filter((r) => (r[selectedCol] ?? "").toString().trim()) // Only include rows with valid emails
          .map((r) => (r[selectedMessageCol] ?? "").toString().trim() || "No Message");
      } else if (message.trim()) {
        // Use input field - same message for all emails
        messageArray = emailList.map(() => message);
      }

      const payload: CampaignPayload = {
        email_list: emailList,
        HOST_EMAIL: selectedConnection.host_email,
        HOST_APP_PASSWORD: selectedConnection.host_app_password,
      };

      if (subjectArray) payload.subject = subjectArray;
      if (messageArray) payload.message = messageArray;

      const result = await sendCampaign(url, payload, { timeoutMs: 20000 });

      // Log the campaign to database (don't block UI if this fails)
      try {
        const logPayload: Parameters<typeof logCampaign>[0] = {
          connection_id: selectedConnection.id,
          connection_name: selectedConnection.connection_name,
          campaign_name: campaignName || `Campaign ${new Date().toLocaleString()}`,
          email_list: emailList,
        };

        if (subjectArray) logPayload.subject = subjectArray;
        if (messageArray) logPayload.message = messageArray;

        await logCampaign(logPayload);
      } catch (logErr: any) {
        console.error("Failed to log campaign:", logErr?.message || logErr);
        toast.error("Campaign sent but failed to save to history.");
      }

      console.log("Campaign response:", result);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Campaign sent successfully to ${emailList.length} recipients!`);

      // Clear inputs
      setSubject('');
      setMessage('');
      setCampaignName('');
      setHeaders([]);
      setRows([]);
      setSelectedCol("");
      setSelectedSubjectCol("");
      setSelectedMessageCol("");

      // Clear file input
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to send campaign.");
    } finally {
      setCampaignPending(false);
    }
  }

  async function handleCreateConnection() {
    try {
      setConnPending(true);
      setConnNotice(null);
      
      const newConn = await apiCreateConnection({
        connection_name: connName,
        host_email: connEmail,
        host_app_password: connAppPass,
      });
      
      // Refresh list and select newly created
      const list = await fetchConnections();
      setConnections(list);
      setSelectedConnectionId(newConn.id);
      setModalOpen(false);
      setConnName("");
      setConnEmail("");
      setConnAppPass("");
      
      // Success toast
      toast.success("Connection created successfully!");
      
    } catch (e: any) {
      setConnNotice(e?.message || "Failed to create connection.");
      toast.error(e?.message || "Failed to create connection.");
    } finally {
      setConnPending(false);
    }
  }

  return (

    <AuthGuard>
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_15%_20%,rgba(120,98,255,0.35),transparent_40%),radial-gradient(900px_600px_at_80%_70%,rgba(28,49,220,0.55),transparent_45%),linear-gradient(180deg,rgba(10,15,25,0.85),rgba(10,15,25,0.9))]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:3px_3px]" />
      </div>

      <Nav />

      {/* Content */}
      <div className="relative pt-20 z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-2">
        {/* LEFT: CSV */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold text-white">Upload CSV</h2>
          <p className="mb-3 text-sm text-white/70">
            Upload a CSV with headers. After upload, pick the column that contains emails.
          </p>

          <label className="mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white hover:bg-white/15">
            <input 
              ref={fileRef}
              type="file" 
              accept=".csv,text/csv" 
              onChange={handleCSV} 
              className="hidden" 
            />
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0 4 4M12 4 8 8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Choose CSV
          </label>

          {headers.length > 0 && (
            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/80">Select email column</label>
                <SelectShell>
                  <select
                    value={selectedCol ?? ""}
                    onChange={(e) => setSelectedCol(e.target.value)}
                    className="
                      w-full appearance-none bg-transparent
                      px-3 pr-9 py-2
                      text-white placeholder:text-white/60
                      outline-none
                    "
                  >
                    {headers.map((h) => {
                      const val = String(h);
                      return (
                        <option className="bg-[#0b0f19]" key={val} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </SelectShell>
                <p className="mt-2 text-xs text-white/60">Selected list size: {emailList.length}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/80">Select subject column (optional)</label>
                <SelectShell>
                  <select
                    value={selectedSubjectCol ?? ""}
                    onChange={(e) => setSelectedSubjectCol(e.target.value)}
                    className="
                      w-full appearance-none bg-transparent
                      px-3 pr-9 py-2
                      text-white placeholder:text-white/60
                      outline-none
                    "
                  >
                    <option className="bg-[#0b0f19]" value="">
                      None (use input field)
                    </option>
                    {headers.map((h) => {
                      const val = String(h);
                      return (
                        <option className="bg-[#0b0f19]" key={val} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </SelectShell>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/80">Select message column (optional)</label>
                <SelectShell>
                  <select
                    value={selectedMessageCol ?? ""}
                    onChange={(e) => setSelectedMessageCol(e.target.value)}
                    className="
                      w-full appearance-none bg-transparent
                      px-3 pr-9 py-2
                      text-white placeholder:text-white/60
                      outline-none
                    "
                  >
                    <option className="bg-[#0b0f19]" value="">
                      None (use input field)
                    </option>
                    {headers.map((h) => {
                      const val = String(h);
                      return (
                        <option className="bg-[#0b0f19]" key={val} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </SelectShell>
              </div>
            </div>
          )}

          {rows.length > 0 ? (
            <div className="mt-4 max-h-[420px] overflow-auto rounded-lg border border-white/10">
              <table className="min-w-full text-left text-sm text-white/90">
                <thead className="sticky top-0 bg-white/10 backdrop-blur">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-white/80">
                          {r[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* RIGHT: Campaign + Connection */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold text-white">Create Campaign</h2>
          <p className="mb-4 text-sm text-white/70">Compose the email to send to the selected list.</p>

          {/* Campaign Name */}
          <div className="mb-4">
            <label className="mb-1 block text-sm text-white/80">Campaign name</label>
            <input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., August Newsletter"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
            />
          </div>

          {/* Connection select */}
          <div className="mb-4">
            <label className="mb-1 block text-sm text-white/80">Connection</label>
            <SelectShell>
              <select
                value={selectedConnectionId}
                onChange={(e) => {
                  if (e.target.value === "__create__") {
                    setModalOpen(true);
                    return;
                  }
                  setSelectedConnectionId(e.target.value);
                }}
                className="
                  w-full appearance-none bg-transparent
                  px-3 pr-9 py-2
                  text-white placeholder:text-white/60
                  outline-none
                "
              >
                {connections.length === 0 && (
                  <option className="bg-[#0b0f19]" value="">
                    No connections
                  </option>
                )}
                {connections.map((c) => (
                  <option className="bg-[#0b0f19]" key={c.id} value={c.id}>
                    {c.connection_name}
                  </option>
                ))}
                <option className="bg-[#0b0f19]" value="__create__">
                  + Create connection
                </option>
              </select>
            </SelectShell>
          </div>

          {/* Subject / Message */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/80">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your subject"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/80">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={10}
                className="w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
              />
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={
                campaignPending || 
                !selectedConnection || 
                emailList.length === 0
              }
              className="w-full rounded-lg cursor-pointer bg-blue-600/90 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-white/20"
            >
              {campaignPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Sending emails...
                </div>
              ) : (
                "Create Campaign"
              )}
            </button>

            {/* Preview */}
            <div className="text-xs text-white/70">
              {emailList.length > 0 ? (
                <div>
                  Sending to {emailList.length} recipients. Using connection:{" "}
                  <span className="text-white/90">
                    {selectedConnection ? selectedConnection.connection_name : "N/A"}
                  </span>
                  . Example:{" "}
                  <span className="text-white/90">
                    {emailList.slice(0, 5).join(", ")}
                    {emailList.length > 5 ? "…" : ""}
                  </span>
                </div>
              ) : (
                <span>No recipients selected yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Connection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur-md">
            <h3 className="text-lg font-semibold">Create Connection</h3>
            {connNotice && (
              <div className="mt-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">
                {connNotice}
              </div>
            )}
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-white/80">Connection name</label>
                <input
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  placeholder="e.g., Primary Gmail"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/80">Host email</label>
                <input
                  value={connEmail}
                  onChange={(e) => setConnEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/80">Host app password</label>
                <input
                  value={connAppPass}
                  onChange={(e) => setConnAppPass(e.target.value)}
                  placeholder="App password"
                  type="password"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                disabled={connPending || !connName.trim() || !connEmail.trim() || !connAppPass.trim()}
                onClick={handleCreateConnection}
                className="rounded-lg bg-blue-600/90 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {connPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </section>
    </AuthGuard>
  );
}

/* ------------ Request Helper ------------- */
async function sendCampaign(url: string, payload: CampaignPayload, opts: SendOptions = {}) {
  const { timeoutMs = 15000, signal } = opts;

  if (!/^https?:\/\//.test(url)) {
    throw new Error("Invalid URL. Must start with http(s)://");
  }
  if (!Array.isArray(payload.email_list) || payload.email_list.length === 0) {
    throw new Error("email_list must be a non-empty array.");
  }
  // Check that if subject/message arrays are provided, they have the correct length
  if (payload.subject && (!Array.isArray(payload.subject) || payload.subject.length !== payload.email_list.length)) {
    throw new Error("subject array must have the same length as email_list.");
  }
  if (payload.message && (!Array.isArray(payload.message) || payload.message.length !== payload.email_list.length)) {
    throw new Error("message array must have the same length as email_list.");
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const combinedSignal = mergeAbortSignals(signal, controller.signal);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: combinedSignal,
    });

    if (!res.ok) {
      const text = await safeText(res);
      throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
    }

    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? await res.json() : await res.text();
  } catch (err: any) {
    if (err?.name === "AbortError") throw new Error("Request aborted (timeout).");
    throw err;
  } finally {
    clearTimeout(t);
  }
}

async function safeText(res: Response): Promise<string | null> {
  try {
    return await res.text();
  } catch {
    return null;
  }
}

function mergeAbortSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a && !b) return undefined;
  if (a && !b) return a;
  if (!a && b) return b;

  const controller = new AbortController();
  const onAbortA = () => controller.abort();
  const onAbortB = () => controller.abort();
  a!.addEventListener("abort", onAbortA);
  b!.addEventListener("abort", onAbortB);
  if (a!.aborted || b!.aborted) controller.abort();
  controller.signal.addEventListener("abort", () => {
    a!.removeEventListener("abort", onAbortA);
    b!.removeEventListener("abort", onAbortB);
  });
  return controller.signal;
}

/* ------------ CSV Parser ------------- */
function parseCSV(input: string): { headers: string[]; rows: Row[] } {
  const text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const tokenRows: string[][] = [];
  let field = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      currentRow.push(field);
      field = "";
    } else if (c === "\n" && !inQuotes) {
      currentRow.push(field);
      tokenRows.push(currentRow);
      currentRow = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || currentRow.length > 0) {
    currentRow.push(field);
    tokenRows.push(currentRow);
  }

  if (tokenRows.length === 0) return { headers: [], rows: [] };

  const headers = tokenRows[0].map((h) => String(h).trim());
  const dataRows = tokenRows.slice(1).filter((r) => r.some((v) => v.trim() !== ""));

  const objects: Row[] = dataRows.map((r) => {
    const obj: Row = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").toString().trim();
    });
    return obj;
  });

  return { headers, rows: objects };
}

/* ------------ UI Helpers ------------- */
function EmptyState() {
  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-6 text-center">
      <p className="text-sm text-white/70">No file uploaded. Choose a CSV to preview data.</p>
      <p className="mt-2 text-xs text-white/50">Example headers: email, name, company</p>
    </div>
  );
}

function SelectShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative flex items-center",
        "rounded-md border border-white/15",
        "bg-gradient-to-br from-white/5 to-white/10",
        "backdrop-blur-md",
        className,
      ].join(" ")}
    >
      {children}
      {/* Minimal caret */}
      <div className="pointer-events-none absolute right-3 flex h-5 w-5 items-center justify-center text-white/75">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}