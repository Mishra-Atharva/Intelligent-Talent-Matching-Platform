import { useState } from "react";
import Navbar from "../components/navbar.jsx";
import { apiLogin, apiRegister } from "../scripts/api.js";
import "./home.css";

const API_BASE = "/api";

function Home({ onLoginSuccess })
{
    const [modal, setModal] = useState(null);

    // Login form
    const [loginEmail, setLoginEmail]       = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError]       = useState("");
    const [loginLoading, setLoginLoading]   = useState(false);

    // Signup form — shared
    const [signupType, setSignupType]                       = useState("Candidate");
    const [signupEmail, setSignupEmail]                     = useState("");
    const [signupPassword, setSignupPassword]               = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [signupError, setSignupError]                     = useState("");
    const [signupLoading, setSignupLoading]                 = useState(false);

    // Candidate-only signup fields
    const [signupFirstName, setSignupFirstName] = useState("");
    const [signupLastName, setSignupLastName]   = useState("");

    // Employer-only signup fields
    const [signupCompanyName, setSignupCompanyName] = useState("");
    const [signupIndustry, setSignupIndustry]       = useState("");
    const [signupCompanySize, setSignupCompanySize] = useState("");
    const [signupLocation, setSignupLocation]       = useState("");
    const [signupWebsite, setSignupWebsite]         = useState("");

    function openLogin()
    {
        setModal("login");
        setLoginError("");
    }

    function openSignup(type = "Candidate")
    {
        setSignupType(type);
        setModal("signup");
        setSignupError("");
    }

    function closeModal()
    {
        setModal(null);
    }

    function handleBackdropClick(e)
    {
        if (e.target === e.currentTarget)
        {
            closeModal();
        }
    }

    async function handleLogin(e)
    {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);

        let userData = null;

        try
        {
            // API returns: { user_id, email, first_name, last_name, type, premium, token }
            const result = await apiLogin(loginEmail.trim(), loginPassword);
            if (result)
            {
                const rawType = result.type || null;
                const normalizedType = rawType && String(rawType).toLowerCase() === "candidate"
                    ? "Candidate"
                    : rawType && String(rawType).toLowerCase() === "employer"
                        ? "Employer"
                        : rawType;

                userData = {
                    user_id: result.user_id,
                    name: result.first_name + " " + (result.last_name || ""),
                    email: result.email,
                    token: result.token,
                    type: normalizedType,
                    premium: !!result.premium,
                };
            }
        }
        catch (err)
        {
            console.error("Login error:", err);
        }

        setLoginLoading(false);

        if (userData)
        {
            closeModal();
            onLoginSuccess(userData);
        }
        else
        {
            setLoginError("Invalid email or password. Please try again.");
        }
    }

    async function handleSignup(e)
    {
        e.preventDefault();
        setSignupError("");

        if (signupPassword !== signupConfirmPassword)
        {
            setSignupError("Passwords do not match.");
            return;
        }

        if (signupPassword.length < 6)
        {
            setSignupError("Password must be at least 6 characters.");
            return;
        }

        setSignupLoading(true);

        let userData = null;

        try
        {
            let firstName, lastName;

            if (signupType === "Candidate")
            {
                firstName = signupFirstName;
                lastName  = signupLastName;
            }
            else
            {
                // For employers the API uses first_name for company name and empty last_name
                firstName = signupCompanyName;
                lastName  = "";
            }

            // 1. Register the user account
            const result = await apiRegister(signupEmail, signupPassword, firstName, lastName);

            if (result)
            {
                const rawType = result.type || signupType;
                const normalizedType = rawType && String(rawType).toLowerCase() === "candidate"
                    ? "Candidate"
                    : rawType && String(rawType).toLowerCase() === "employer"
                        ? "Employer"
                        : signupType;

                userData = {
                    user_id: result.user_id,
                    name: result.first_name + " " + (result.last_name || ""),
                    email: result.email,
                    token: result.token,
                    type: normalizedType,
                    premium: !!result.premium,
                };

                // 2. Create the employer profile with the extra fields collected during signup
                if (normalizedType === "Employer")
                {
                    try
                    {
                        await fetch(`${API_BASE}/employer/profile/create`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${result.token}`,
                            },
                            body: JSON.stringify({
                                user_id:      result.user_id,
                                company_name: signupCompanyName,
                                industry:     signupIndustry,
                                company_size: signupCompanySize,
                                location:     signupLocation,
                                website:      signupWebsite || undefined,
                            }),
                        });
                    }
                    catch (profileErr)
                    {
                        // Non-fatal — account is created, profile can be filled in later
                        console.error("Employer profile creation failed:", profileErr);
                    }
                }
            }
        }
        catch (err)
        {
            console.error("Signup error:", err);
        }

        setSignupLoading(false);

        if (userData)
        {
            closeModal();
            onLoginSuccess(userData);
        }
        else
        {
            setSignupError("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="home">
            <Navbar onLoginClick={openLogin} onSignupClick={() => openSignup("Candidate")} />

            {/* Hero section */}
            <section className="hero">
                <div className="hero-bg-glow"></div>
                <div className="hero-bg-grid"></div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot"></span>
                        INTELLIGENT TALENT MATCHING
                    </div>

                    <h1 className="hero-title">
                        Find your perfect<br />
                        <span className="hero-title-accent">match, faster.</span>
                    </h1>

                    <p className="hero-subtitle">
                        AI-powered recommendations connect candidates with the right jobs
                        and employers with the right talent.
                    </p>

                    <div className="hero-actions">
                        <button className="hero-btn-primary" onClick={() => openSignup("Candidate")}>
                            Find Jobs
                        </button>
                        <button className="hero-btn-secondary" onClick={() => openSignup("Employer")}>
                            Hire Talent
                        </button>
                    </div>
                </div>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <span className="hero-stat-number">10K+</span>
                        <span className="hero-stat-label">Job Listings</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">50K+</span>
                        <span className="hero-stat-label">Candidates</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">98%</span>
                        <span className="hero-stat-label">Match Accuracy</span>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="features">
                <h2 className="features-title">How TalentIQ works</h2>
                <p className="features-subtitle">A smarter way to connect talent with opportunity</p>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>AI-Powered Matching</h3>
                        <p>Our algorithm analyses profiles and job descriptions to recommend the top 10 most relevant matches.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Smart Search and Filters</h3>
                        <p>Search by keyword, filter by skills, education, experience, and work mode to find exactly what you need.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Two-Way Platform</h3>
                        <p>Candidates discover jobs, employers discover talent — both sides get intelligent recommendations.</p>
                    </div>
                </div>
            </section>

            {/* Login modal */}
            {modal === "login" && (
                <div className="modal-backdrop" onClick={handleBackdropClick}>
                    <div className="modal">
                        <button className="modal-close" onClick={closeModal}>x</button>

                        <h2 className="modal-title">Welcome back</h2>
                        <p className="modal-subtitle">Sign in to your account</p>

                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label">Email address</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {loginError && <p className="form-error">{loginError}</p>}

                            <button className="form-submit" type="submit" disabled={loginLoading}>
                                {loginLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <p className="modal-switch">
                            No account?{" "}
                            <span className="modal-switch-link" onClick={openSignup}>
                                Create one free
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Signup modal */}
            {modal === "signup" && (
                <div className="modal-backdrop" onClick={handleBackdropClick}>
                    <div className="modal modal-wide">
                        <button className="modal-close" onClick={closeModal}>x</button>

                        <h2 className="modal-title">Create your account</h2>
                        <p className="modal-subtitle">Join TalentIQ for free</p>

                        <form onSubmit={handleSignup}>
                            <div className="form-group">
                                <label className="form-label">I am a...</label>
                                <div className="type-toggle">
                                    <button
                                        type="button"
                                        className={"type-btn" + (signupType === "Candidate" ? " active" : "")}
                                        onClick={() => setSignupType("Candidate")}
                                    >
                                        Candidate
                                    </button>
                                    <button
                                        type="button"
                                        className={"type-btn" + (signupType === "Employer" ? " active" : "")}
                                        onClick={() => setSignupType("Employer")}
                                    >
                                        Employer
                                    </button>
                                </div>
                            </div>

                            {/* Candidate-only fields */}
                            {signupType === "Candidate" && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">First name</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="Jane"
                                            value={signupFirstName}
                                            onChange={(e) => setSignupFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last name</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="Smith"
                                            value={signupLastName}
                                            onChange={(e) => setSignupLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Employer-only fields */}
                            {signupType === "Employer" && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Company name</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="Acme Pty Ltd"
                                            value={signupCompanyName}
                                            onChange={(e) => setSignupCompanyName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Industry</label>
                                            <input
                                                className="form-input"
                                                type="text"
                                                placeholder="e.g. Software and Technology"
                                                value={signupIndustry}
                                                onChange={(e) => setSignupIndustry(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Company size</label>
                                            <select
                                                className="form-input form-select"
                                                value={signupCompanySize}
                                                onChange={(e) => setSignupCompanySize(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Select size</option>
                                                <option value="1-10">1-10 employees</option>
                                                <option value="11-50">11-50 employees</option>
                                                <option value="51-200">51-200 employees</option>
                                                <option value="201-500">201-500 employees</option>
                                                <option value="500+">500+ employees</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Location</label>
                                            <input
                                                className="form-input"
                                                type="text"
                                                placeholder="e.g. Sydney, NSW"
                                                value={signupLocation}
                                                onChange={(e) => setSignupLocation(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Website <span className="form-label-optional">(optional)</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                type="text"
                                                placeholder="acme.com.au"
                                                value={signupWebsite}
                                                onChange={(e) => setSignupWebsite(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Shared fields */}
                            <div className="form-group">
                                <label className="form-label">Email address</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder="At least 6 characters"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm password</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder="Repeat password"
                                        value={signupConfirmPassword}
                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {signupError && <p className="form-error">{signupError}</p>}

                            <button className="form-submit" type="submit" disabled={signupLoading}>
                                {signupLoading ? "Creating account..." : "Create account"}
                            </button>
                        </form>

                        <p className="modal-switch">
                            Already have an account?{" "}
                            <span className="modal-switch-link" onClick={openLogin}>Sign in</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;