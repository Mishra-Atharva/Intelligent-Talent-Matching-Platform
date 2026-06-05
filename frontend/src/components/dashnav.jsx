import "./dashNav.css";

function DashNav({ user, activePage, onNavigate, onLogout })
{
    const isCandidate = user.type === "Candidate";

    const candidateLinks = [
        { key: "jobs",    label: "Jobs" },
        { key: "saved",   label: "Saved" },
        { key: "profile", label: "Profile" },
    ];

    const employerLinks = [
        { key: "candidates", label: "Candidates" },
        { key: "myjobs",     label: "My Jobs" },
        { key: "profile",    label: "Profile" },
    ];

    const links = isCandidate ? candidateLinks : employerLinks;

    function isActive(linkKey)
    {
        if (activePage === linkKey) return true;
        if (linkKey === "jobs" && activePage === "jobDetail") return true;
        if (linkKey === "candidates" && activePage === "candidateDetail") return true;
        return false;
    }

    const initials = user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <nav className="dash-nav">
            <div className="dash-nav-left">
                <div
                    className="dash-nav-logo"
                    onClick={() => onNavigate && onNavigate(isCandidate ? "jobs" : "candidates")}
                >
                    <div className="dash-nav-dot"></div>
                    <span>TalentIQ</span>
                </div>

                <div className="dash-nav-links">
                    {links.map((link) => (
                        <button
                            key={link.key}
                            className={`dash-nav-link ${isActive(link.key) ? "active" : ""}`}
                            onClick={() => onNavigate && onNavigate(link.key)}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dash-nav-right">
                {user.premium && (
                    <span className="dash-nav-premium">Premium</span>
                )}

                {!isCandidate && (
                    <button className="dash-nav-post-btn" onClick={() => onNavigate("myjobs")}>
                        + Post Job
                    </button>
                )}

                <div
                    className="dash-nav-avatar"
                    title={"Logged in as " + user.name + " — click to log out"}
                    onClick={onLogout}
                >
                    {initials}
                </div>
            </div>
        </nav>
    );
}

export default DashNav;