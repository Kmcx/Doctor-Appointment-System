import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLogin from "../components/GoogleLogin";

function DoctorRegister() {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("doctor");
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState({
        name: "",
        email: "",
    });

    const [doctor, setDoctor] = useState({
        specialization: "",
        address: {
            line1: "",
            city: "",
            postalCode: "",
        },
        availability: [],
    });

    const handleUserChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleDoctorChange = (e) => {
        if (["line1", "city", "postalCode"].includes(e.target.name)) {
            setDoctor((prevState) => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [e.target.name]: e.target.value,
                },
            }));
        } else {
            setDoctor({ ...doctor, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = userType === "doctor" ? { ...user, ...doctor } : user;

        try {
            const response = await fetch(`http://localhost:5002/api/${userType}s/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Registration failed!");
            }

            const data = await response.json();
            alert(`${userType} registered successfully!`);
            
            if (userType === "patient") {
                localStorage.setItem("patientId", data.patient._id); // Hasta ID'sini kaydet
                localStorage.setItem("patientEmail", data.patient.email);
            }
            
            navigate("/"); // Kayıt sonrası anasayfaya yönlendir
        } catch (error) {
            console.error("Error:", error.message);
            alert("Failed to register. Please try again.");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:5002/api/${userType}s/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: user.email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed!");
            }

            alert(`${userType} logged in successfully!`);
            
            if (userType === "patient") {
                localStorage.setItem("patientId", data.patient._id); // Hasta ID'sini kaydet
                localStorage.setItem("patientEmail", data.patient.email);
            }
            
            navigate("/"); // Giriş sonrası anasayfaya yönlendir
        } catch (error) {
            console.error("Error:", error.message);
            alert("Login failed. Please check your email and try again.");
        }
    };

    return (
        <div className="container mt-5">
            <h2>{isLogin ? "Login" : `Register as a ${userType === "doctor" ? "Doctor" : "Patient"}`}</h2>

            <div className="mb-3">
                <label>User Type</label>
                <select className="form-select" value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                </select>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSubmit}>
                {!isLogin && (
                    <div className="mb-3">
                        <label>Full Name</label>
                        <input type="text" name="name" className="form-control" onChange={handleUserChange} required />
                    </div>
                )}

                <div className="mb-3">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" onChange={handleUserChange} required />
                </div>

                {!isLogin && userType === "doctor" && (
                    <>
                        <div className="mb-3">
                            <label>Specialization</label>
                            <input type="text" name="specialization" className="form-control" onChange={handleDoctorChange} required />
                        </div>

                        <div className="mb-3">
                            <label>Address Line 1</label>
                            <input type="text" name="line1" className="form-control" onChange={handleDoctorChange} required />
                        </div>

                        <div className="mb-3">
                            <label>City</label>
                            <select name="city" className="form-select" onChange={handleDoctorChange} required>
                                <option value="">Select City</option>
                                <option value="Istanbul">Istanbul</option>
                                <option value="Ankara">Ankara</option>
                                <option value="Izmir">Izmir</option>
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary">
                    {isLogin ? "Login" : "Register"}
                </button>
            </form>

            <button className="btn btn-secondary mt-3" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Go to Register" : "Go to Login"}
            </button>

            <button className="btn btn-secondary mt-3" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
}

export default DoctorRegister;
