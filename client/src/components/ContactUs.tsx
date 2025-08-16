"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(result.message);
        // Clear form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error(result.error || 'Something went wrong');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 disabled:opacity-50"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Info - Same as before */}
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">hello@pulsemail.com</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Location</h3>
              <p className="text-gray-600">Global - Remote First</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Response Time</h3>
              <p className="text-gray-600">Usually within 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#333',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
          },
        }}
      />
    </section>
  );
}
