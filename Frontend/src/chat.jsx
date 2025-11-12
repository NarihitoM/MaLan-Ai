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
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
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
      const resp = await fetch("https://malan-ai-server.vercel.app/api/chat", fetchOptions);

      if (resp.ok) setFile([]);

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${resp.status}`);
      }
      const contentType = resp.headers.get("Content-Type");

      if (contentType && contentType.includes("text/plain")) {
     
        const blob = await resp.blob();
        const fileName =
          resp.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ||
          "Malan-Ai.txt";
        const fileURL = window.URL.createObjectURL(blob);

        setmessagetext((prev) => [
          ...prev,
          {
            sender: "Bot",
            text: "Your File is here",
            fileDownload: {
              name: fileName,
              url: fileURL,
            },
          },
        ]);
        setistyping(false);
        setIsLoading(false);
        return;
      }
 
      const data = await resp.json();
      const botReply = data.reply || "No response from server";

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
    const container = fovmessage.current?.parentElement;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 40;

    if (isNearBottom) {
      fovmessage.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagetext, istyping]);
  const deletefile = (index) => {
    setFile(prev => prev.filter((_, i) => i !== index));
  }
  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFile((prev) => [...prev, ...droppedFiles]);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", (e) => e.preventDefault());
      window.removeEventListener("drop", handleDrop);
    };
  }, []);
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
                <h1 className="h1pf">{localStorage.getItem("googleusername")}</h1>
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
            {isLoading && !istyping && (
              <div className="chatmessage bot-typing">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={fovmessage}></div>
          </div>
          <div className="row1">
            <h1 className="copyright">@Copyright 2025 MaLan-AI</h1>

            <div className="input-area">
              {isLoggedin ?
                (<>
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
                          setTimeout(() => {
                            fovmessage.current?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
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
                        setTimeout(() => {
                          fovmessage.current?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
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
                        setTimeout(() => {
                          fovmessage.current?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
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
                  {isDragging && (
                    <div className="drag-overlay">
                      <div className="drop-zone">
                        <p>📎Drop files here to upload...</p>
                      </div>
                    </div>
                  )}
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
                </>) :
                (<>
                  <h1 className="warning">Please Log In or SignUp to continue</h1>
                </>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
