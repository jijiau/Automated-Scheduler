import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container">
            <h1>Welcome to Service Authentication</h1>
            <Link to="/signup" className="button">Sign Up</Link>
            <Link to="/login" className="button">Login</Link> {/* Tambahkan tombol login */}
        </div>
    );
};

export default Home;
