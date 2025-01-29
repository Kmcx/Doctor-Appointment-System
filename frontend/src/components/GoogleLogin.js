import React, { useEffect, useState } from "react";

const GoogleLogin = ({ setUser }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (window.location.search.includes("token=")) {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get("token");

            if (tokenFromUrl) {
                localStorage.setItem("token", tokenFromUrl);
                setToken(tokenFromUrl);
                window.history.pushState({}, "", "/");
            }
        }
    }, []);

    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google"; // Backend OAuth URL
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <div>
            {token ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <button onClick={handleLogin}>Authenticate with Google</button>
            )}
        </div>
    );
};

export default GoogleLogin;
