import { useState, useEffect } from "react";
import DashNav from "../components/dashNav.jsx";
import {
    apiGetCandidateProfileByUser,
    apiCreateCandidateProfile,
    apiUpdateCandidateProfile,
    apiGetUserSkills,
    apiAddSkill,
    apiDeleteSkill,
    apiAddExperience,
    apiDeleteExperience,
} from "../scripts/api.js";
import "./profile.css";

// Empty profile used when a new user has no profile yet
const EMPTY_PROFILE = {
    profile_id: null,
    first_name: "",
    last_name: "",
    age: "",
    phone: "",
    location: "",
    education_level: "",
    major: "",
    university: "",
    graduation_year: "",
    years_of_experience: "",
    preferred_work_mode: "Hybrid",
    preferred_location: "",
    summary: "",
};

function CandidateProfile({ user, onLogout, onNavigate })
{
    const [profile, setProfile]               = useState(null);
    const [skills, setSkills]                 = useState([]);
    const [experience, setExperience]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [draft, setDraft]                   = useState({});
    const [newSkill, setNewSkill]             = useState("");
    const [newExp, setNewExp]                 = useState({ company: "", role: "", start_date: "", end_date: "" });
    const [saveError, setSaveError]           = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile()
    {
        setLoading(true);

        const profileData = await apiGetCandidateProfileByUser(user.token, user.id);
        if (profileData)
        {
            setProfile(profileData);
            const skillsData = await apiGetUserSkills(user.token, user.id);
            setSkills(skillsData || []);
        }
        else
        {
            setProfile({ ...EMPTY_PROFILE });
        }

        setLoading(false);
    }

    function startEdit(section)
    {
        setDraft({ ...profile });
        setNewSkill("");
        setNewExp({ company: "", role: "", start_date: "", end_date: "" });
        setSaveError("");
        setEditingSection(section);
    }

    function cancelEdit()
    {
        setEditingSection(null);
        setSaveError("");
    }

    async function saveSection(section)
    {
        setSaveError("");

        let result;

        if (profile.profile_id)
        {
            result = await apiUpdateCandidateProfile(user.token, profile.profile_id, draft);
        }
        else
        {
            result = await apiCreateCandidateProfile(user.token, {
                ...draft,
                user_id: user.id,
            });
        }

        if (result)
        {
            setProfile(result);
            setEditingSection(null);
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

    async function addSkill()
    {
        const trimmed = newSkill.trim();
        if (!trimmed) return;

        const result = await apiAddSkill(user.token, user.id, trimmed);
        if (result)
        {
            setSkills([...skills, result]);
            setNewSkill("");
        }
    }

    async function removeSkill(skillId)
    {
        const result = await apiDeleteSkill(user.token, skillId);
        if (result)
        {
            setSkills(skills.filter((s) => s.skill_id !== skillId));
        }
    }

    async function addExperience()
    {
        if (!newExp.company || !newExp.role || !newExp.start_date) return;

        const result = await apiAddExperience(
            user.token,
            user.id,
            newExp.company,
            newExp.role,
            newExp.start_date,
            newExp.end_date || null
        );

        if (result)
        {
            setExperience([...experience, result]);
            setNewExp({ company: "", role: "", start_date: "", end_date: "" });
        }
    }

    async function removeExperience(experienceId)
    {
        const result = await apiDeleteExperience(user.token, experienceId);
        if (result)
        {
            setExperience(experience.filter((e) => e.experience_id !== experienceId));
        }
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
                <h1 className="profile-page-title">My Profile</h1>

                {/* Account info — read only */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h2 className="profile-section-title">Account</h2>
                        {user.premium
                            ? <span className="premium-badge">Premium Member</span>
                            : <span className="free-badge">Free Plan</span>
                        }
                    </div>
                    <div className="field-grid">
                        <div className="field-item">
                            <span className="field-label">First Name</span>
                            <span className="field-value">{profile.first_name || <span className="field-value-empty">Not set</span>}</span>
                        </div>
                        <div className="field-item">
                            <span className="field-label">Last Name</span>
                            <span className="field-value">{profile.last_name || <span className="field-value-empty">Not set</span>}</span>
                        </div>
                        <div className="field-item">
                            <span className="field-label">Age</span>
                            <span className="field-value">{profile.age || <span className="field-value-empty">Not set</span>}</span>
                        </div>
                        <div className="field-item">
                            <span className="field-label">Phone</span>
                            <span className="field-value">{profile.phone || <span className="field-value-empty">Not set</span>}</span>
                        </div>
                        <div className="field-item">
                            <span className="field-label">Location</span>
                            <span className="field-value">{profile.location || <span className="field-value-empty">Not set</span>}</span>
                        </div>
                    </div>
                </div>

                {/* Education */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h2 className="profile-section-title">Education</h2>
                        {editingSection === "education"
                            ? (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="edit-btn" onClick={cancelEdit}>Cancel</button>
                                    <button className="save-btn" onClick={() => saveSection("education")}>Save</button>
                                </div>
                            )
                            : <button className="edit-btn" onClick={() => startEdit("education")}>Edit</button>
                        }
                    </div>

                    {editingSection === "education"
                        ? (
                            <div>
                                {saveError && <p className="field-value-empty" style={{ color: "#ff7070", marginBottom: "12px" }}>{saveError}</p>}
                                <div className="field-grid">
                                    <div className="field-item">
                                        <span className="field-label">Education Level</span>
                                        <select
                                            className="profile-input profile-select"
                                            value={draft.education_level}
                                            onChange={(e) => handleDraftChange("education_level", e.target.value)}
                                        >
                                            <option value="">Select level</option>
                                            <option>High School</option>
                                            <option>Certificate / Diploma</option>
                                            <option>Bachelor's Degree</option>
                                            <option>Master's Degree</option>
                                            <option>PhD</option>
                                        </select>
                                    </div>
                                    <div className="field-item">
                                        <span className="field-label">Major / Field of Study</span>
                                        <input className="profile-input" type="text" value={draft.major} onChange={(e) => handleDraftChange("major", e.target.value)} placeholder="e.g. Computer Science" />
                                    </div>
                                    <div className="field-item">
                                        <span className="field-label">University</span>
                                        <input className="profile-input" type="text" value={draft.university} onChange={(e) => handleDraftChange("university", e.target.value)} placeholder="e.g. University of Sydney" />
                                    </div>
                                    <div className="field-item">
                                        <span className="field-label">Graduation Year</span>
                                        <input className="profile-input" type="text" value={draft.graduation_year} onChange={(e) => handleDraftChange("graduation_year", e.target.value)} placeholder="e.g. 2022" />
                                    </div>
                                </div>
                            </div>
                        )
                        : (
                            <div className="field-grid">
                                <div className="field-item">
                                    <span className="field-label">Education Level</span>
                                    <span className="field-value">{profile.education_level || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Major / Field</span>
                                    <span className="field-value">{profile.major || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">University</span>
                                    <span className="field-value">{profile.university || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Graduation Year</span>
                                    <span className="field-value">{profile.graduation_year || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                            </div>
                        )
                    }
                </div>

                {/* Work Experience */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h2 className="profile-section-title">Work Experience</h2>
                        {editingSection === "experience"
                            ? (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="edit-btn" onClick={cancelEdit}>Cancel</button>
                                    <button className="save-btn" onClick={() => saveSection("experience")}>Save</button>
                                </div>
                            )
                            : <button className="edit-btn" onClick={() => startEdit("experience")}>Edit</button>
                        }
                    </div>

                    {editingSection === "experience"
                        ? (
                            <div>
                                <div className="field-grid" style={{ marginBottom: "16px" }}>
                                    <div className="field-item">
                                        <span className="field-label">Years of Experience</span>
                                        <select
                                            className="profile-input profile-select"
                                            value={draft.years_of_experience}
                                            onChange={(e) => handleDraftChange("years_of_experience", e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option>Less than 1 year</option>
                                            <option>1 year</option>
                                            <option>2 years</option>
                                            <option>3 years</option>
                                            <option>4 years</option>
                                            <option>5+ years</option>
                                            <option>10+ years</option>
                                        </select>
                                    </div>
                                </div>

                                <span className="field-label" style={{ display: "block", marginBottom: "8px" }}>Work History</span>
                                <div className="experience-list">
                                    {experience.map((exp) => (
                                        <div key={exp.experience_id} className="experience-entry">
                                            <div className="experience-entry-view">
                                                <div>
                                                    <p className="experience-role">{exp.role}</p>
                                                    <p className="experience-company">{exp.company}</p>
                                                    <p className="experience-dates">
                                                        {exp.start_date} — {exp.end_date || "Present"}
                                                    </p>
                                                </div>
                                                <button className="remove-btn" onClick={() => removeExperience(exp.experience_id)}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "12px" }}>
                                    <span className="field-label" style={{ display: "block", marginBottom: "10px" }}>Add Entry</span>
                                    <div className="field-grid" style={{ marginBottom: "8px" }}>
                                        <div className="field-item">
                                            <span className="field-label">Company</span>
                                            <input className="profile-input" type="text" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} placeholder="Company name" />
                                        </div>
                                        <div className="field-item">
                                            <span className="field-label">Role</span>
                                            <input className="profile-input" type="text" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} placeholder="Job title" />
                                        </div>
                                        <div className="field-item">
                                            <span className="field-label">Start Date</span>
                                            <input className="profile-input" type="date" value={newExp.start_date} onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })} />
                                        </div>
                                        <div className="field-item">
                                            <span className="field-label">End Date (leave blank if current)</span>
                                            <input className="profile-input" type="date" value={newExp.end_date} onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })} />
                                        </div>
                                    </div>
                                    <button className="add-btn" onClick={addExperience}>+ Add Experience</button>
                                </div>
                            </div>
                        )
                        : (
                            <div>
                                <div className="field-grid" style={{ marginBottom: "16px" }}>
                                    <div className="field-item">
                                        <span className="field-label">Years of Experience</span>
                                        <span className="field-value">{profile.years_of_experience || <span className="field-value-empty">Not set</span>}</span>
                                    </div>
                                </div>
                                {experience.length === 0
                                    ? <p className="field-value-empty">No work history added yet.</p>
                                    : (
                                        <div className="experience-list">
                                            {experience.map((exp) => (
                                                <div key={exp.experience_id} className="experience-entry">
                                                    <p className="experience-role">{exp.role}</p>
                                                    <p className="experience-company">{exp.company}</p>
                                                    <p className="experience-dates">{exp.start_date} — {exp.end_date || "Present"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>

                {/* Skills — these are saved per-skill, not with the profile save */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h2 className="profile-section-title">Skills</h2>
                        {editingSection === "skills"
                            ? <button className="edit-btn" onClick={cancelEdit}>Done</button>
                            : <button className="edit-btn" onClick={() => startEdit("skills")}>Edit</button>
                        }
                    </div>

                    {editingSection === "skills"
                        ? (
                            <div>
                                <div className="skills-list">
                                    {skills.map((s) => (
                                        <div key={s.skill_id} className="skill-tag">
                                            {s.skill}
                                            <button onClick={() => removeSkill(s.skill_id)}>x</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="skill-add-row" style={{ marginTop: "10px" }}>
                                    <input
                                        className="profile-input"
                                        type="text"
                                        placeholder="Type a skill and press Add"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                                    />
                                    <button className="add-btn" onClick={addSkill}>Add</button>
                                </div>
                            </div>
                        )
                        : (
                            <div className="skills-list">
                                {skills.length === 0
                                    ? <span className="field-value-empty">No skills added yet.</span>
                                    : skills.map((s) => (
                                        <div key={s.skill_id} className="skill-tag">{s.skill}</div>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>

                {/* Preferences */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h2 className="profile-section-title">Job Preferences</h2>
                        {editingSection === "preferences"
                            ? (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="edit-btn" onClick={cancelEdit}>Cancel</button>
                                    <button className="save-btn" onClick={() => saveSection("preferences")}>Save</button>
                                </div>
                            )
                            : <button className="edit-btn" onClick={() => startEdit("preferences")}>Edit</button>
                        }
                    </div>

                    {editingSection === "preferences"
                        ? (
                            <div className="field-grid">
                                <div className="field-item">
                                    <span className="field-label">Preferred Work Mode</span>
                                    <div className="work-mode-row">
                                        {["Remote", "Hybrid", "On-site"].map((mode) => (
                                            <button
                                                key={mode}
                                                className={"mode-btn" + (draft.preferred_work_mode === mode ? " active" : "")}
                                                onClick={() => handleDraftChange("preferred_work_mode", mode)}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Preferred Location</span>
                                    <input className="profile-input" type="text" value={draft.preferred_location} onChange={(e) => handleDraftChange("preferred_location", e.target.value)} placeholder="e.g. Sydney, NSW" />
                                </div>
                                <div className="field-item" style={{ gridColumn: "1 / -1" }}>
                                    <span className="field-label">Summary / Bio</span>
                                    <textarea className="profile-input profile-textarea" value={draft.summary} onChange={(e) => handleDraftChange("summary", e.target.value)} placeholder="Write a short summary about yourself" />
                                </div>
                            </div>
                        )
                        : (
                            <div className="field-grid">
                                <div className="field-item">
                                    <span className="field-label">Preferred Work Mode</span>
                                    <span className="field-value">{profile.preferred_work_mode || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item">
                                    <span className="field-label">Preferred Location</span>
                                    <span className="field-value">{profile.preferred_location || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                                <div className="field-item" style={{ gridColumn: "1 / -1" }}>
                                    <span className="field-label">Summary / Bio</span>
                                    <span className="field-value">{profile.summary || <span className="field-value-empty">Not set</span>}</span>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default CandidateProfile;