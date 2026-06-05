import { useState, useEffect } from "react";
import Home from "./pages/home.jsx";
import JobListings from "./pages/jobListings.jsx";
import JobDetail from "./pages/jobDetail.jsx";
import CandidateListings from "./pages/candidateListings.jsx";
import CandidateDetail from "./pages/candidateDetail.jsx";
import CandidateProfile from "./pages/candidateProfile.jsx";
import EmployerProfile from "./pages/employerProfile.jsx";
import MyJobs from "./pages/myJobs.jsx";
import SavedJobs from "./pages/savedJobs.jsx";
import "./App.css";

// ─────────────────────────────────────────────
//  page values:
//  Candidate: "jobs" | "jobDetail" | "saved" | "profile"
//  Employer:  "candidates" | "candidateDetail" | "myjobs" | "profile"
// ─────────────────────────────────────────────

const STORAGE_KEY = "talentiq_user";

function App()
{
    const [user, setUser]             = useState(null);
    const [page, setPage]             = useState("home");
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        try
        {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved)
            {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.token)
                {
                    setUser(parsed);
                    const normalizedType = parsed?.type && String(parsed.type).toLowerCase();
                    if (normalizedType === "candidate")
                    {
                        setPage("jobs");
                    }
                    else if (normalizedType === "employer")
                    {
                        setPage("candidates");
                    }
                    else
                    {
                        setPage("jobs");
                    }
                }
            }
        }
        catch (err)
        {
            console.error("Failed to load saved user from localStorage:", err);
        }
    }, []);

    function handleLoginSuccess(userData)
    {
        setUser(userData);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

        const normalizedType = userData?.type && String(userData.type).toLowerCase();
        if (normalizedType === "candidate")
        {
            setPage("jobs");
        }
        else if (normalizedType === "employer")
        {
            setPage("candidates");
        }
        else
        {
            setPage("jobs");
        }
    }

    function handleLogout()
    {
        setUser(null);
        setPage("home");
        setSelectedId(null);
        window.localStorage.removeItem(STORAGE_KEY);
    }

    function navigateTo(targetPage, id)
    {
        setSelectedId(id || null);
        setPage(targetPage);
    }

    // Common props passed to every dashboard page
    const commonProps = {
        user: user,
        onLogout: handleLogout,
        onNavigate: navigateTo,
    };

    if (!user || page === "home")
    {
        return <Home onLoginSuccess={handleLoginSuccess} />;
    }

    if (page === "jobs")
    {
        return (
            <JobListings
                {...commonProps}
                onViewJob={(id) => navigateTo("jobDetail", id)}
            />
        );
    }

    if (page === "jobDetail")
    {
        return (
            <JobDetail
                {...commonProps}
                jobId={selectedId}
                onBack={() => navigateTo("jobs")}
            />
        );
    }

    if (page === "saved")
    {
        return (
            <SavedJobs
                {...commonProps}
                onViewJob={(id) => navigateTo("jobDetail", id)}
            />
        );
    }

    if (page === "candidates")
    {
        return (
            <CandidateListings
                {...commonProps}
                onViewCandidate={(id) => navigateTo("candidateDetail", id)}
            />
        );
    }

    if (page === "candidateDetail")
    {
        return (
            <CandidateDetail
                {...commonProps}
                candidateId={selectedId}
                onBack={() => navigateTo("candidates")}
            />
        );
    }

    if (page === "myjobs")
    {
        return <MyJobs {...commonProps} />;
    }

    if (page === "profile")
    {
        if (user.type === "Candidate")
        {
            return <CandidateProfile {...commonProps} />;
        }
        else
        {
            return <EmployerProfile {...commonProps} />;
        }
    }

    return null;
}

export default App;