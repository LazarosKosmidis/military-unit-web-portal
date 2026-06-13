import React, { useState, useRef, useEffect } from 'react';
import { FaFileAlt, FaPhone } from 'react-icons/fa';
import myIcon from "/pictures/outlook_logo.png"; // ✅ your image file

// ✅ Small PNG icons for the FaFileAlt dropdown
import fileIcon from "/pictures/files_icon.png";
import publicIcon from "/pictures/public_icon.jpg";
import libraryIcon from "/pictures/library_icon.png";
import multimediaIcon from "/pictures/multimedia_icon.png";

function Navbar() {
  const [tooltip, setTooltip] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isFileClosing, setIsFileClosing] = useState(false);
  const hideTimer = useRef(null);
  const fileHideTimer = useRef(null);
  const dropdownRef = useRef(null);
  const fileDropdownRef = useRef(null);

  

  // ✅ Continuous scaling based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let scale = width / 1200;
      if (width < 1800) scale = width / 1400;
      if (scale < 0.6) scale = 0.6;
      if (scale > 1) scale = 1;

      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.style.position = 'fixed';
        navbar.style.transform = `translateX(-50%) scale(${scale})`;
        navbar.style.transformOrigin = 'top center';
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // === Dropdown 1 (Διαβιβάσεις) ===
  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    setIsClosing(false);
    setShowDropdown(true);
  };
  const handleMouseLeave = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setShowDropdown(false);
        setIsClosing(false);
      }, 300);
    }, 400);
  };

  // === Dropdown 2 (FaFileAlt) ===
  const handleFileEnter = () => {
    clearTimeout(fileHideTimer.current);
    setIsFileClosing(false);
    setShowFileDropdown(true);
  };
  const handleFileLeave = () => {
    clearTimeout(fileHideTimer.current);
    fileHideTimer.current = setTimeout(() => {
      setIsFileClosing(true);
      setTimeout(() => {
        setShowFileDropdown(false);
        setIsFileClosing(false);
      }, 400);
    }, 500);
  };

  // ✅ Adjust dropdown position dynamically
  useEffect(() => {
    const adjustDropdownPosition = (ref, visible) => {
      if (visible && ref.current) {
        const el = ref.current;
        const rect = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.top;
        const spaceAbove = rect.top;

        if (spaceBelow < rect.height && spaceAbove > spaceBelow) {
          el.style.top = 'auto';
          el.style.bottom = '100%';
          el.style.marginTop = '0';
          el.style.marginBottom = '8px';
        } else {
          el.style.top = '100%';
          el.style.bottom = 'auto';
          el.style.marginTop = '8px';
          el.style.marginBottom = '0';
        }

        el.style.maxHeight = `${Math.min(window.innerHeight * 0.6, 1000)}px`;
        el.style.overflowY = 'auto';
      }
    };

    adjustDropdownPosition(dropdownRef, showDropdown);
    adjustDropdownPosition(fileDropdownRef, showFileDropdown);
  }, [showDropdown, showFileDropdown]);

  // ✅ URLs for Διαβιβάσεις dropdown
  const Portal1Links = [
    { label: "ΠΥΡΣΕΙΑ", url: "http://gssexchn1.army.hndgs.mil/pyrseia/pyrseia_login.php" },
    { label: "ΣΗΔΑΕΔ", url: "https://gss.shdaed.mil/login" },
    { label: "ΑΠΑΛΛΑΓΕΣ", url: "http://webserver1/apalages/index.php?logout=1" },
    { label: "ΖΕΥΞΕΙΣ", url: "https://193.9.100.54/login/?next=/" },
    { label: "ΣΕΖΜ ΕΡΜΗΣ", url: "http://193.9.100.50/g/g/" },
    { label: "ΔΙΑΒΑΘΜΙΣΜΕΝΟ ΔΙΚΤΥΟ", url: "http://192.9.30.15:1555/g5d7750cb/document/_/!index.html?REFRESH=30+Seconds" },
  
  ];
  const Portal2Links = [
    { label: "ΓΕΣ Portal", url: "https://portal.army.gr.mil/portal/index" },
    { label: "ΕΑΣΔΜ", url: "https://easdm.army.gr.mil/EASDM/" },
    { label: "ΔΙΑΧΕΙΡΗΣΗ HARP", url: "https://193.9.100.51/directory/" },
    { label: "HERMIONE", url: "http://193.9.100.150/hermione/auth.php" },
    { label: "ΣΠΕΥΣ", url: "http://192.9.200.214:8080/speys/" },
    { label: "ΠΡΟΔΙΑΓΡΑΦΕΣ", url: "https://prodiagrafes.army.gr.mil/index.xhtml" },
    { label: "e-BIMAY", url: "http://100.250.0.191:8080/ords/bimay/r/bimay/login?session=17527960442918" },
    { label: "KEY PORTAL", url: "http://100.250.0.199:8080/ords/oseys/r/keyportal/login_desktop?session=13149798422454" },
    { label: "ΣΣΟ", url: "https://sso.army.gr.mil/cas/login?service=https%3A%2F%2Fesep.army.gr.mil%2Fesep" },
    { label: "ΕΦΕΡΔΟΣ", url: "https://efedros.army.gr.mil/" },
    { label: "ΕΑΣΠ", url: "http://192.9.200.213:7001/Easp_V3/login.jsf" },
  
    
  ];

  // ✅ Open link helper
  const openLink = (url) => {
    window.open(url, "_blank"); // open in new tab
  };

  return (
    <nav className="navbar">
      {/* === Dropdown 1: Διαβιβάσεις === */}
      <div
        className="dropdown"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button>Portal 1</button>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className={`dropdown-menu ${isClosing ? 'fade-out' : 'fade-in'}`}
          >
            {Portal1Links.map((item) => (
              <button key={item.label} onClick={() => openLink(item.url)}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* === Dropdown 2: Portal 2 === */}
      <div
        className="dropdown"
        onMouseEnter={handleFileEnter}
        onMouseLeave={handleFileLeave}
      >
        <button>Portal 2</button>

        {showFileDropdown && (
          <div
            ref={fileDropdownRef}
            className={`dropdown-menu ${isFileClosing ? 'fade-out' : 'fade-in'}`}
          >
            {Portal2Links.map((item) => (
              <button
                key={`portal2-${item.label}`}
                onClick={() => openLink(item.url)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      

      {/* === Other Buttons === */}
      <button onClick={() => window.open("http://193.9.100.66", "_blank")}>
        <FaPhone size={18} />
      </button>


      {/* <button onClick={() => window.location.href = "mailto:"}>
        <img
          src={myIcon}
          alt="Outlook Icon"
          style={{ width: 24, height: 24, objectFit: 'contain' }}
        />
      </button> */}
      <button
        onClick={() => {
          window.open("https://exchange2/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fexchange2%2fowa%2f", "_blank");
        }}
      >
        {/* <img
          src={myIcon}
          alt="Email Icon"
          style={{ width: 24, height: 24, objectFit: 'contain' }}
        /> */}
        Outlook
      </button>
    </nav>
  );
}

export default Navbar;
