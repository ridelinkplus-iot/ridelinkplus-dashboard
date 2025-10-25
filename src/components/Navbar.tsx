import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import "./Navbar.css";
import logo from "../assets/logo.png";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeBuses, setActiveBuses] = useState(0);
  const [activeRoutes, setActiveRoutes] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<
    "passenger" | "owner" | "admin" | null
  >(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profileImage: ""
  });

  // Function to check and update login state
  const checkLoginState = () => {
    const owner = localStorage.getItem("isOwner") === "true";
    const passenger = localStorage.getItem("isPassenger") === "true";
    const admin = localStorage.getItem("isAdmin") === "true";
    const storedName = localStorage.getItem("userName") || "";
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedImage = localStorage.getItem("userProfileImage") || "";

    if (owner) {
      setIsLoggedIn(true);
      setUserType("owner");
      setUserData({
        name: storedName,
        email: storedEmail,
        profileImage: storedImage
      });
    } else if (passenger) {
      setIsLoggedIn(true);
      setUserType("passenger");
      setUserData({
        name: storedName,
        email: storedEmail,
        profileImage: storedImage
      });
    } else if (admin) {
      setIsLoggedIn(true);
      setUserType("admin");
      setUserData({
        name: storedName,
        email: storedEmail,
        profileImage: storedImage
      });
    } else {
      setIsLoggedIn(false);
      setUserType(null);
      setUserData({ name: "", email: "", profileImage: "" });
    }
  };

  useEffect(() => {
    // Fetch active buses count
    const busesRef = ref(db, "buses");
    const unsubscribeBuses = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const onlineBuses = Object.values(data).filter(
          (bus: any) => bus.status === "online"
        ).length;
        setActiveBuses(onlineBuses);
      } else {
        setActiveBuses(0);
      }
    });

    // Fetch active routes count
    const routesRef = ref(db, "routes");
    const unsubscribeRoutes = onValue(routesRef, (snapshot) => {
      const data = snapshot.val();
      setActiveRoutes(data ? Object.keys(data).length : 0);
    });

    // Check login state on component mount
    checkLoginState();

    // Listen for storage changes (when user logs in from another tab or window)
    const handleStorageChange = () => {
      checkLoginState();
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom login event
    const handleLoginEvent = () => {
      checkLoginState();
    };
    window.addEventListener("userLoggedIn", handleLoginEvent);

    return () => {
      unsubscribeBuses();
      unsubscribeRoutes();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleLoginEvent);
    };
  }, []);

  // Re-check login state whenever location changes (navigation)
  useEffect(() => {
    checkLoginState();
    // Close mobile menu on navigation
    setMenuOpen(false);
  }, [location]);

  // Close mobile menu when window is resized above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("isOwner");
    localStorage.removeItem("isPassenger");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfileImage");

    setIsLoggedIn(false);
    setUserType(null);
    setDropdownOpen(false);
    setMenuOpen(false);
    setUserData({ name: "", email: "", profileImage: "" });

    // Dispatch custom event for logout
    window.dispatchEvent(new Event("userLoggedOut"));

    // Navigate to home page
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest(".profile-section")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        menuOpen &&
        !target.closest(".nav-links") &&
        !target.closest(".menu-toggle")
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleNavLinkClick = () => {
    setMenuOpen(false);
  };

  const renderProfileSection = () => {
    // Get first letter of name or email for default avatar
    const displayName = userData.name || userData.email;
    const avatarLetter = displayName
      ? displayName.charAt(0).toUpperCase()
      : "U";

    return (
      <div className="profile-section">
        <button
          onClick={toggleDropdown}
          className="profile-button"
          aria-label="User menu"
          aria-expanded={dropdownOpen}
        >
          {userData.profileImage ? (
            <img
              src={userData.profileImage}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-image-default">{avatarLetter}</div>
          )}
          <span className="profile-name">{displayName}</span>
          <svg
            className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {dropdownOpen && (
          <>
            {window.innerWidth <= 768 && (
              <div
                className="dropdown-overlay"
                onClick={() => setDropdownOpen(false)}
              />
            )}
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  {userData.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="Profile"
                      className="dropdown-user-avatar"
                    />
                  ) : (
                    <div className="dropdown-user-avatar-default">
                      {avatarLetter}
                    </div>
                  )}
                  <div className="dropdown-user-details">
                    <div className="dropdown-user-name">
                      {userData.name || "User"}
                    </div>
                    <div className="dropdown-user-email">{userData.email}</div>
                  </div>
                </div>
              </div>
              <div className="dropdown-content">
                {userType === "owner" && (
                  <>
                    <Link
                      to="/owner-dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M3 10h5V3H3v7zm0 7h5v-5H3v5zm7 0h5v-7h-5v7zm0-17v5h5V0h-5z"
                          fill="currentColor"
                        />
                      </svg>
                      Dashboard
                    </Link>
                    <div className="dropdown-divider"></div>
                  </>
                )}
                {userType === "admin" && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M3 10h5V3H3v7zm0 7h5v-5H3v5zm7 0h5v-7h-5v7zm0-17v5h5V0h-5z"
                          fill="currentColor"
                        />
                      </svg>
                      Admin Dashboard
                    </Link>
                    <div className="dropdown-divider"></div>
                  </>
                )}
                {userType === "passenger" && (
                  <>
                    <Link
                      to="/my-trips"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h8v2H4v-2z"
                          fill="currentColor"
                        />
                      </svg>
                      My Trips
                    </Link>
                    <div className="dropdown-divider"></div>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7 17H4C3 17 2 16 2 15V5C2 4 3 3 4 3H7M13 14L17 10M17 10L13 6M17 10H7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-left">
        <Link to="/" className="logo-container" aria-label="RideLink Home">
          <div className="logo-circle">
            <img src={logo} alt="RideLink Logo" />
          </div>
          <div className="logo-name">RideLink</div>
        </Link>
      </div>
      <div className="navbar-right">
        <button
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li>
            <Link to="/" onClick={handleNavLinkClick}>
              Home
            </Link>
          </li>
          <li>
            <div
              className="nav-stat"
              aria-label={`${activeBuses} buses online`}
            >
              <span className="stat-label">●</span>
              {activeBuses} Buses Online
            </div>
          </li>
          <li>
            <div
              className="nav-stat"
              aria-label={`${activeRoutes} routes available`}
            >
              <span className="stat-label">●</span>
              {activeRoutes} Routes
            </div>
          </li>
        </ul>
        {isLoggedIn ? (
          renderProfileSection()
        ) : (
          <Link to="/join" className="join-button">
            Join
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
