
import { useNavigate } from "react-router-dom";
import "./chat.css"
import { useEffect, useRef, useState } from "react";
function Chat() {

  const [userInput, setUserInput] = useState("");
  const [messagetext, setmessagetext] = useState([{ text: "Hello How Can I Help You?" }]);
  const fovmessage = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const send = () => {
    if (userInput.trim() === "") return;
    setmessagetext((previoustext) => [
      ...previoustext,
      { sender: "user", text: userInput }
    ]);
    setTimeout(() => {
      setmessagetext((previoustext) => [
        ...previoustext,
        { sender: "Bot", text: "Hello! I'm Testing Ai" /* Link Bot Token */ }
      ]);
    }, 400);
    setUserInput("");
  };

  useEffect(() => {
    fovmessage.current?.scrollIntoView({ behaviour: "smooth" })
  }, [messagetext]);


  return (
    <>
      <div className="head">
        <div className="row">
          <h1 className="h1">MaLan-Ai</h1>
        </div>
        <div className="loginpage">
          <button className="gotologinpage" onClick={() => navigate("/")}>Login</button>
          <button className="gotosignpage" onClick={() => navigate("/signup")}>Sign Up</button>
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
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={fovmessage}></div>
          </div>
          <div className="row1">
            <h1 className="copyright">@Copyright 2025 MeLan-Ai</h1>
            <div className="input-area">
              <input
                className="input"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask Anything..."
                disabled={isLoading}
              />
              <button className="button" onClick={send} disabled={userInput.trim() === "" || isLoading}>
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
