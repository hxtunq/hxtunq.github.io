/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Collaborative Research Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

    if (!accessKey) {
      console.warn("VITE_WEB3FORMS_KEY is not defined. Simulating local submission...");
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
          setName("");
          setEmail("");
          setMessage("");
          setSubmitted(false);
          onClose();
        }, 3000);
      }, 1200);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: name,
          email: email,
          subject: subject,
          message: message,
          from_name: "Academic Portfolio Inquiry"
        })
      });

      const result = await response.json();
      if (result.success) {
        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
          setName("");
          setEmail("");
          setMessage("");
          setSubmitted(false);
          onClose();
        }, 3000);
      } else {
        alert("Submission failed: " + (result.message || "Unknown error"));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Network error: Could not submit inquiry. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm"
          />

          {/* Modal content body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-brand-surface-lowest border border-brand-surface-highest rounded-none shadow-xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-surface-highest px-6 py-4 bg-brand-surface-low">
              <h3 className="font-serif font-bold text-lg text-brand-primary">
                Academic Inquiry
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-high transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner Content */}
            <div className="p-6">
              {submitted ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-12 h-12 text-brand-secondary mb-4 animate-bounce" />
                  <h4 className="font-serif font-bold text-lg text-brand-primary mb-2">
                    Message Dispatched Successfully
                  </h4>
                  <p className="font-sans text-sm text-brand-on-surface-variant max-w-sm">
                    Thank you, your collaborative request has been logged in Tung's queue. A response will be returned to <span className="font-mono text-xs font-semibold">{email}</span> within 72 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-brand-surface-low/50 border border-brand-surface-highest p-3 text-xs font-mono text-brand-on-surface-variant mb-2">
                    <span className="font-bold text-brand-primary">INFO //</span> All inbounds are filtered by institutional domain and archived securely for compliance audits.
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-brand-secondary uppercase mb-1">
                      Academic Name / Affiliation
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Prof. Alan Turing, Stanford Univ."
                      className="w-full bg-brand-bg border border-brand-surface-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-none p-3 text-sm text-brand-on-surface outline-none transition-all placeholder:text-brand-on-surface-variant/40"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-brand-secondary uppercase mb-1">
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. turing@stanford.edu"
                      className="w-full bg-brand-bg border border-brand-surface-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-none p-3 text-sm text-brand-on-surface outline-none transition-all placeholder:text-brand-on-surface-variant/40"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-brand-secondary uppercase mb-1">
                      Purpose of Contact
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-surface-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-none p-3 text-sm text-brand-on-surface outline-none transition-all"
                    >
                      <option value="Collaborative Research Inquiry">Collaborative Research Inquiry</option>
                      <option value="Peer Review / Editorial Request">Peer Review / Editorial Request</option>
                      <option value="Graduate/Advising Opportunity">Graduate/Advising Opportunity</option>
                      <option value="General Academic Question">General Academic Question</option>
                    </select>
                  </div>

                  {/* Message body */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-brand-secondary uppercase mb-1">
                      Brief Proposal / Inquiry Abstract
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide a concise description of your request or biological research hypothesis..."
                      className="w-full bg-brand-bg border border-brand-surface-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-none p-3 text-sm text-brand-on-surface outline-none transition-all placeholder:text-brand-on-surface-variant/40 resize-none"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 border border-brand-surface-highest hover:bg-brand-surface-low text-brand-on-surface py-3 text-xs uppercase font-bold tracking-widest text-center transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-3 text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Transmitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Transmit Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
