import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const socket = io();

function ChatApp() {

  const [loggedIn, setLoggedIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [currentUser, setCurrentUser] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [isDragging, setIsDragging] = useState(false);

  const resultsRef = useRef(null);

  /* =========================================================
     AUTO LOGIN
  ========================================================= */

  useEffect(() => {

    const savedUser =
      localStorage.getItem("chat_user");

    if (savedUser) {

      setCurrentUser(savedUser);

      setLoggedIn(true);

    }

  }, []);

  /* =========================================================
     RESIZE
  ========================================================= */

  useEffect(() => {

    const handleResize = () => {

      const width = window.innerWidth;

      let scale = width / 1200;

      if (scale > 1) scale = 1;
      if (scale < 0.6) scale = 0.6;

      const chat =
        document.getElementById("chat-section");

      if (chat) {

        chat.style.transform =
          `scale(${scale})`;

        chat.style.transformOrigin =
          "bottom right";

      }

    };

    window.addEventListener(
      "resize",
      handleResize
    );

    handleResize();

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );

  }, []);

  /* =========================================================
     SOCKET EVENTS
  ========================================================= */

  useEffect(() => {

    socket.on("load messages", setMessages);

    socket.on("chat message", (msg) => {

      setMessages(prev => [...prev, msg]);

    });

    socket.on("delete message", (id) => {

      setMessages(prev =>
        prev.filter(msg => msg.id !== id)
      );

    });

    return () => {

      socket.off("load messages");

      socket.off("chat message");

      socket.off("delete message");

    };

  }, []);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {

    if (resultsRef.current) {

      resultsRef.current.scrollTop =
        resultsRef.current.scrollHeight;

    }

  }, [messages]);

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async () => {

    if (!username.trim() || !password.trim()) {

      alert(
        "Συμπλήρωσε username και password"
      );

      return;
    }

    try {

      const res = await fetch("/login", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          password
        })

      });

      const data = await res.json();

      if (data.success) {

        setLoggedIn(true);

        // 🔥 display name από server
        setCurrentUser(data.displayName);

        // 🔥 save display name
        localStorage.setItem(
          "chat_user",
          data.displayName
        );

      } else {

        alert("Λάθος στοιχεία");

      }

    } catch (err) {

      console.error(err);

      alert("Server error");

    }

  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {

    localStorage.removeItem("chat_user");

    setLoggedIn(false);

    setCurrentUser("");

    setUsername("");

    setPassword("");

  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const uploadFile = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch("/upload", {

      method: "POST",

      body: formData

    });

    return await res.json();

  };

  /* =========================================================
     SEND FILE
  ========================================================= */

  const sendFile = async (file) => {

    let fileData;

    try {

      fileData = await uploadFile(file);

    } catch (err) {

      console.error(err);

      return;

    }

    socket.emit("chat message", {

      sender: currentUser,

      text: "",

      fileUrl: fileData.url,

      fileName: fileData.name,

      time: new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

      })

    });

  };

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const handlePost = () => {

    const text = message.trim();

    if (!text) return;

    socket.emit("chat message", {

      sender: currentUser,

      text,

      time: new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

      })

    });

    setMessage("");

  };

  /* =========================================================
     DRAG
  ========================================================= */

  const handleDragOver = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(true);

  };

  const handleDragLeave = () => {

    setIsDragging(false);

  };

  const handleDrop = async (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      await sendFile(file);
    }

  };

  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!loggedIn) {

    return (

      <div
        id="chat-section"
        className="login-position"
      >

        <div className="login-panel">

          {/* USERNAME */}

          <div className="login-input-wrapper">

            <div className="login-icon">
              <FaUser />
            </div>

            <input
              type="text"

              className="login-input"

              placeholder="Username"

              value={username}

              autoComplete="off"

              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="login-input-wrapper">

            <div className="login-icon">
              <FaLock />
            </div>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }

              className="login-input"

              placeholder="Password"

              value={password}

              autoComplete="off"

              onChange={(e) =>
                setPassword(e.target.value)
              }

              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  handleLogin();

                }

              }}
            />

            <div
              className="login-eye"

              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >

              {showPassword
                ? <FaEyeSlash />
                : <FaEye />
              }

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <button
            className="login-button"
            onClick={handleLogin}
          >
            LOGIN
          </button>

        </div>

      </div>
    );
  }

  /* =========================================================
     CHAT SCREEN
  ========================================================= */

  return (

    <div
      id="chat-section"

      onDragOver={handleDragOver}

      onDragLeave={handleDragLeave}

      onDrop={handleDrop}
    >

      <div className="chat-wrapper">

        {/* TOP BAR */}

        <div className="chat-top-bar">

          {/* USER */}

          <div className="chat-user-box">
            {currentUser}
          </div>

          {/* LOGOUT */}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

        {/* MESSAGE ROW */}

        <div className="message-row">

          <input
            id="text"

            type="text"

            placeholder="Message"

            value={message}

            autoComplete="off"

            onChange={(e) =>
              setMessage(e.target.value)
            }

            onKeyDown={(e) => {

              if (e.key === "Enter") {

                e.preventDefault();

                handlePost();

              }

            }}
          />

          {/* FILE */}

          <label className="file-btn">

            📎

            <input
              type="file"
              hidden

              onChange={(e) => {

                const file =
                  e.target.files[0];

                if (file) {

                  sendFile(file);

                }

              }}
            />

          </label>

          {/* SEND */}

          <button
            type="button"
            id="post"
            onClick={handlePost}
          >

            <img
              src="/pictures/sent_message_logo.png"

              draggable={false}

              alt="Send"
            />

          </button>

        </div>

        {/* RESULTS */}

        <div
          id="results"
          ref={resultsRef}
        >

          {messages.map((msg) => {

            const isMe =
              msg.sender === currentUser;

            return (

              <div
                key={msg.id}

                className={`message ${
                  isMe ? "me" : "other"
                }`}
              >

                <div className="name">
                  {msg.sender}
                </div>

                <div className="bubble">

                  {msg.text && (
                    <div>{msg.text}</div>
                  )}

                  {msg.fileUrl && (

                    <div className="file">

                      {msg.fileUrl.match(
                        /\.(jpg|jpeg|png|gif)$/i
                      ) ? (

                        <img
                          src={msg.fileUrl}
                          alt="uploaded"
                        />

                      ) : (

                        <a
                          href={msg.fileUrl}

                          target="_blank"

                          rel="noreferrer"
                        >
                          📎 {msg.fileName}
                        </a>

                      )}

                    </div>

                  )}

                </div>

                <div className="time">
                  {msg.time}
                </div>

              </div>

            );

          })}

          {isDragging && (

            <div className="drag-overlay">
              Drop file here 📎
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default ChatApp;