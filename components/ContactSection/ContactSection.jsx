"use client";

import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { useContact } from "@/hooks/useContact";

export default function ContactSection() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const { submitInquiry, loading } = useContact();
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(null);

        const result = await submitInquiry({
            name: form.name,
            email: form.email,
            message: form.message,
            form_type: 'contact'
        });

        setSubmitStatus(result);

        if (result.success) {
            setForm({ name: "", email: "", message: "" });
        }
    };

    return (

        <section id="contact" className="bg-[#101828] text-white pt-20">

            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 mb-10">

                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Contact Us
                    </h2>

                    <p className="text-gray-400 mb-8">
                        Have a project in mind or need help? Feel free to reach out to us.
                        We’d love to hear from you.
                    </p>

                    <div className="space-y-5 text-gray-300">

                        <div className="flex items-center gap-4">
                            <FaMapMarkerAlt className="text-cyan-400" />
                            <span>Flat No. (12), Sixth floor, property No.
                                21 Nagaty Serag Street, intersection Ibrahim El Refaey, 1st Plot, Block 55, 8th Zone, Nasr City, Cairo.</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaPhone className="text-cyan-400" />
                            <span>+201024280018</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaEnvelope className="text-cyan-400" />
                            <span>info@elmotahida.net</span>
                        </div>

                    </div>
                </div>

                {/* 🔹 Form */}
                <div className="bg-[#1e293b] p-8 rounded-2xl shadow-lg">
                    {submitStatus && (
                        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                            submitStatus.success
                                ? 'bg-green-900/50 border border-green-500 text-green-300'
                                : 'bg-red-900/50 border border-red-500 text-red-300'
                        }`}>
                            {submitStatus.success ? (
                                <FaCheck className="text-green-400" />
                            ) : (
                                <FaExclamationTriangle className="text-red-400" />
                            )}
                            <span>{submitStatus.message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400"
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />

                        <input
                            className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />

                        <textarea
                            className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400 resize-none"
                            name="message"
                            placeholder="Message"
                            rows="4"
                            value={form.message}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full cursor-pointer bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>

            </div>

            <hr className="w-3/4 mx-auto " />
        </section>
    );
}
