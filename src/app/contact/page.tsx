"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Coffee, MapPin, Clock, Phone, Mail, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success("Thank you! Your message has been sent.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch {
      toast.error("Network error while sending message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background text-foreground noise-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-caramel transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Coffee className="w-8 h-8 text-caramel" />
              Contact Us & Visit
            </h1>
            <p className="text-xs text-muted-foreground mt-2">
              Have questions, feedback, or table booking inquiries? We&apos;d love to hear from you!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact Info */}
          <div className="space-y-8">
            <div className="bg-card border border-border p-8 rounded-3xl space-y-6 shadow-xl">
              <h2 className="font-serif text-2xl font-bold text-foreground">Get In Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-caramel/10 border border-caramel/20 flex items-center justify-center text-caramel shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Location</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      123 Café Street, Salt Lake Sector V,<br />
                      Kolkata, West Bengal 700091
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-caramel/10 border border-caramel/20 flex items-center justify-center text-caramel shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Opening Hours</h3>
                    <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                      <p>Mon – Fri: 7:00 AM – 11:00 PM</p>
                      <p>Sat – Sun: 8:00 AM – 11:30 PM</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-caramel/10 border border-caramel/20 flex items-center justify-center text-caramel shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Phone & Email</h3>
                    <p className="text-sm text-muted-foreground mt-1">+91 98765 43210</p>
                    <p className="text-sm text-muted-foreground">hello@addadotcom.cafe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="rounded-3xl overflow-hidden border border-border shadow-xl h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.062086438075!2d88.42831201533!3d22.572646290874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275ade687271b%3A0xe5ec827d04fef40!2sSalt%20Lake%20Sector%20V%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="AddaDotCom Map Location"
              />
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-card border border-border p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Send Us a Message</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl p-6 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
                  <h3 className="font-serif text-xl font-bold">Message Received!</h3>
                  <p className="text-xs text-muted-foreground">
                    Thank you for reaching out to AddaDotCom. We will reply to your email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-espresso text-cream rounded-xl text-xs font-bold hover:bg-espresso-500 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-espresso"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Your Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-espresso"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Table reservation / Event inquiry / General"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-espresso"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message or inquiry here..."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-espresso resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-espresso hover:bg-espresso-500 text-cream font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Inquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
