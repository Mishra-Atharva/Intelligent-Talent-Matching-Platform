import "./navbar.css";

function Navbar({ onLoginClick, onSignupClick }) 
{
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <div className="navbar-logo-dot"></div>
                <span className="navbar-logo-text">TalentIQ</span>
            </div>

            <div className="navbar-actions">
                <button className="btn-ghost" onClick={onLoginClick}>
                    Log in
                </button>
                <button className="btn-primary" onClick={onSignupClick}>
                    Sign up free
                </button>
            </div>
        </nav>
    );
}

export default Navbar;