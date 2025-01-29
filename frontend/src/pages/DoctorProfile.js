import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(5);
    const [averageRating, setAverageRating] = useState(0);
    const patientId = localStorage.getItem("patientId"); // Hasta ID'sini al
    const patientEmail = localStorage.getItem("patientEmail"); // Hasta email'ini al

    useEffect(() => {
        fetch(`http://localhost:5002/api/doctors/${id}`)
            .then(response => response.json())
            .then(data => {
                if (!data.error) setDoctor(data);
            })
            .catch(error => console.error("Failed to fetch doctor details:", error));

        fetch(`http://localhost:5001/api/comments/${id}`)
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    setComments(data);
                    if (data.length > 0) {
                        const avg = data.reduce((acc, comment) => acc + comment.rating, 0) / data.length;
                        setAverageRating(avg.toFixed(1));
                    }
                }
            })
            .catch(error => console.error("Failed to fetch comments:", error));
    }, [id]);

    const handleTimeSelect = (day, time) => {
        setSelectedTime({ day, time });
    };

    const handleAppointment = () => {
        if (!selectedTime || !patientId || !patientEmail) {
            alert("Please select an available time slot and ensure you are logged in as a patient.");
            return;
        }

        fetch("http://localhost:5002/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                doctorId: id,
                patientId,
                date: selectedTime.day,
                time: selectedTime.time,
                email: patientEmail
            })
        })
            .then(response => response.json())
            .then(data => {
                if (!data.error) alert("Appointment successfully booked!");
            })
            .catch(error => console.error("Failed to book appointment:", error));
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim() || !newRating || !patientId) {
            alert("Please enter a comment and rating.");
            return;
        }

        fetch("http://localhost:5001/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorId: id, userId: patientId, comment: newComment, rating: newRating })
        })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    setComments([...comments, { comment: newComment, rating: newRating }]);
                    setNewComment("");
                    setNewRating(5);
                    alert("Comment added successfully!");
                }
            })
            .catch(error => console.error("Failed to add comment:", error));
    };

    if (!doctor) return <p>Loading doctor details...</p>;

    const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
        <div className="container mt-5">
            <h2>{doctor.name} (⭐ {averageRating})</h2>
            <p>Specialization: {doctor.specialization}</p>
            <p>City: {doctor.address.city}</p>

            <h3>Available Time Slots</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Day</th>
                        {hours.map(hour => (
                            <th key={hour}>{hour}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map(day => (
                        <tr key={day}>
                            <td>{day}</td>
                            {hours.map(hour => (
                                <td key={hour} className="text-center">
                                    <input
                                        type="radio"
                                        name="appointment-time"
                                        disabled={!doctor.availability.some(a => a.day === day && a.slots.includes(hour))}
                                        onChange={() => handleTimeSelect(day, hour)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn btn-primary" onClick={handleAppointment} disabled={!selectedTime}>
                Make Appointment
            </button>

            <h3>Comments & Reviews</h3>
            <ul className="list-group">
                {comments.map((comment, index) => (
                    <li key={index} className="list-group-item">
                        <strong>⭐ {comment.rating}/5</strong> - {comment.comment}
                    </li>
                ))}
            </ul>

            <h4>Add a Comment</h4>
            <textarea className="form-control" value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
            <select className="form-select mt-2" value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} Stars</option>
                ))}
            </select>
            <button className="btn btn-primary mt-2" onClick={handleCommentSubmit}>Submit Review</button>
            <button className="btn btn-secondary mt-3" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
};

export default DoctorProfile;