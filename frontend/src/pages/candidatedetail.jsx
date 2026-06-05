import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import {
    apiGetCandidateProfile,
    apiGetUserSkills,
    apiSendInvite,
} from "../scripts/api.js";
import "./detail.css";

function CandidateDetail({ user, candidateId, onLogout, onNavigate, onBack })
{
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [invited, setInvited]     = useState(false);
    const [inviteMsg, setInviteMsg] = useState("");

    useEffect(() => {
        async function loadCandidate()
        {
            setLoading(true);
            setLoadError(null);

            const profileData = await apiGetCandidateProfile(user.token, candidateId);
            if (!profileData)
            {
                setLoadError("Candidate not found.");
                setLoading(false);
                return;
            }

            const skillsData = await apiGetUserSkills(user.token, profileData.user_id || candidateId);
            const skillNames = (skillsData || []).map((s) => s.skill);

            const fullName = [profileData.first_name, profileData.last_name].filter(Boolean).join(" ");
            const initials = fullName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?";

            setCandidate({
                name: fullName || "Unknown Candidate",
                initials,
                location: profileData.location || "N/A",
                workMode: profileData.preferred_work_mode || "N/A",
                experience: profileData.years_of_experience || "N/A",
                education: profileData.education_level || "N/A",
                major: profileData.major || "N/A",
                summary: profileData.summary || "No summary provided.",
                skills: skillNames,
                matchScore: profileData.match_score || 0,
                userId: profileData.user_id || candidateId,
            });

            setLoading(false);
        }

        loadCandidate();
    }, [candidateId, user.token]);

    async function handleInvite()
    {
        if (invited) return;

        const result = await apiSendInvite(user.token, user.user_id, candidate.userId, null);
        if (result)
        {
            setInvited(true);
            setInviteMsg("Invite sent.");
        }
        else
        {
            setInviteMsg("Could not send invite. Please try again.");
        }
    }

    if (loading)
    {
        return (
            <div className="listings-page">
                <DashNav user={user} activePage="candidateDetail" onNavigate={onNavigate} onLogout={onLogout} />
                <div className="detail-body">
                    <p className="empty-msg">Loading candidate profile...</p>
                </div>
            </div>
        );
    }

    if (loadError || !candidate)
    {
        return (
            <div className="listings-page">
                <DashNav user={user} activePage="candidateDetail" onNavigate={onNavigate} onLogout={onLogout} />
                <div className="detail-body">
                    <p className="empty-msg">{loadError || "Candidate not found."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="listings-page">
            <DashNav user={user} activePage="candidateDetail" onNavigate={onNavigate} onLogout={onLogout} />

            <div className="detail-body">
                <div className="breadcrumb">
                    <span className="breadcrumb-link" onClick={onBack}>Candidates</span>
                    <span className="breadcrumb-sep">/</span>
                    <span className="breadcrumb-current">{candidate.name}</span>
                </div>

                <div className="detail-layout">
                    <div className="detail-main">
                        <div className="detail-header">
                            <div className="detail-avatar">{candidate.initials}</div>
                            <div className="detail-header-info">
                                <h1 className="detail-title">{candidate.name}</h1>
                                <p className="detail-company">{candidate.experience} · {candidate.location}</p>
                                <div className="card-tags" style={{ marginTop: "8px" }}>
                                    <span className="tag">{candidate.workMode}</span>
                                    <span className="tag">{candidate.experience}</span>
                                    <span className="tag">{candidate.education}</span>
                                </div>
                            </div>
                            <div className="detail-header-actions">
                                <button
                                    className="apply-btn-inline"
                                    onClick={handleInvite}
                                    disabled={invited}
                                    style={{ opacity: invited ? 0.6 : 1 }}
                                >
                                    {invited ? "Invited" : "Send Invite"}
                                </button>
                            </div>
                        </div>

                        {inviteMsg && (
                            <p style={{ color: "#34d399", fontSize: "13px", marginBottom: "16px" }}>{inviteMsg}</p>
                        )}

                        <div className="detail-section">
                            <h4 className="detail-section-label">About the candidate</h4>
                            <p className="detail-description">{candidate.summary}</p>
                        </div>

                        <div className="detail-section">
                            <h4 className="detail-section-label">Skills</h4>
                            <div className="card-tags">
                                {candidate.skills.length > 0
                                    ? candidate.skills.map((skill) => (
                                        <span key={skill} className="tag tag-highlight">{skill}</span>
                                    ))
                                    : <p style={{ fontSize: "13px", color: "#9ca3af" }}>No skills listed</p>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="detail-sidebar">
                        <div className="match-score-card">
                            <span className={"match-score-number " + getMatchColour(candidate.matchScore)}>
                                {candidate.matchScore}%
                            </span>
                            <p className="match-score-label">Candidate match score</p>
                        </div>

                        <div className="sidebar-info-card">
                            <div className="sidebar-row">
                                <span className="sidebar-key">Work mode</span>
                                <span className="sidebar-val">{candidate.workMode}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Location</span>
                                <span className="sidebar-val">{candidate.location}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Experience</span>
                                <span className="sidebar-val">{candidate.experience}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Education</span>
                                <span className="sidebar-val">{candidate.education}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Major</span>
                                <span className="sidebar-val">{candidate.major}</span>
                            </div>
                        </div>

                        <button
                            className="sidebar-apply-btn"
                            onClick={handleInvite}
                            disabled={invited}
                            style={{ opacity: invited ? 0.6 : 1 }}
                        >
                            {invited ? "Invited" : "Send Invite"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getMatchColour(score)
{
    if (score >= 85) return "score-green";
    if (score >= 70) return "score-teal";
    return "score-amber";
}

export default CandidateDetail;