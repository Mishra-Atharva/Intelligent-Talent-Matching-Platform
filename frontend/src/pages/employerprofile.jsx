import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import {
    apiGetEmployerProfileByUser,
    apiCreateEmployerProfile,
    apiUpdateEmployerProfile,
} from "../scripts/api.js";
import "./profile.css";

const EMPTY_PROFILE = {
    profile_id: null,
    company_name: "",
    industry: "",
    company_size: "",
    location: "",
    website: "",
    established: "",
    description: "",
};

function EmployerProfile({ user, onLogout, onNavigate })
{
    const [profile, setProfile]     = useState(null);
    const [loading, setLoading]     = useState(true);
    const [editing, setEditing]     = useState(false);
    const [draft, setDraft]         = useState({});
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile()
    {
        setLoading(true);

        const profileData = await apiGetEmployerProfileByUser(user.token, user.id);
        setProfile(profileData || { ...EMPTY_PROFILE });

        setLoading(false);
    }

    function startEdit()
    {
        setDraft({ ...profile });
        setSaveError("");
        setEditing(true);
    }

    function cancelEdit()
    {
        setEditing(false);
        setSaveError("");
    }

    async function saveProfile()
    {
        setSaveError("");

        let result;

        if (profile.profile_id)
        {
            result = await apiUpdateEmployerProfile(user.token, profile.profile_id, draft);
        }
        else
        {
            result = await apiCreateEmployerProfile(user.token, {
                ...draft,
                user_id: user.id,
            });
        }

        if (result)
        {
            setProfile(result);
            setEditing(false);
        }
        else
        {
            setSaveError("Could not save. Please try again.");
        }
    }

    function handleDraftChange(field, value)
    {
        setDraft({ ...draft, [field]: value });
    }

    if (loading)
    {
        return (
            <div className="listings-page">
                <DashNav user={user} activePage="profile" onNavigate={onNavigate} onLogout={onLogout} />
                <div className="profile-body">
                    <p className="field-value-empty">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="listings-page">
            <DashNav user={user} activePage="profile" onNavigate={onNavigate} onLogout={onLogout} />

            <div className="profile-body">
                <h1 className="profile-page-title">Company Profile</h1>

                <div className="profile-section">
                    <div className="profile-section-header">
                        <h2 className="profile-section-title">Company Information</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {user.premium
                                ? <span className="premium-badge">Premium Member</span>
                                : <span className="free-badge">Free Plan</span>
                            }
                            {editing
                                ? (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button className="edit-btn" onClick={cancelEdit}>Cancel</button>
                                        <button className="save-btn" onClick={saveProfile}>Save</button>
                                    </div>
                                )
                                : <button className="edit-btn" onClick={startEdit}>Edit</button>
                            }
                        </div>
                    </div>

                    {saveError && (
                        <p style={{ color: "#ff7070", fontSize: "13px", marginBottom: "12px" }}>{saveError}</p>
                    )}

                    {editing
                        ? (
                            <div className="field-grid">
                                <div className="field-item">
                                    <span className="field-label">Company Name</span>
                                    <input className="profile-input" type="text" value={draft.company_name} onChange={(e) => handleDraftChange("company_name", e.target.value)} placeholder="e.g. Nexus Systems Pty Ltd" />
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Industry</span>
                                    <input className="profile-input" type="text" value={draft.industry} onChange={(e) => handleDraftChange("industry", e.target.value)} placeholder="e.g. Software and Cloud Technology" />
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Company Size</span>
                                    <select className="profile-input profile-select" value={draft.company_size} onChange={(e) => handleDraftChange("company_size", e.target.value)}>
                                        <option value="">Select size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="500+">500+ employees</option>
                                    </select>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Location</span>
                                    <input className="profile-input" type="text" value={draft.location} onChange={(e) => handleDraftChange("location", e.target.value)} placeholder="e.g. Sydney, NSW" />
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Website</span>
                                    <input className="profile-input" type="text" value={draft.website} onChange={(e) => handleDraftChange("website", e.target.value)} placeholder="e.g. company.com.au" />
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Year Established</span>
                                    <input className="profile-input" type="text" value={draft.established} onChange={(e) => handleDraftChange("established", e.target.value)} placeholder="e.g. 2018" />
                                </div>
                                <div className="field-item" style={{ gridColumn: "1 / -1" }}>
                                    <span className="field-label">Company Description</span>
                                    <textarea className="profile-input profile-textarea" value={draft.description} onChange={(e) => handleDraftChange("description", e.target.value)} placeholder="Tell candidates about your company" />
                                </div>
                            </div>
                        )
                        : (
                            <div className="field-grid">
                                <div className="field-item">
                                    <span className="field-label">Company Name</span>
                                    <span className="field-value">{profile.company_name || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Industry</span>
                                    <span className="field-value">{profile.industry || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Company Size</span>
                                    <span className="field-value">{profile.company_size ? profile.company_size + " employees" : <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Location</span>
                                    <span className="field-value">{profile.location || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Website</span>
                                    <span className="field-value">{profile.website || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Year Established</span>
                                    <span className="field-value">{profile.established || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item" style={{ gridColumn: "1 / -1" }}>
                                    <span className="field-label">Company Description</span>
                                    <span className="field-value">{profile.description || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default EmployerProfile;