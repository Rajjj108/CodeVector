import { useEffect, useState, useRef } from "react";
import axios from "axios";

const SECTION_META = {
    company: { icon: "🏢", label: "Company Wise" },
    recent: { icon: "⚡", label: "Recently Practiced" },
    saved: { icon: "⭐", label: "Saved" },
};

const Section = ({ title, items, icon, itemsRef }) => {
    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">{icon}</span>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
            </div>

            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li
                        key={item}
                        ref={(el) => (itemsRef.current[idx] = el)}
                        className="group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-xs font-mono text-gray-400 w-6 text-right">
                                {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                {item}
                            </span>
                            <svg
                                className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors ml-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InterviewSection = () => {
    const [data, setData]   = useState(null);
    const [error, setError] = useState(false);
    const containerRef = useRef(null);
    const itemsRef = useRef([]);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/dashboard/interview",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setData(res.data);
            } catch (err) {
                console.error("NotesSection fetch error:", err?.response?.status, err?.message);
                setError(true);
            }
        };
        fetchInterview();
    }, []);

    if (error) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 12, color: "rgba(248,113,113,0.6)", fontFamily: "monospace", letterSpacing: "0.2em" }}>
                NOT SIGNED IN
            </p>
        </div>
    );

    if (!data)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );

    const totalItems = (data.company?.length || 0) + (data.recent?.length || 0) + (data.saved?.length || 0);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
            <div ref={containerRef} className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Interview Questions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Organize and track your interview preparation
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</p>
                        </div>
                        <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.saved?.length || 0}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Saved</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-12">
                    <Section
                        title={SECTION_META.company.label}
                        items={data.company || []}
                        icon={SECTION_META.company.icon}
                        itemsRef={itemsRef}
                    />
                    <Section
                        title={SECTION_META.recent.label}
                        items={data.recent || []}
                        icon={SECTION_META.recent.icon}
                        itemsRef={itemsRef}
                    />
                    <Section
                        title={SECTION_META.saved.label}
                        items={data.saved || []}
                        icon={SECTION_META.saved.icon}
                        itemsRef={itemsRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default InterviewSection;
