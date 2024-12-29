import React, { useState } from 'react';

const Login = () => {
    const [apiKey, setApiKey] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/protected/resource', {
                method: 'GET',
                headers: { 'x-api-key': apiKey },
            });
            const data = await response.json();
            setMessage(response.ok ? `Login Successful! Message: ${data.message}` : data.error);
        } catch (error) {
            setMessage('Login Failed!');
        }
    };

    return (
        <div className="container">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Enter API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default Login;
