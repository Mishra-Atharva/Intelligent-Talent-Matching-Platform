import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import { apiGetAllJobs } from "../scripts/api.js";
import "./listings.css";

const API_BASE = "/api";

// Free users see only the top 3 recommended matches
const FREE_RECOMMENDED_LIMIT = 3;

function JobListings({ user, onLogout, onNavigate, onViewJob })
{
    const [activeTab, setActiveTab]   = useState("all");
    const [searchText, setSearchText] = useState("");
    const [jobs, setJobs]             = useState([]);
    const [savedJobs, setSavedJobs]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [loadError, setLoadError]   = useState("");

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        if (activeTab === "saved") {
            loadSavedJobs();
        }
    }, [activeTab]);

    function normalizeJob(job)
    {
        const companyName = job.company ?? job.employer_name ?? `Employer ${job.employer_id ?? ""}`;
        return {
            ...job,
            id: job.id ?? job.job_id,
            company: companyName,
            companyInitials:
                job.companyInitials ||
                (companyName
                    ? companyName.split(" ").map((word) => word[0]).join("")
                    : (job.employer_id ? String(job.employer_id).slice(-2) : "?")),
            workMode: job.workMode ?? job.work_mode ?? "",
            employmentType: job.employmentType ?? job.employment_type ?? "",
            skills: Array.isArray(job.skills) ? job.skills : [],
            matchScore: job.matchScore ?? 0,
            postedAt: job.postedAt ?? job.created_at ?? "",
        };
    }

    async function loadJobs()
    {
        setLoading(true);
        setLoadError("");

        const result = await apiGetAllJobs(user.token);
        if (!result)
        {
            setJobs([]);
            setLoadError("Unable to load jobs from the backend.");
            setLoading(false);
            return;
        }

        const list = Array.isArray(result)
            ? result
            : Array.isArray(result?.jobs)
                ? result.jobs
                : [];

        setJobs(list.map(normalizeJob));
        setLoading(false);
    }

    async function loadSavedJobs()
    {
        try
        {
            const res = await fetch(`${API_BASE}/saved-jobs/candidate/${user.user_id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch saved jobs");

            const savedList = await res.json();

            // savedList contains { saved_id, candidate_id, job_id, saved_at }
            // Fetch full job details for each saved entry
            const jobDetails = await Promise.all(
                savedList.map(async (saved) => {
                    const jobRes = await fetch(`${API_BASE}/jobs/${saved.job_id}`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });
                    if (!jobRes.ok) return null;
                    const job = await jobRes.json();
                    return normalizeJob({ ...job, saved_id: saved.saved_id });
                })
            );

            setSavedJobs(jobDetails.filter(Boolean));
        }
        catch (err)
        {
            console.error("Error loading saved jobs:", err);
        }
    }

    // Sort all jobs highest match first
    const sortedJobs = [...jobs].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Recommended = ≥70% match; free users capped at 3
    const allRecommended = sortedJobs.filter((j) => j.matchScore >= 70);
    const recommendedJobs = user.premium
        ? allRecommended
        : allRecommended.slice(0, FREE_RECOMMENDED_LIMIT);

    // All Jobs tab — filter by search text
    const filteredJobs = sortedJobs.filter((job) =>
    {
        if (!searchText) return true;
        const q = searchText.toLowerCase();
        const title = String(job.title || "").toLowerCase();
        const company = String(job.company || "").toLowerCase();
        const skills = Array.isArray(job.skills) ? job.skills : [];
        return (
            title.includes(q) ||
            company.includes(q) ||
            skills.some((s) => String(s).toLowerCase().includes(q))
        );
    });

    const jobsToShow =
        activeTab === "recommended" ? recommendedJobs :
        activeTab === "saved"       ? savedJobs :
        filteredJobs;

    if (loading)
    {
        return (
            <div className="listings-page">
                <DashNav user={user} activePage="jobs" onNavigate={onNavigate} onLogout={onLogout} />
                <div className="listings-body">
                    <p className="empty-msg">Loading jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="listings-page">
            <DashNav
                user={user}
                activePage="jobs"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <div className="listings-body">
                {/* Search bar */}
                <div className="search-row">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search jobs, companies, skills…"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <button className="filter-btn">⊞ Filters</button>
                    <button className="search-btn" onClick={() => {}}>Search</button>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Jobs
                    </button>
                    <button
                        className={`tab ${activeTab === "recommended" ? "active" : ""}`}
                        onClick={() => setActiveTab("recommended")}
                    >
                        Recommended
                    </button>
                    <button
                        className={`tab ${activeTab === "saved" ? "active" : ""}`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved
                    </button>
                </div>

                {/* Paywall banner — free users on recommended tab */}
                {activeTab === "recommended" && !user.premium && (
                    <div className="paywall-notice">
                        ⭐ Showing your top {FREE_RECOMMENDED_LIMIT} matches.{" "}
                        <strong>Upgrade to Premium</strong> to unlock all recommendations.
                    </div>
                )}

                {loadError && <p className="empty-msg">{loadError}</p>}
                <div className="card-list">
                    {jobsToShow.length === 0 && !loadError && (
                        <p className="empty-msg">No jobs found.</p>
                    )}

                    {jobsToShow.map((job) => (
                        <div
                            key={job.id}
                            className="listing-card"
                            onClick={() => onViewJob(job.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="card-left">
                                <div className="card-avatar">{job.companyInitials}</div>
                                <div className="card-info">
                                    <h3 className="card-title">{job.title}</h3>
                                    <p className="card-meta">{job.company} · {job.location}</p>
                                    <div className="card-tags">
                                        <span className="tag">{job.workMode}</span>
                                        <span className="tag">{job.employmentType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-right" onClick={(e) => e.stopPropagation()}>
                                <div className="card-top-right">
                                    <span className={`match-badge ${getMatchColour(job.matchScore)}`}>
                                        {job.matchScore}% match
                                    </span>
                                    <button
                                        className="view-btn primary"
                                        onClick={() => onViewJob(job.id)}
                                    >
                                        View Job
                                    </button>
                                </div>
                                <p className="card-time">{job.postedAt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getMatchColour(score)
{
    if (score >= 85) return "match-green";
    if (score >= 70) return "match-teal";
    return "match-amber";
}

export default JobListings;