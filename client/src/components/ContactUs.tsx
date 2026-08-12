"use client";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { MdArrowForward } from "react-icons/md";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending your message...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(result.message);
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error(result.error || "Something went wrong");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 border-t border-white/5 px-5 py-20 md:flex-row md:px-16 md:py-24"
    >
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-3xl font-semibold tracking-tight text-primary md:text-5xl">
          Initialize Contact
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
          Request elevated access or consult with our team for custom requirements.
        </p>
      </div>

      <div className="flex-1">
        <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-6 rounded-lg p-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="mono-label tracking-wider text-primary">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
              className="line-input disabled:opacity-50"
              placeholder="Ada Lovelace"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="mono-label tracking-wider text-primary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
              className="line-input disabled:opacity-50"
              placeholder="engineering@company.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="mono-label tracking-wider text-primary">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={isSubmitting}
              className="line-input resize-y disabled:opacity-50"
              placeholder="Tell us about your requirements..."
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 self-start rounded-full px-6 py-3">
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black/80" />
                Sending...
              </>
            ) : (
              <>
                Submit Request
                <MdArrowForward className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(20, 20, 20, 0.9)",
            backdropFilter: "blur(12px)",
            color: "#e5e2e1",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#ffffff", secondary: "#131313" } },
          error: { iconTheme: { primary: "#ffb4ab", secondary: "#131313" } },
        }}
      />
    </section>
  );
}
