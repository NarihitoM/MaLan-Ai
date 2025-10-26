
import { useNavigate } from "react-router-dom";
import "./chat.css"
import { useEffect, useRef, useState } from "react";


function Chat() {
  const [userInput, setUserInput] = useState("");
  const [messagetext, setmessagetext] = useState([{ text: "Hello This Is Our Chatbot Program MaLan-AI. Feel Free To Ask Anything." }]);
  const fovmessage = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedin, setloggedin] = useState(false);
  const [istyping, setistyping] = useState(false);
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const isuserinthesystem = localStorage.getItem("keepLoggedIn");
    if (isuserinthesystem) {
      setloggedin(true);
      setPhoto(localStorage.getItem("googlepicture") || "");
      setName(localStorage.getItem("googlename") || "");
    }
    else {
      setloggedin(false);
    }
  }, [isLoggedin, name, photo]);

  useEffect(() => {
    setPhoto(localStorage.getItem("googlepicture"))
  }, [photo]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  }
  const send = async () => {
    if (userInput.trim() === "") return;
    setmessagetext((previoustext) => [
      ...previoustext,
      { sender: "user", text: userInput }
    ]);
    setIsLoading(true);
    const payload = { message: userInput };
    try {
      const resp = await fetch("http://localhost:4200/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${resp.status}`);
      }
      const data = await resp.json();
      const botReply = data.reply || "No response from server";
      setistyping(true);
      let index = 0;
      const typingspeed = 30;
      setmessagetext((previoustext) => [
        ...previoustext,
        { sender: "Bot", text: "" }
      ]);

      const typewriting = setInterval(() => {
        index++;
        setmessagetext((previoustext) => {
          const newMessages = [...previoustext];
          const botMessage = newMessages[newMessages.length - 1];
          botMessage.text = botReply.slice(0, index);
          return newMessages;
        });

        if (index >= botReply.length) {
          clearInterval(typewriting);
          setistyping(false);
        }
      }, typingspeed);
    }
    catch (err) {
      console.error("chat error", err);
      setmessagetext((previoustext) => [
        ...previoustext,
        { sender: "Bot", text: "Error could not reach chat server." }
      ]);
      setistyping(false);
    }
    finally {
      setIsLoading(false);
      setUserInput("");
    }
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
          <div className="row">
            {isLoggedin ?
              (<>
                <h1 className="h1pf2">{localStorage.getItem("email")}</h1>
                <h1 className="h1pf">{localStorage.getItem("googlename")}</h1>
                <img
                  src={photo}
                  alt="Profile"
                  className="profile-pic"
                />
                <button className="gotologinpage" onClick={logout}>Logout</button>
              </>)
              :
              (<>
                <button className="gotologinpage" onClick={() => navigate("/")}>Login</button>
                <button className="gotosignpage" onClick={() => navigate("/signup")}>Sign Up</button>
              </>)
            }
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
                <p> {msg.text.split(/([.*])/).map((part, index) => {
                  if (part === "." || part === "*") {
                    return <span key={index}>{part}<br /></span>; 
                  }
                  return <span key={index}>{part}</span>;
                })}</p>
              </div>
            ))}
            <div ref={fovmessage}></div>
          </div>
          <div className="row1">
            <h1 className="copyright">@Copyright 2025 MaLan-Ai</h1>
            {isLoggedin ?
              (<>
                <div className="input-area">
                  <input
                    className="input"
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !istyping) send(); }}
                    placeholder="Ask Anything..."
                    disabled={isLoading && istyping}
                  />
                  <button className="button" onClick={() => { if (!istyping) send(); }} disabled={userInput.trim() === "" || isLoading}>
                    {istyping ? <div className="circle"></div> : isLoading ? "Sending..." : "Send"}
                  </button>
                </div> :
              </>) :
              (<>
                <div className="input-area">
                  <h1 className="warning">Please Log In or SignUp to continue</h1>
                </div>
              </>)
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
