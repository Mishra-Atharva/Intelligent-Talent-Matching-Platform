import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import { apiGetSavedJobs, apiUnsaveJob, apiGetJob } from "../scripts/api.js";
import "./listings.css";

function SavedJobs({ user, onLogout, onNavigate, onViewJob })
{
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        loadSavedJobs();
    }, []);

    async function loadSavedJobs()
    {
        setLoading(true);

        const savedRecords = await apiGetSavedJobs(user.token, user.id);

        if (savedRecords && savedRecords.length > 0)
        {
            const jobPromises = savedRecords.map((record) =>
                apiGetJob(user.token, record.job_id).then((job) => {
                    if (!job) return null;
                    const companyDisplay = job.company || job.employer_name || `Employer ${job.employer_id ?? ""}`;
                    return {
                        ...job,
                        saved_id: record.saved_id,
                        id: job.id ?? job.job_id,
                        company: companyDisplay,
                        companyInitials: companyDisplay
                            ? companyDisplay.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                            : String(job.employer_id ?? "?").slice(-2),
                        workMode: job.workMode ?? job.work_mode ?? "",
                        employmentType: job.employmentType ?? job.employment_type ?? "",
                        matchScore: job.matchScore ?? job.match_score ?? 0,
                    };
                })
            );

            const jobs = (await Promise.all(jobPromises)).filter(Boolean);
            setSavedJobs(jobs);
        }
        else
        {
            setSavedJobs([]);
        }

        setLoading(false);
    }

    async function unsaveJob(savedId)
    {
        const result = await apiUnsaveJob(user.token, savedId);
        if (result)
        {
            setSavedJobs(savedJobs.filter((j) => j.saved_id !== savedId));
        }
    }

    return (
        <div className="listings-page">
            <DashNav user={user} activePage="saved" onNavigate={onNavigate} onLogout={onLogout} />

            <div className="listings-body">
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "20px", margin: "0 0 24px", letterSpacing: "-0.3px" }}>
                    Saved Jobs
                </h2>

                {loading && <p className="empty-msg">Loading saved jobs...</p>}

                {!loading && savedJobs.length === 0 && (
                    <p className="empty-msg">You have not saved any jobs yet. Browse jobs and click Save Job to add them here.</p>
                )}

                {!loading && savedJobs.length > 0 && (
                    <div className="card-list">
                        {savedJobs.map((job) => (
                            <div
                                key={job.saved_id}
                                className="listing-card"
                                onClick={() => onViewJob(job.job_id || job.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="card-left">
                                    <div className="card-avatar">{job.companyInitials || "?"}</div>
                                    <div className="card-info">
                                        <h3 className="card-title">{job.title}</h3>
                                        <p className="card-meta">{job.company || job.employer_id} · {job.location}</p>
                                        <div className="card-tags">
                                            <span className="tag">{job.work_mode || job.workMode}</span>
                                            <span className="tag">{job.employment_type || job.employmentType}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="card-top-right">
                                        {job.matchScore && (
                                            <span className={"match-badge " + getMatchColour(job.matchScore)}>
                                                {job.matchScore}% match
                                            </span>
                                        )}
                                        <button className="view-btn primary" onClick={() => onViewJob(job.job_id || job.id)}>
                                            View Job
                                        </button>
                                    </div>
                                    <button
                                        className="view-btn secondary"
                                        style={{ marginTop: "6px" }}
                                        onClick={() => unsaveJob(job.saved_id)}
                                    >
                                        Remove
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

export default SavedJobs;