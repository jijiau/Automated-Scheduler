import React, { useEffect } from 'react';

const OAuthCallback = () => {
  useEffect(() => {
    // Extract the hash fragment from the URL
    const hashFragment = window.location.hash.substring(1); // Get everything after #
    const params = new URLSearchParams(hashFragment);
    const accessToken = params.get('access_token'); // Extract the access_token

    if (accessToken) {
      // Send the access_token to the backend for validation
      fetch('https://api.taskly.web.id/auth/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem('token', data.token); // Save the JWT token to localStorage
            window.location.href = '/schedule'; // Redirect the user to the schedule page
          } else {
            alert('Authentication failed');
          }
        })
        .catch((error) => {
          console.error('Error during token validation:', error);
          alert('An error occurred during authentication.');
        });
    } else {
      alert('Access token not found in URL.');
    }
  }, []); // Run only once when the component is mounted

  return (
    <div>
      <p>Processing your login...</p>
    </div>
  );
};

export default OAuthCallback;
