import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SendResult = { to: string; status: "sent" | "failed"; error?: string };

/** Accept a single string (broadcast to `length`) or an array; normalize to string[]. */
function normalizeToList(value: unknown, length: number, field: string): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v ?? ""));
  if (typeof value === "string") return Array(length).fill(value);
  if (value === undefined || value === null) return Array(length).fill("");
  throw new Error(`${field} must be a string or an array of strings`);
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email_list, subject, message, HOST_EMAIL, HOST_APP_PASSWORD } = body ?? {};

  // Validate basic structure
  if (!Array.isArray(email_list) || email_list.length === 0) {
    return NextResponse.json(
      { error: "email_list must be a non-empty array of recipient emails" },
      { status: 400 }
    );
  }
  if (typeof HOST_EMAIL !== "string" || typeof HOST_APP_PASSWORD !== "string") {
    return NextResponse.json(
      { error: "HOST_EMAIL and HOST_APP_PASSWORD must be provided as strings" },
      { status: 400 }
    );
  }

  // Validate email formats
  if (!EMAIL_RE.test(HOST_EMAIL)) {
    return NextResponse.json({ error: "HOST_EMAIL is not a valid email address" }, { status: 400 });
  }
  for (const recipient of email_list) {
    if (typeof recipient !== "string" || !EMAIL_RE.test(recipient)) {
      return NextResponse.json(
        { error: `Invalid recipient email: ${String(recipient)}` },
        { status: 400 }
      );
    }
  }

  // Normalize subject/message to lists (allow single string broadcast)
  let subjects: string[];
  let messages: string[];
  try {
    subjects = normalizeToList(subject, email_list.length, "subject");
    messages = normalizeToList(message, email_list.length, "message");
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  if (subjects.length !== email_list.length || messages.length !== email_list.length) {
    return NextResponse.json(
      {
        error:
          "email_list, subject, and message must have matching lengths (or provide a single subject/message to apply to all)",
      },
      { status: 400 }
    );
  }

  // Establish a pooled SMTP connection (Gmail defaults) using the caller's credentials.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS on 587
    auth: { user: HOST_EMAIL, pass: HOST_APP_PASSWORD },
    pool: true,
    maxConnections: 1,
  });

  const results: SendResult[] = [];
  for (let i = 0; i < email_list.length; i++) {
    const to = email_list[i];
    try {
      await transporter.sendMail({
        from: HOST_EMAIL,
        to,
        subject: (subjects[i] || "").trim(),
        text: messages[i] || "",
      });
      results.push({ to, status: "sent" });
    } catch (err: any) {
      results.push({ to, status: "failed", error: err?.message || String(err) });
    }
  }
  transporter.close();

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.length - sent;

  return NextResponse.json(
    { success: failed === 0, sent, failed, total: results.length, results },
    { status: 200 }
  );
}
