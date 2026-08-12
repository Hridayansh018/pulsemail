"use client";
import Nav from "@/components/Nav";
import toast, { Toaster } from 'react-hot-toast';
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  MdOutlineCloudUpload,
  MdSend,
  MdOutlineVisibility,
  MdAdd,
  MdKeyboardArrowDown,
  MdClose,
} from "react-icons/md";
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
      setSelectedCol(parsed.headers[0] ? String(parsed.headers[0]) : "");

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

    // Emails are sent by the same-origin Next.js API route (nodemailer).
    const url = "/api/send-mails";

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

      // Attempt to send via the nodemailer API route. A hard failure here
      // (network/500) is non-fatal: the campaign is still recorded in local
      // history. Per-recipient failures come back in the 200 response body.
      let sendFailed = false;
      let sendResult: any = null;
      try {
        sendResult = await sendCampaign(url, payload, { timeoutMs: 20000 });
        console.log("Campaign response:", sendResult);
      } catch (sendErr: any) {
        sendFailed = true;
        console.error("Email send failed:", sendErr?.message || sendErr);
      }

      // Record the campaign in local history regardless of send outcome.
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
        toast.error("Failed to save campaign to history.");
      }

      // Dismiss loading toast and report the true outcome.
      toast.dismiss(loadingToast);
      if (sendFailed) {
        toast(
          `Saved to history for ${emailList.length} recipients. The email service errored — no emails were sent.`
        );
      } else if (sendResult && typeof sendResult === "object" && sendResult.failed > 0) {
        if (sendResult.sent > 0) {
          toast(
            `Sent ${sendResult.sent} of ${sendResult.total}. ${sendResult.failed} failed — check the connection credentials.`
          );
        } else {
          toast.error(
            `All ${sendResult.total} emails failed to send. Check the connection's email and app password.`
          );
        }
      } else {
        toast.success(`Campaign sent successfully to ${emailList.length} recipients!`);
      }

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

  const launchDisabled = campaignPending || !selectedConnection || emailList.length === 0;

  return (
    <AuthGuard>
      <Nav />

      <main className="mx-auto w-full max-w-[1280px] flex-grow px-5 pb-28 pt-24 md:px-16 md:pb-16">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">New Campaign</h1>
            <p className="mt-2 text-on-surface-variant">Configure recipients and craft your message.</p>
          </div>
          <button
            onClick={handleCreateCampaign}
            disabled={launchDisabled}
            className="btn-primary hidden rounded-full text-sm md:inline-flex"
          >
            <MdSend className="h-[18px] w-[18px]" />
            Launch Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: Recipients */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Dropzone */}
            <label className="glass-panel group flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant p-6 text-center transition-colors hover:border-primary">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCSV}
                className="hidden"
              />
              <MdOutlineCloudUpload className="mb-4 h-10 w-10 text-on-surface-variant transition-colors group-hover:text-primary" />
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-primary">Upload Recipients</h3>
              <p className="mb-4 text-on-surface-variant">Click to browse for your CSV file.</p>
              <span className="mono-label text-outline-variant">Requires a column of email addresses</span>
            </label>

            {/* Column mapping */}
            {headers.length > 0 && (
              <div className="glass-panel flex flex-col gap-4 rounded-lg p-5">
                <div>
                  <label className="mono-label mb-2 block text-on-surface-variant">Email column</label>
                  <SelectShell>
                    <select
                      value={selectedCol ?? ""}
                      onChange={(e) => setSelectedCol(e.target.value)}
                      className="w-full appearance-none bg-transparent px-3 py-2 pr-9 text-on-surface outline-none"
                    >
                      {headers.map((h) => {
                        const val = String(h);
                        return (
                          <option className="bg-surface" key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>
                  </SelectShell>
                  <p className="mono-label mt-2 text-on-surface-variant">Selected list size: {emailList.length}</p>
                </div>

                <div>
                  <label className="mono-label mb-2 block text-on-surface-variant">Subject column (optional)</label>
                  <SelectShell>
                    <select
                      value={selectedSubjectCol ?? ""}
                      onChange={(e) => setSelectedSubjectCol(e.target.value)}
                      className="w-full appearance-none bg-transparent px-3 py-2 pr-9 text-on-surface outline-none"
                    >
                      <option className="bg-surface" value="">None (use field below)</option>
                      {headers.map((h) => {
                        const val = String(h);
                        return (
                          <option className="bg-surface" key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>
                  </SelectShell>
                </div>

                <div>
                  <label className="mono-label mb-2 block text-on-surface-variant">Message column (optional)</label>
                  <SelectShell>
                    <select
                      value={selectedMessageCol ?? ""}
                      onChange={(e) => setSelectedMessageCol(e.target.value)}
                      className="w-full appearance-none bg-transparent px-3 py-2 pr-9 text-on-surface outline-none"
                    >
                      <option className="bg-surface" value="">None (use field below)</option>
                      {headers.map((h) => {
                        const val = String(h);
                        return (
                          <option className="bg-surface" key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>
                  </SelectShell>
                </div>
              </div>
            )}

            {/* Preview */}
            {rows.length > 0 ? (
              <div className="glass-panel flex flex-col overflow-hidden rounded-lg">
                <div className="flex items-center justify-between border-b border-white/10 bg-surface-container-low/50 p-4">
                  <h4 className="mono-label text-primary">Preview ({rows.length} parsed)</h4>
                  <MdOutlineVisibility className="h-4 w-4 text-on-surface-variant" />
                </div>
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-surface-container-lowest/80 backdrop-blur">
                      <tr className="border-b border-white/10">
                        {headers.map((h) => (
                          <th key={h} className="mono-label p-3 font-normal text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-on-surface">
                      {rows.map((r, idx) => (
                        <tr key={idx} className="transition-colors hover:bg-surface-variant/40">
                          {headers.map((h) => (
                            <td key={h} className="p-3 text-on-surface-variant">
                              {r[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* RIGHT: Composer */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="glass-panel flex flex-col gap-6 rounded-lg p-6">
              {/* Campaign name + connection */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mono-label mb-2 block text-on-surface-variant">Campaign Name</label>
                  <input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Q3 Product Update"
                    className="line-input"
                  />
                </div>
                <div>
                  <label className="mono-label mb-2 block text-on-surface-variant">Sender Connection</label>
                  <div className="relative">
                    <select
                      value={selectedConnectionId}
                      onChange={(e) => {
                        if (e.target.value === "__create__") {
                          setModalOpen(true);
                          return;
                        }
                        setSelectedConnectionId(e.target.value);
                      }}
                      className="line-input appearance-none pr-8"
                    >
                      {connections.length === 0 && <option className="bg-surface" value="">No connections</option>}
                      {connections.map((c) => (
                        <option className="bg-surface" key={c.id} value={c.id}>
                          {c.connection_name}
                        </option>
                      ))}
                      <option className="bg-surface" value="__create__">+ Create connection</option>
                    </select>
                    <MdKeyboardArrowDown className="pointer-events-none absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mono-label mb-2 block text-on-surface-variant">Subject Line</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Introducing new features..."
                  className="line-input text-lg"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-surface-container/40">
                <div className="border-b border-white/10 bg-surface-container-low px-4 py-2">
                  <span className="mono-label text-on-surface-variant">Message Body</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi there,&#10;&#10;We wanted to let you know..."
                  rows={10}
                  className="min-h-[240px] w-full resize-y bg-transparent p-4 text-on-surface outline-none placeholder:text-outline-variant"
                />
              </div>

              {/* Launch + preview */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCreateCampaign}
                  disabled={launchDisabled}
                  className="btn-primary w-full rounded-lg py-3 md:w-auto md:self-end"
                >
                  {campaignPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black/80" />
                      Sending emails...
                    </>
                  ) : (
                    <>
                      <MdSend className="h-[18px] w-[18px]" />
                      Launch Campaign
                    </>
                  )}
                </button>

                <p className="mono-label normal-case leading-relaxed text-on-surface-variant">
                  {emailList.length > 0 ? (
                    <>
                      Sending to {emailList.length} recipients via{" "}
                      <span className="text-primary">
                        {selectedConnection ? selectedConnection.connection_name : "N/A"}
                      </span>
                      . e.g. {emailList.slice(0, 3).join(", ")}
                      {emailList.length > 3 ? "…" : ""}
                    </>
                  ) : (
                    <>No recipients selected yet.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Connection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="glass-card relative z-10 w-full max-w-lg p-6 text-on-surface">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-tight text-primary">Create Connection</h3>
              <button onClick={() => setModalOpen(false)} className="text-on-surface-variant transition-colors hover:text-primary">
                <MdClose className="h-5 w-5" />
              </button>
            </div>
            {connNotice && (
              <div className="mb-3 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm">
                {connNotice}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label className="mono-label mb-2 block text-on-surface-variant">Connection name</label>
                <input
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  placeholder="Primary Gmail"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="mono-label mb-2 block text-on-surface-variant">Host email</label>
                <input
                  value={connEmail}
                  onChange={(e) => setConnEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="mono-label mb-2 block text-on-surface-variant">Host app password</label>
                <input
                  value={connAppPass}
                  onChange={(e) => setConnAppPass(e.target.value)}
                  placeholder="App password"
                  type="password"
                  className="glass-input"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-outline rounded-lg text-sm">
                Cancel
              </button>
              <button
                disabled={connPending || !connName.trim() || !connEmail.trim() || !connAppPass.trim()}
                onClick={handleCreateConnection}
                className="btn-primary rounded-lg text-sm"
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
            background: 'rgba(20, 20, 20, 0.9)',
            backdropFilter: 'blur(12px)',
            color: '#e5e2e1',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#ffffff', secondary: '#131313' } },
          error: { iconTheme: { primary: '#ffb4ab', secondary: '#131313' } },
        }}
      />
    </AuthGuard>
  );
}

/* ------------ Request Helper ------------- */
async function sendCampaign(url: string, payload: CampaignPayload, opts: SendOptions = {}) {
  const { timeoutMs = 15000, signal } = opts;

  if (!/^(https?:\/\/|\/)/.test(url)) {
    throw new Error("Invalid URL. Must be an absolute http(s) URL or an app-relative path.");
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
    <div className="glass-panel rounded-lg p-6 text-center">
      <p className="text-sm text-on-surface-variant">No file uploaded. Choose a CSV to preview data.</p>
      <p className="mono-label mt-2 text-outline-variant">Example headers: email, name, subject, message</p>
    </div>
  );
}

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center rounded-lg border border-white/10 bg-transparent transition-colors focus-within:border-white">
      {children}
      <MdKeyboardArrowDown className="pointer-events-none absolute right-2 h-5 w-5 text-on-surface-variant" />
    </div>
  );
}
