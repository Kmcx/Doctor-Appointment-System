import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Appointment() {
    const { id } = useParams(); 
    const [doctor, setDoctor] = useState(null);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id || id === "undefined") {
            console.error("Doctor ID is missing!");
            setLoading(false);
            return;
        }

       
        fetch(`http://localhost:5002/api/doctors/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Doctor API returned ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Doctor Data:", data);
                setDoctor(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching doctor details:", error);
                setLoading(false);
            });
    }, [id]);

    
    const handleDayChange = (day) => {
        setSelectedDay(day);
        const dayAvailability = doctor?.availability?.find((item) => item.day === day);
        setAvailableTimes(dayAvailability ? dayAvailability.slots : []);
        setSelectedTime(""); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const patientId = localStorage.getItem("userId"); 

        try {
            const response = await fetch("http://localhost:5002/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    doctorId: id,
                    patientId,
                    date: selectedDay,
                    time: selectedTime,
                    email: localStorage.getItem("userEmail"),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to book appointment.");
            }

            alert("Appointment successfully booked!");
            navigate(`/doctor/${id}`); 
        } catch (error) {
            console.error("Error booking appointment:", error);
            alert("Failed to book appointment. Please try again.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!doctor) return <p>Doctor not found.</p>;

    return (
        <div className="container mt-5">
            <h2>Book an Appointment with {doctor.name}</h2>
            <p><strong>Specialization:</strong> {doctor.specialization}</p>

            <div className="mb-3">
                <h3>Available Days</h3>
                {doctor.availability && doctor.availability.length > 0 ? (
                    <div className="d-flex flex-wrap">
                        {doctor.availability.map((item, index) => (
                            <button
                                key={index}
                                className={`btn me-2 ${selectedDay === item.day ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => handleDayChange(item.day)}
                            >
                                {item.day}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p>No available days.</p>
                )}
            </div>

            {selectedDay && (
                <div className="mb-3">
                    <h3>Available Times for {selectedDay}</h3>
                    {availableTimes.length > 0 ? (
                        <div className="d-flex flex-wrap">
                            {availableTimes.map((slot, index) => (
                                <button
                                    key={index}
                                    className={`btn me-2 ${selectedTime === slot ? "btn-success" : "btn-outline-success"}`}
                                    onClick={() => setSelectedTime(slot)}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p>No available times for this day.</p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <button type="submit" className="btn btn-primary" disabled={!selectedDay || !selectedTime}>
                    Confirm Appointment
                </button>
            </form>
        </div>
    );
}

export default Appointment;
