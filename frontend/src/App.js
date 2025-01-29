import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorProfile from "./pages/DoctorProfile";

function App() {
    return (
        <Router>
            <div className="container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<DoctorRegister />} />
                    <Route path="/doctor/:id" element={<DoctorProfile />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;