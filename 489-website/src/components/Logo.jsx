// Logo.jsx
import React from "react";

const Logo = () => {
  return (
    <div className="logo-container">
      <img
        src="/pictures/nrdc_logo.png" // ✅ place your logo image in the public folder (e.g., public/logo.png)
        alt="App Logo"
        className="logo-image"
      />
    </div>
  );
};

export default Logo;

        