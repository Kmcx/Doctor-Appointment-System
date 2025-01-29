import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DoctorRegister() {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("doctor");
    const [user, setUser] = useState({
        name: "",
        email: "",
        specialization: "",
        availability: [
            { day: "Monday", slots: [] },
            { day: "Tuesday", slots: [] },
            { day: "Wednesday", slots: [] },
            { day: "Thursday", slots: [] },
            { day: "Friday", slots: [] }
        ],
        address: {
            line1: "",
            city: "",
            postalCode: "",
            geoLocation: { lat: 0, lng: 0 },
        },
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("name") && params.has("email")) {
            setUser((prevUser) => ({
                ...prevUser,
                name: params.get("name"),
                email: params.get("email"),
            }));
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);

    const handleGoogleLogin = () => {
        const authWindow = window.open(
            "http://localhost:5000/auth/google?userType=doctor",
            "_blank",
            "width=500,height=600"
        );
        
        const checkPopup = setInterval(() => {
            if (!authWindow || authWindow.closed) {
                clearInterval(checkPopup);
                window.location.reload();
            }
        }, 1000);
    };

    const handleAvailabilityChange = (day, slot) => {
        setUser((prevState) => {
            const updatedAvailability = prevState.availability.map((entry) =>
                entry.day === day
                    ? {
                        ...entry,
                        slots: entry.slots.includes(slot)
                            ? entry.slots.filter((s) => s !== slot)
                            : [...entry.slots, slot],
                    }
                    : entry
            );
            return { ...prevState, availability: updatedAvailability };
        });
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        if (["line1", "city", "postalCode"].includes(name)) {
            setUser((prevState) => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [name]: value,
                },
            }));
        } else {
            setUser({ ...user, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5002/api/${userType}s/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || `${userType} registration failed!`);
            }
    
            alert(`${userType} registered successfully!`);
    
            if (userType === "patient") {
                localStorage.setItem("patientId", data.patient._id);
                localStorage.setItem("patientEmail", data.patient.email);
            } else {
                localStorage.setItem("doctorId", data.doctor._id);
                localStorage.setItem("doctorEmail", data.doctor.email);
            }
    
            navigate("/");
        } catch (error) {
            console.error("Error:", error.message);
            alert(`Failed to register ${userType}. Please try again.`);
        }
    };
    

    return (
        <div className="container mt-5">
            <h2>Register as a {userType === "doctor" ? "Doctor" : "Patient"}</h2>

            <div className="mb-3">
                <label>User Type</label>
                <select className="form-select" value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                </select>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Full Name</label>
                    <input type="text" name="name" className="form-control" onChange={handleUserChange} required />
                </div>
                
                <div className="mb-3">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" onChange={handleUserChange} required />
                </div>
                
                {userType === "doctor" && (
                    <>
                        <div className="mb-3">
                            <label>Specialization</label>
                            <input type="text" name="specialization" className="form-control" onChange={handleUserChange} required />
                        </div>
                        <div className="mb-3">
                            <label>Address</label>
                            <input type="text" name="line1" className="form-control" onChange={handleUserChange} required />
                            <select name="city" className="form-select mt-2" onChange={handleUserChange} required>
                                <option value="">Select City</option>
                                <option value="Istanbul">Istanbul</option>
                                <option value="Ankara">Ankara</option>
                                <option value="Izmir">Izmir</option>
                            </select>
                            <input type="text" name="postalCode" className="form-control mt-2" onChange={handleUserChange} required />
                        </div>
                        <h4>Availability</h4>
                        {user.availability.map(({ day, slots }) => (
                            <div key={day}>
                                <strong>{day}</strong>
                                {["08:00", "10:00", "12:00", "14:00", "16:00"].map((slot) => (
                                    <label key={slot} className="ms-2">
                                        <input
                                            type="checkbox"
                                            checked={slots.includes(slot)}
                                            onChange={() => handleAvailabilityChange(day, slot)}
                                        />
                                        {slot}
                                    </label>
                                ))}
                            </div>
                        ))}
                    </>
                )}
                
                <button type="submit" className="btn btn-primary">Register</button>
            </form>

            {userType === "doctor" && (
                <div className="mt-3">
                    <h4>Or Register/Login with Google</h4>
                    <button className="btn btn-outline-primary" onClick={handleGoogleLogin}>Login with Google</button>
                </div>
            )}

            <button className="btn btn-secondary mt-3" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
}

export default DoctorRegister;