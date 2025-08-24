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
  subject: string | string[];
  message: string | string[];
};

type SendOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Column selections for mapping
  const [selectedEmailCol, setSelectedEmailCol] = useState<string>("");
  const [selectedSubjectCol, setSelectedSubjectCol] = useState<string>(""); // optional
  const [selectedMessageCol, setSelectedMessageCol] = useState<string>(""); // optional

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Manual subject/message fallbacks
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Derive selected rows based on valid email presence to keep alignment
  const selectedRows = useMemo(() => {
    if (!selectedEmailCol) return [] as Row[];
    return rows.filter((r) => (r[selectedEmailCol] ?? "").toString().trim() !== "");
  }, [rows, selectedEmailCol]);

  const emailList = useMemo(() => {
    if (!selectedEmailCol) return [] as string[];
    return selectedRows.map((r) => (r[selectedEmailCol] ?? "").toString().trim());
  }, [selectedRows, selectedEmailCol]);

  const subjectList = useMemo(() => {
    if (!selectedSubjectCol) return [] as string[]; // use manual subject
    return selectedRows.map((r) => (r[selectedSubjectCol] ?? "").toString());
  }, [selectedRows, selectedSubjectCol]);

  const msgList = useMemo(() => {
    if (!selectedMessageCol) return [] as string[]; // use manual message
    return selectedRows.map((r) => (r[selectedMessageCol] ?? "").toString());
  }, [selectedRows, selectedMessageCol]);

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

      // Heuristic defaults
      const lower = parsed.headers.map((h) => h.toLowerCase());
      const emailIdx = lower.findIndex((h) => /email/.test(h));
      const subjectIdx = lower.findIndex((h) => /subject/.test(h));
      const messageIdx = lower.findIndex((h) => /message|body|content/.test(h));

      setSelectedEmailCol(parsed.headers[emailIdx >= 0 ? emailIdx : 0] ?? "");
      setSelectedSubjectCol(parsed.headers[subjectIdx >= 0 ? subjectIdx : 0] ?? "");
      setSelectedMessageCol(parsed.headers[messageIdx >= 0 ? messageIdx : 0] ?? "");
      
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

    // Determine payload subject/message: either arrays from columns or manual strings
    const payloadSubject: string | string[] = subjectList.length > 0 ? subjectList : subject;
    const payloadMessage: string | string[] = msgList.length > 0 ? msgList : message;

    // Client-side validation mirroring server constraints
    if (Array.isArray(payloadSubject) && payloadSubject.length !== emailList.length) {
      toast.error("Subject column rows must match number of recipients.");
      return;
    }
    if (Array.isArray(payloadMessage) && payloadMessage.length !== emailList.length) {
      toast.error("Message column rows must match number of recipients.");
      return;
    }
    if (!Array.isArray(payloadSubject) && !payloadSubject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!Array.isArray(payloadMessage) && !payloadMessage.trim()) {
      toast.error("Message is required.");
      return;
    }

    const url = "https://pulsemail-production.up.railway.app/api/send-mails/";

    try {
      setCampaignPending(true);
      
      // Show loading toast
      const loadingToast = toast.loading("Sending emails...");

      const result = await sendCampaign(
        url,
        {
          email_list: emailList,
          HOST_EMAIL: selectedConnection.host_email,
          HOST_APP_PASSWORD: selectedConnection.host_app_password,
          subject: payloadSubject,
          message: payloadMessage,
        },
        { timeoutMs: 20000 }
      );

      // Log the campaign to database (don't block UI if this fails)
      try {
        await logCampaign({
          connection_id: selectedConnection.id,
          connection_name: selectedConnection.connection_name,
          campaign_name: campaignName || `Campaign ${new Date().toLocaleString()}`,
          email_list: emailList,
          subject: Array.isArray(payloadSubject) ? '(personalized)' : payloadSubject,
          message: Array.isArray(payloadMessage) ? '(personalized)' : payloadMessage,
        });
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
      setSelectedEmailCol("");
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

  const usingPersonalizedSubject = selectedSubjectCol !== "";
  const usingPersonalizedMessage = selectedMessageCol !== "";

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
            Upload a CSV with headers. Map the columns for email, subject (optional), and message (optional).
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
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-white/80">Select email column</label>
                <SelectShell>
                  <select
                    value={selectedEmailCol}
                    onChange={(e) => setSelectedEmailCol(e.target.value)}
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
                    value={selectedSubjectCol}
                    onChange={(e) => setSelectedSubjectCol(e.target.value)}
                    className="
                      w-full appearance-none bg-transparent
                      px-3 pr-9 py-2
                      text-white placeholder:text-white/60
                      outline-none
                    "
                  >
                    <option className="bg-[#0b0f19]" value="">Manual subject</option>
                    {headers.map((h) => (
                      <option className="bg-[#0b0f19]" key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </SelectShell>
                {usingPersonalizedSubject && (
                  <p className="mt-2 text-xs text-white/60">Using personalized subject from column: <span className="text-white/90">{selectedSubjectCol}</span></p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/80">Select message column (optional)</label>
                <SelectShell>
                  <select
                    value={selectedMessageCol}
                    onChange={(e) => setSelectedMessageCol(e.target.value)}
                    className="
                      w-full appearance-none bg-transparent
                      px-3 pr-9 py-2
                      text-white placeholder:text-white/60
                      outline-none
                    "
                  >
                    <option className="bg-[#0b0f19]" value="">Manual message</option>
                    {headers.map((h) => (
                      <option className="bg-[#0b0f19]" key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </SelectShell>
                {usingPersonalizedMessage && (
                  <p className="mt-2 text-xs text-white/60">Using personalized message from column: <span className="text-white/90">{selectedMessageCol}</span></p>
                )}
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
            <EmptyState />)
          }
        </div>

        {/* RIGHT: Campaign + Connection */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold text-white">Create Campaign</h2>
          <p className="mb-4 text-sm text-white/70">Compose the email to send to the selected list. Use CSV columns for per-recipient subject/message, or enter a manual subject/message below.</p>

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
              <label className="mb-1 block text-sm text-white/80">Subject {usingPersonalizedSubject && <span className="text-xs text-white/60">(from column)</span>}</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={usingPersonalizedSubject ? "Subject column selected; manual input disabled" : "Your subject"}
                disabled={usingPersonalizedSubject}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none disabled:opacity-60"
              />
              {usingPersonalizedSubject && (
                <p className="mt-1 text-xs text-white/60">Personalized subjects will be used for {emailList.length} recipients.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/80">Message {usingPersonalizedMessage && <span className="text-xs text-white/60">(from column)</span>}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={usingPersonalizedMessage ? "Message column selected; manual input disabled" : "Write your message..."}
                rows={10}
                disabled={usingPersonalizedMessage}
                className="w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none disabled:opacity-60"
              />
              {usingPersonalizedMessage && (
                <p className="mt-1 text-xs text-white/60">Personalized messages will be used for {emailList.length} recipients.</p>
              )}
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={
                campaignPending || 
                !selectedConnection || 
                emailList.length === 0 || 
                (
                  !usingPersonalizedSubject && !subject.trim()
                ) || (
                  !usingPersonalizedMessage && !message.trim()
                )
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
            <div className="text-xs text-white/70 space-y-1">
              {emailList.length > 0 ? (
                <div>
                  <div>
                    Sending to {emailList.length} recipients. Using connection: {" "}
                    <span className="text-white/90">
                      {selectedConnection ? selectedConnection.connection_name : "N/A"}
                    </span>
                  </div>
                  <div>
                    Emails example: <span className="text-white/90">{emailList.slice(0, 5).join(", ")}{emailList.length > 5 ? "…" : ""}</span>
                  </div>
                  <div>
                    Subject: <span className="text-white/90">{usingPersonalizedSubject ? `from column "${selectedSubjectCol}"` : (subject ? subject.slice(0, 50) : "(none)")}</span>
                  </div>
                  <div>
                    Message: <span className="text-white/90">{usingPersonalizedMessage ? `from column "${selectedMessageCol}"` : (message ? message.slice(0, 50) : "(none)")}</span>
                  </div>
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

  // Validate subject
  if (Array.isArray(payload.subject)) {
    if (payload.subject.length !== payload.email_list.length) {
      throw new Error("subject array length must match email_list length");
    }
  } else {
    if (!payload.subject?.trim()) throw new Error("subject is required.");
  }

  // Validate message
  if (Array.isArray(payload.message)) {
    if (payload.message.length !== payload.email_list.length) {
      throw new Error("message array length must match email_list length");
    }
  } else {
    if (!payload.message?.trim()) throw new Error("message is required.");
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
      <p className="mt-2 text-xs text-white/50">Example headers: email, name, company, subject, message</p>
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
