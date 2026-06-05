import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import { apiGetAllCandidates, apiSendInvite } from "../scripts/api.js";
import "./listings.css";

// NOTE: This component requires a GET /api/candidate/profiles endpoint that returns
// all candidate profiles (with optional match_score per employer). This endpoint is
// not yet in the backend docs — coordinate with the backend team to add it.
// Expected response shape: array of candidate profile objects, each optionally
// including a match_score field computed against the logged-in employer's job postings.

const FREE_RECOMMENDED_LIMIT = 3;

function CandidateListings({ user, onLogout, onNavigate, onViewCandidate })
{
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [loadError, setLoadError]   = useState("");
    const [activeTab, setActiveTab]   = useState("all");
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        loadCandidates();
    }, []);

    async function loadCandidates()
    {
        setLoading(true);
        setLoadError("");

        const result = await apiGetAllCandidates(user.token);
        if (!result)
        {
            setLoadError("Unable to load candidates. Please try again.");
            setLoading(false);
            return;
        }

        // Normalize API fields to what the UI expects
        const normalized = result.map((p) => ({
            id: p.profile_id || p.user_id,
            userId: p.user_id,
            name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown",
            initials: [p.first_name, p.last_name]
                .filter(Boolean)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?",
            location: p.location || "N/A",
            workMode: p.preferred_work_mode || "N/A",
            experience: p.years_of_experience || "N/A",
            education: p.education_level || "N/A",
            skills: Array.isArray(p.skills) ? p.skills : [],
            matchScore: p.match_score || 0,
        }));

        // Sort highest match first
        normalized.sort((a, b) => b.matchScore - a.matchScore);
        setCandidates(normalized);
        setLoading(false);
    }

    async function sendInvite(candidate)
    {
        const result = await apiSendInvite(user.token, user.id, candidate.userId, null);
        if (!result)
        {
            alert("Could not send invite. Please try again.");
        }
        else
        {
            alert(`Invite sent to ${candidate.name}.`);
        }
    }

    // Recommended = ≥70% match; free employers capped at FREE_RECOMMENDED_LIMIT
    const allRecommended = candidates.filter((c) => c.matchScore >= 70);
    const recommendedCandidates = user.premium
        ? allRecommended
        : allRecommended.slice(0, FREE_RECOMMENDED_LIMIT);

    // All tab — filter by search text
    const filteredCandidates = candidates.filter((c) =>
    {
        if (!searchText) return true;
        const q = searchText.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.experience.toLowerCase().includes(q) ||
            c.skills.some((s) => s.toLowerCase().includes(q))
        );
    });

    const candidatesToShow = activeTab === "recommended" ? recommendedCandidates : filteredCandidates;

    return (
        <div className="listings-page">
            <DashNav
                user={user}
                activePage="candidates"
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
                            placeholder="Search candidates by name, skill, or role…"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <button className="filter-btn">⊞ Filters</button>
                    <button className="search-btn">Search</button>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Candidates
                    </button>
                    <button
                        className={`tab ${activeTab === "recommended" ? "active" : ""}`}
                        onClick={() => setActiveTab("recommended")}
                    >
                        Recommended
                    </button>
                </div>

                {/* Paywall banner — free employers on recommended tab */}
                {activeTab === "recommended" && !user.premium && (
                    <div className="paywall-notice">
                        ⭐ Showing your top {FREE_RECOMMENDED_LIMIT} candidate matches.{" "}
                        <strong>Upgrade to Premium</strong> to unlock all recommendations.
                    </div>
                )}

                {loading && <p className="empty-msg">Loading candidates...</p>}
                {loadError && <p className="empty-msg">{loadError}</p>}

                {/* Candidate cards */}
                {!loading && !loadError && (
                    <div className="card-list">
                        {candidatesToShow.length === 0 && (
                            <p className="empty-msg">No candidates found.</p>
                        )}

                        {candidatesToShow.map((c) => (
                            <div
                                key={c.id}
                                className="listing-card"
                                onClick={() => onViewCandidate(c.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="card-left">
                                    <div className="card-avatar">{c.initials}</div>
                                    <div className="card-info">
                                        <h3 className="card-title">{c.name}</h3>
                                        <p className="card-meta">{c.experience} · {c.location}</p>
                                        <div className="card-tags">
                                            {c.skills.map((skill) => (
                                                <span key={skill} className="tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="card-top-right">
                                        <span className={`match-badge ${getMatchColour(c.matchScore)}`}>
                                            {c.matchScore}% match
                                        </span>
                                        <button
                                            className="view-btn primary"
                                            onClick={() => onViewCandidate(c.id)}
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                    <button
                                        className="view-btn secondary"
                                        style={{ marginTop: "4px" }}
                                        onClick={() => sendInvite(c)}
                                    >
                                        Send Invite
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

export default CandidateListings;