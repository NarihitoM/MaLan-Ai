import { useNavigate } from "react-router-dom";
import "./chat.css";
import { useEffect, useRef, useState } from "react";

function Chat() {
  const [userInput, setUserInput] = useState("");
  const [file, setFile] = useState([]);
  const [includeServerFile, setIncludeServerFile] = useState(false);
  const fileInputRef = useRef(null)
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
  const [createfile, setcreatefile] = useState(false);
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
    if (userInput.trim() === "" && file.length === 0) return;
    stopTypingRef.current = false;

    const messageFiles = file.map(f => ({ name: f.name }));
    setmessagetext((prev) => [...prev, {
      sender: "user",
      text: userInput,
      files: messageFiles
    }]);

    setIsLoading(true);
    const controller = new AbortController();
    cancelRequestRef.current = controller;
    const signal = controller.signal;
    const payload = { message: userInput };
    let fetchOptions = {
      method: "POST",
      signal,
    };
    if (file.length > 0) {
      const form = new FormData();
      form.append("message", userInput);

      file.forEach((f) => form.append("file", f));
      if (includeServerFile) form.append("includeServerFile", "true");
      if (createfile) form.append("createfile", "true");

      fetchOptions.body = form;
    } else {
      fetchOptions.headers = { "Content-Type": "application/json" };
      fetchOptions.body = JSON.stringify({
        message: userInput,
        includeServerFile: includeServerFile ? "true" : "false",
        createfile: createfile ? "true" : "false",
      });
    }
    //Ai Response Industry//
    try {
      const resp = await fetch("http://localhost:4200/api/chat", fetchOptions);

      if (resp.ok) setFile([]);

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${resp.status}`);
      }

      const data = await resp.json();
      const botReply = data.reply || "No response from server";

      if (stopTypingRef.current) return;

      if (data.file?.url) {
        setmessagetext((prev) => [
          ...prev,
          {
            sender: "Bot",
            text: "Here is the file created",
            fileDownload: {
              name: data.file.name,
              url: data.file.url
            }
          },
        ]);
        return;
      }
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

  const deletefile = (index) => {
    setFile(prev => prev.filter((_, i) => i !== index));
  }
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
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {msg.text}
                  {msg.files && msg.files.map((file, index) => (
                    <span key={index} className="filename">
                      📎 {file.name}
                    </span>
                  ))}
                  {msg.fileDownload && (
                    <div className="download-link">
                      📁 <a href={msg.fileDownload.url} download={msg.fileDownload.name} target="_blank" rel="noopener noreferrer">
                        Download {msg.fileDownload.name}
                      </a>
                    </div>
                  )}
                </p>
              </div>
            ))}
            <div ref={fovmessage}></div>
          </div>
          <div className="row1">
            <h1 className="copyright">@Copyright 2025 MaLan-AI</h1>
            <div className="input-area">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={createfile}
                  onChange={(e) => setcreatefile(e.target.checked)}
                />
                Create file
              </label>
              <div className="input-row">
                <input
                  className="input1"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userInput.trim() !== "" && !isLoading) {
                      if (istyping) stopgenerate();
                      else send();
                    }
                  }}
                  placeholder="Ask Anything..."
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setFile((prev) => [...prev, ...Array.from(e.target.files)]);
                    }
                  }}
                  multiple
                  style={{ display: "none" }}
                />
                <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                  📎
                </button>
                <button
                  className="button"
                  onClick={() => {
                    if (istyping) stopgenerate();
                    else send();
                  }}
                  disabled={(userInput.trim() === "" && file.length === 0) || isLoading}
                >
                  {istyping ? (
                    <div className="circle"></div>
                  ) : isLoading ? (
                    "Send"
                  ) : (
                    "Send"
                  )}
                </button>

              </div>

              {file.length > 0 && (
                <div className="files-container">
                  {file.map((file, index) => (
                    <>
                      <p key={index} className="filename">
                        <i class="fa-solid fa-file"></i> {file.name}
                      </p>
                      <button className="deletebutton" onClick={() => deletefile(index)}>x</button>
                    </>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
