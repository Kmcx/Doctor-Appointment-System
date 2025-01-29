import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5002/api/doctors")
            .then(response => response.json())
            .then(async (doctorsData) => {
                if (!doctorsData.error) {
                    const doctorsWithRatings = await Promise.all(
                        doctorsData.map(async (doctor) => {
                            const res = await fetch(`http://localhost:5001/api/comments/${doctor._id}`);
                            const comments = await res.json();
                            
                            const avgRating = comments.length > 0
                                ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
                                : "N/A";
                            
                            return { ...doctor, avgRating };
                        })
                    );
                    setDoctors(doctorsWithRatings);
                }
            })
            .catch(error => console.error("Failed to fetch doctors:", error));
    }, []);

    const handleDoctorClick = (id) => {
        navigate(`/doctor/${id}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("patientId");
        localStorage.removeItem("patientEmail");
        navigate("/register");
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center">
                <h2>Doctors List</h2>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
            {doctors.length === 0 ? (
                <p>No doctors found.</p>
            ) : (
                <ul className="list-group">
                    {doctors.map((doctor) => (
                        <li 
                            key={doctor._id} 
                            className="list-group-item d-flex justify-content-between align-items-center"
                            onClick={() => handleDoctorClick(doctor._id)}
                            style={{ cursor: "pointer" }}
                        >
                            <div>
                                <h5>{doctor.name} (⭐ {doctor.avgRating})</h5>
                                <p>{doctor.specialization}</p>
                            </div>
                            <span>{doctor.address.city}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HomePage;
