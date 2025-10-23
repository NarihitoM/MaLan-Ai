import { useEffect, useState } from "react";
import "./index.css"
import { useNavigate } from "react-router-dom";

function Header() {
  const [user, setuser] = useState("");
  const [password, setpassword] = useState("");
  const [text, settext] = useState("");
  const [bool, setbool] = useState(false);
  const [showterms, setshowterms] = useState(false);
  const [context, setcontext] = useState(false);
  const navigate = useNavigate();
  const Handlevalidation = (e) => {
    e.preventDefault();
    if (user === "" && password === "") {
      settext("Please fill in all the fields");
    } else if (user.length < 3) {
      settext("Username must be at least 3 characters");
    } else if (password.length < 6) {
      settext("Password must be at least 6 characters");
    }
    else if (!context) {
      settext("Please check terms and conditions");
    }
    else {
      settext("Login Successful");
      setbool(true);
      setTimeout(() => navigate("/chat"), 3000);
    }

  };
  useEffect(() => {
    if (user === "" && password === "") {
      setbool(true);
      settext("");
      return;
    }
    if (user.length < 3) {
      settext("Username must be greater than 3 characters");
    }
    else if (password.length < 6) {
      settext("Password must be greater than 6 characters");
    }
    else {
      settext("");
    }
  }, [user, password])

  return (
    <>
      <div className="Body">
        <form onSubmit={Handlevalidation} className="Form">
          <h1 className="h1">MaLan-Ai</h1>
          <label className="label">Enter Username</label>
          <input className="input" type="text" style={{ border: user === "" ? "2px solid gray" : user.length >= 3 ? "2px solid green" : "2px solid red" }} value={user} placeholder="Enter username" onChange={(e) => setuser(e.target.value)} />
          <label className="label">Enter Password</label>
          <input className="input" type="password" style={{ border: password === "" ? "2px solid gray" : password.length >= 6 ? "2px solid green" : "2px solid red" }} value={password} placeholder="Enter password" onChange={(e) => setpassword(e.target.value)} />
          {bool && (
            <p className="p" style={{ color: text === "Login Successful" ? "green" : "red" }}>{text}</p>
          )}
          <div className="row3"><input type="checkbox" value={context} onChange={(e) => setcontext(e.target.checked)} /><h3>I agree to <span class="terms" onClick={() => setshowterms(true)} >Terms and conditions</span></h3>
          </div>
          <button className="buttonlogin" type="submit">Log In</button>
          <div className="row2">
            <p className="p">Don't have an account?</p>
            <button className="buttonlogin" type="button" onClick={() => setTimeout(() => (navigate("/signup")), 1000)} onKeyDown={(e) =>{if(e.key === "Enter") send(); }}>Sign Up</button>
          </div>
        </form>
        {showterms &&
          (
            <div className="floating">
              <div className="floating-content">
                <h2>Terms & Conditions</h2>
                <p>
                  <ul>
                    <li>a</li>
                    <li>b</li>
                    <li>c</li>
                  </ul>
                </p>
                <button className="buttonlogin3" onClick={() => setshowterms(false)} >Close</button>
              </div>
            </div>
          )}
      </div>

    </>
  );
}

export default Header

