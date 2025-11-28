import React from "react";
import { useForm, ValidationError } from "@formspree/react";

export default function ContactForm() {
  const [state, handleSubmit] = useForm("mldodnnw"); // replace with your Formspree ID

  if (state.succeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl text-center text-white w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-2">Message Sent ✅</h2>
          <p className="text-sm text-gray-300">
            Thank you for contacting us! We’ll respond shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="w-full text-white">
      <form
        onSubmit={handleSubmit}
          className="w-full max-w-lg min-h-[400px] bg-black backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_25px_rgba(255,255,255,0.05)] space-y-4 flex flex-col justify-between"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-gray-300 mb-1"
          >
            Your Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-pink-500 focus:border-transparent placeholder-gray-500"
            placeholder="Enter your name"
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-pink-500 focus:border-transparent placeholder-gray-500"
            placeholder="Enter your email"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-semibold text-gray-300 mb-1"
          >
            Subject
          </label>
          <input
            id="subject"
            type="text"
            name="subject"
            className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-pink-500 focus:border-transparent placeholder-gray-500"
            placeholder="How can we help?"
          />
          <ValidationError
            prefix="Subject"
            field="subject"
            errors={state.errors}
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-xs font-semibold text-gray-300 mb-1"
          >
            Message
          </label>
            <textarea
              id="message"
              name="message"
              rows="7"
              required
              className="w-full min-h-[120px] bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-pink-500 focus:border-transparent placeholder-gray-500 resize-none"
              placeholder="Tell us more about your inquiry..."
            ></textarea>
          <ValidationError
            prefix="Message"
            field="message"
            errors={state.errors}
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={state.submitting}
          className="w-full py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:opacity-90 transition disabled:opacity-60"
        >
          {state.submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
