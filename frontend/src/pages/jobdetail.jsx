import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import { apiApplyToJob, apiSaveJob, apiGetJob } from "../scripts/api.js";
import "./detail.css";

function JobDetail({ user, jobId, onLogout, onNavigate, onBack })
{
    const [job, setJob]             = useState(null);
    const [loading, setLoading]     = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [applied, setApplied]     = useState(false);
    const [saved, setSaved]         = useState(false);
    const [applyMsg, setApplyMsg]   = useState("");

    useEffect(() => {
        async function loadJobDetail()
        {
            setLoading(true);
            setLoadError(null);

            if (!user?.token || !jobId)
            {
                setLoadError("Unable to load job details.");
                setLoading(false);
                return;
            }

            const result = await apiGetJob(user.token, jobId);
            if (result)
            {
                const normalizedJob = {
                    id: result.id || result.job_id || jobId,
                    title: result.title || "",
                    description: result.description || "",
                    company: result.company || result.employer_name || "",
                    companyInitials: result.companyInitials ||
                        (result.company || result.employer_name || "")
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2) || "?",
                    location: result.location || "",
                    workMode: result.workMode || result.work_mode || "",
                    employmentType: result.employmentType || result.employment_type || "",
                    experience: result.experience || result.experience_level || result.experience_required || "",
                    education: result.education || result.education_required || "",
                    skills: Array.isArray(result.skills) ? result.skills : [],
                    matchScore: result.matchScore || result.match_score || 0,
                    ...result,
                };
                setJob(normalizedJob);
            }
            else
            {
                setLoadError("Unable to load job details.");
            }

            setLoading(false);
        }

        loadJobDetail();
    }, [jobId, user?.token]);

    async function handleApply()
    {
        if (applied) return;

        const result = await apiApplyToJob(user.token, jobId, user.user_id);
        if (result)
        {
            setApplied(true);
            setApplyMsg("Application submitted!");
        }
        else
        {
            setApplyMsg("Could not apply. You may have already applied to this job.");
        }
    }

    async function handleSave()
    {
        if (saved) return;

        const result = await apiSaveJob(user.token, user.user_id, jobId);
        if (result)
        {
            setSaved(true);
        }
    }

    if (loading)
    {
        return (
            <div className="listings-page">
                <DashNav user={user} activePage="jobDetail" onNavigate={onNavigate} onLogout={onLogout} />
                <div className="detail-body">
                    <p className="empty-msg">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job || loadError)
    {
        return (
            <div className="listings-page">
                <DashNav user={user} activePage="jobDetail" onNavigate={onNavigate} onLogout={onLogout} />
                <div className="detail-body">
                    <p className="empty-msg">{loadError || "Job not found."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="listings-page">
            <DashNav user={user} activePage="jobDetail" onNavigate={onNavigate} onLogout={onLogout} />

            <div className="detail-body">
                <div className="breadcrumb">
                    <span className="breadcrumb-link" onClick={onBack}>Jobs</span>
                    <span className="breadcrumb-sep">/</span>
                    <span className="breadcrumb-current">{job.title || "Job Details"}</span>
                </div>

                <div className="detail-layout">
                    <div className="detail-main">
                        <div className="detail-header">
                            <div className="detail-avatar">{job.companyInitials || "?"}</div>
                            <div className="detail-header-info">
                                <h1 className="detail-title">{job.title || "Job Title"}</h1>
                                <p className="detail-company">{job.company || "Company"} · {job.location || "Location"}</p>
                                <div className="card-tags" style={{ marginTop: "8px" }}>
                                    {job.workMode && <span className="tag">{job.workMode}</span>}
                                    {job.employmentType && <span className="tag">{job.employmentType}</span>}
                                    {job.experience && <span className="tag">{job.experience}</span>}
                                </div>
                            </div>
                            <div className="detail-header-actions">
                                <button
                                    className="apply-btn-inline"
                                    onClick={handleApply}
                                    disabled={applied}
                                    style={{ opacity: applied ? 0.6 : 1 }}
                                >
                                    {applied ? "Applied" : "Apply Now"}
                                </button>
                                <button
                                    className="save-btn-inline"
                                    onClick={handleSave}
                                    disabled={saved}
                                    style={{ opacity: saved ? 0.6 : 1 }}
                                >
                                    {saved ? "Saved" : "Save"}
                                </button>
                            </div>
                        </div>

                        {applyMsg && (
                            <p style={{ color: "#34d399", fontSize: "13px", marginBottom: "16px" }}>{applyMsg}</p>
                        )}

                        <div className="detail-section">
                            <h4 className="detail-section-label">About the role</h4>
                            <p className="detail-description">{job.description || "No description available"}</p>
                        </div>

                        <div className="detail-section">
                            <h4 className="detail-section-label">Required skills</h4>
                            <div className="card-tags">
                                {(job.skills && Array.isArray(job.skills) && job.skills.length > 0) ? (
                                    job.skills.map((skill) => (
                                        <span key={skill} className="tag tag-highlight">{skill}</span>
                                    ))
                                ) : (
                                    <p style={{ fontSize: "13px", color: "#9ca3af" }}>No skills listed</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="detail-sidebar">
                        <div className="match-score-card">
                            <span className={"match-score-number " + getMatchColour(job.matchScore || 0)}>
                                {job.matchScore || 0}%
                            </span>
                            <p className="match-score-label">Profile match score</p>
                        </div>

                        <div className="sidebar-info-card">
                            <div className="sidebar-row">
                                <span className="sidebar-key">Work mode</span>
                                <span className="sidebar-val">{job.workMode || "N/A"}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Location</span>
                                <span className="sidebar-val">{job.location || "N/A"}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Experience</span>
                                <span className="sidebar-val">{job.experience || "N/A"}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-key">Education</span>
                                <span className="sidebar-val">{job.education || "N/A"}</span>
                            </div>
                        </div>

                        <button
                            className="sidebar-apply-btn"
                            onClick={handleApply}
                            disabled={applied}
                            style={{ opacity: applied ? 0.6 : 1 }}
                        >
                            {applied ? "Applied" : "Apply Now"}
                        </button>
                        <button
                            className="sidebar-secondary-btn"
                            onClick={handleSave}
                            disabled={saved}
                            style={{ opacity: saved ? 0.6 : 1 }}
                        >
                            {saved ? "Saved" : "Save Job"}
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

export default JobDetail;