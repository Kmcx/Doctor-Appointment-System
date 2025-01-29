import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "../index.css"; 
//import "../styles/HomePage.css";

const HomePage = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const mapCenter = { lat: 38.4192, lng: 27.1287 }; // Default center (izmir, Turkey)

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
                    setFilteredDoctors(doctorsWithRatings);
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

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.length > 0) {
            const matchedSuggestions = doctors.filter((doctor) =>
                doctor.name.toLowerCase().includes(query) ||
                doctor.specialization.toLowerCase().includes(query) ||
                doctor.address.city.toLowerCase().includes(query)
            );
            setSuggestions(matchedSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearchSelect = (selectedDoctor) => {
        setSearchQuery(selectedDoctor.name);
        setFilteredDoctors([selectedDoctor]);
        setSuggestions([]);
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center">
                <h2>Doctors List</h2>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>

            <div className="mb-3">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name, specialization, or city..." 
                    value={searchQuery} 
                    onChange={handleSearchChange}
                />
                {suggestions.length > 0 && (
                    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                        {suggestions.map((doctor) => (
                            <li 
                                key={doctor._id} 
                                className="list-group-item list-group-item-action"
                                onClick={() => handleSearchSelect(doctor)}
                                style={{ cursor: "pointer" }}
                            >
                                {doctor.name} - {doctor.specialization} ({doctor.address.city})
                            </li>
                        ))}
                    </ul>
                )}
                <button className="btn btn-primary mt-2" onClick={() => setFilteredDoctors(suggestions)}>Search</button>
            </div>

            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "300px" }}
                    center={mapCenter}
                    zoom={6}
                >
                    {filteredDoctors.map((doctor) => (
                        doctor.address.geoLocation && (
                            <Marker 
                                key={doctor._id} 
                                position={{ 
                                    lat: doctor.address.geoLocation.lat, 
                                    lng: doctor.address.geoLocation.lng 
                                }}
                                title={doctor.name}
                            />
                        )
                    ))}
                </GoogleMap>
            </LoadScript>

            {filteredDoctors.length === 0 ? (
                <p>No doctors found.</p>
            ) : (
                <ul className="list-group">
                    {filteredDoctors.map((doctor) => (
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
