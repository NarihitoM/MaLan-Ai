import { useNavigate } from "react-router-dom";
import "./chat.css";
import { useEffect, useRef, useState } from "react";

function Chat() {
  const [userInput, setUserInput] = useState("");
  const [messagetext, setmessagetext] = useState([
    { text: "Start Chatting MaLan-Ai" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedin, setloggedin] = useState(false);
  const [istyping, setistyping] = useState(false);
  const [name, setName] = useState("");
  const fovmessage = useRef(null);
  const navigate = useNavigate();


  const cancelRequestRef = useRef(null);
  const typewritingRef = useRef(null);
  const stopTypingRef = useRef(false);

  useEffect(() => {
    const isuserinthesystem = localStorage.getItem("keepLoggedIn");
    if (isuserinthesystem) {
      setloggedin(true);
      setName(localStorage.getItem("googlename") || "");
    } else {
      setloggedin(false);
    }
  }, [isLoggedin, name]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const send = async () => {
    if (userInput.trim() === "") return;

    stopTypingRef.current = false;

    setmessagetext((prev) => [...prev, { sender: "user", text: userInput }]);
    setIsLoading(true);

    const controller = new AbortController();
    cancelRequestRef.current = controller;
    const signal = controller.signal;

    const payload = { message: userInput };

    try {
      const resp = await fetch("http://localhost:4200/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${resp.status}`);
      }

      const data = await resp.json();
      const botReply = data.reply || "No response from server";

      if (stopTypingRef.current) return;

      setistyping(true);
      let index = 0;
      const typingspeed = 30;

      setmessagetext((prev) => [...prev, { sender: "Bot", text: "" }]);

      typewritingRef.current = setInterval(() => {
        if (stopTypingRef.current) {
          clearInterval(typewritingRef.current);
          typewritingRef.current = null;
          setistyping(false);
          return;
        }

        index++;
        setmessagetext((prev) => {
          const newMessages = [...prev];
          const botMessage = newMessages[newMessages.length - 1];
          if (!botMessage || botMessage.sender !== "Bot") return newMessages;
          botMessage.text = botReply.slice(0, index);
          return newMessages;
        });

        if (index >= botReply.length) {
          clearInterval(typewritingRef.current);
          typewritingRef.current = null;
          setistyping(false);
        }
      }, typingspeed);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Aborted by user");
        return;
      }
      console.error("chat error", err);
      setmessagetext((prev) => [
        ...prev,
        { sender: "Bot", text: "Error: could not reach chat server." },
      ]);
      setistyping(false);
    } finally {
      setIsLoading(false);
      if (!stopTypingRef.current) {
        setUserInput("");
      }
    }
  };

  const stopgenerate = () => {
    stopTypingRef.current = true;

    if (cancelRequestRef.current) {
      cancelRequestRef.current.abort();
      cancelRequestRef.current = null;
    }

    if (typewritingRef.current) {
      clearInterval(typewritingRef.current);
      typewritingRef.current = null;
    }
    setmessagetext((prev) => {
      const newMessages = [...prev];
      const last = newMessages[newMessages.length - 1];

      if (last?.sender === "Bot" && last.text.length > 0 && !last.text.endsWith("...")) {
        last.text = last.text.trimEnd() + "...";
      }
      return newMessages;
    });

    setistyping(false);
    setIsLoading(false);
  };


  useEffect(() => {
    fovmessage.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagetext]);

  return (
    <>
      <div className="head">
        <div className="row">
          <h1 className="h1">MaLan-AI</h1>
        </div>
        <div className="loginpage">
          <div className="row">
            {isLoggedin ? (
              <>
                <h1 className="h1pf1">{localStorage.getItem("email")}</h1>
                <h1 className="h1pf">{localStorage.getItem("googlename")}</h1>
                <button className="gotologinpage" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="gotologinpage" onClick={() => navigate("/")}>
                  Login
                </button>
                <button
                  className="gotosignpage"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="chat-window">
          <div className="messages">
            {messagetext.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? "usermessage" : "chatmessage"}
              >
                <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
              </div>
            ))}
            <div ref={fovmessage}></div>
          </div>

          <div className="row1">
            <h1 className="copyright">@Copyright 2025 MaLan-AI</h1>
            {isLoggedin ? (
              <div className="input-area">
                <input
                  className="input"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userInput.trim() !== "" && !isLoading) {
                      if (istyping) stopgenerate();
                      else
                      send();
                    }
                  }}
                  placeholder="Ask Anything..."
                />
                <button
                  className="button"
                  onClick={() => {
                    if (istyping) stopgenerate();
                    else send();
                  }}
                  disabled={userInput.trim() === "" || isLoading}
                >
                  {istyping ? (
                    <div className="circle"></div>
                  ) : isLoading ? (
                    "Sending..."
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            ) : (
              <div className="input-area">
                <h1 className="warning">
                  Please Log In or Sign Up to continue
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
