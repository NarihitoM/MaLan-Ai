import { useEffect, useState } from "react";
import "./index.css"
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Header() {
  const [user, setuser] = useState("");
  const [password, setpassword] = useState("");
  const [text, settext] = useState("");
  const [bool, setbool] = useState(false);
  const [showterms, setshowterms] = useState(false);
  const [context, setcontext] = useState(false);
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const Handlevalidation = (e) => {
    e.preventDefault();
    if (user === "" && password === "") {
      settext("Please fill in all the fields");
    } else if (!emailRegex.test(user)) {
      settext("Please Enter a valid email");
    } else if (password.length < 6) {
      settext("Password must be at least 6 characters");
    }
    else if (!context) {
      settext("Please check terms and conditions");
    }
    else {
      try {
        let testemail = "hha@gmail.com";
        let testpassword = "hha281005";
        const response = { email: user, password: password }
        if (response.email === testemail && response.password === testpassword) {
          settext("Login Successful");
          setbool(true);
          localStorage.setItem("email", user);
          localStorage.setItem("keepLoggedIn", JSON.stringify(true));
          setTimeout(() => {
            navigate("/chat");
          }, 2000);
        }
        else {
          settext("Login Failed");
          setbool(true);
        }
      }
      catch (error) {
        settext("An error occurred during login");
      }
    }
  };

  const googlelogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google login success:", tokenResponse);

        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        settext("Google Account Successfully Logged In");
        setbool(true);
        localStorage.setItem("googleemail", res.data.email);
        localStorage.setItem("googlename", res.data.name);
        localStorage.setItem("googlepicture", res.data.picture);
        localStorage.setItem("keepLoggedIn", JSON.stringify(true));
        console.log("Google picture URL:", res.data.picture);
        setTimeout(() => navigate("/chat"), 1000);
      }
      catch (error) {
        console.error("Error fetching Google user info:", error);
        settext('Fail to logged in');
        setbool(true);
      }
    },
    onError: () => {
      settext("Google Login Failed");
      setbool(true);
    },
  });

  useEffect(() => {
    if (user === "" && password === "") {
      setbool(true);
      settext("");
      return;
    }
    if (!emailRegex.test(user)) {
      settext("Please Enter a valid email");
    }
    else if (password.length < 6 && password !== "") {
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
          <label className="label">Enter Email</label>
          <input className="input" type="text" style={{ border: user === "" ? "2px solid gray" : emailRegex.test(user) ? "2px solid green" : "2px solid red" }} value={user} placeholder="Enter Email" onChange={(e) => setuser(e.target.value)} />
          <label className="label">Enter Password</label>
          <input className="input" type="password" style={{ border: password === "" ? "2px solid gray" : password.length >= 6 ? "2px solid green" : "2px solid red" }} value={password} placeholder="Enter password" onChange={(e) => setpassword(e.target.value)} />
          {bool && (
            <p className="p" style={{ color: text === "Login Successful" || text === "Google Account Successfully Logged In" ? "green" : "red" }}>{text}</p>
          )}
          <div className="row3"><input type="checkbox" value={context} onChange={(e) => setcontext(e.target.checked)} /><h3>I agree to <span class="terms" onClick={() => setshowterms(true)} >Terms and conditions</span></h3>
          </div>
          <button className="buttonlogin" type="submit">Log In</button>
          <button className="buttonlogin1" type="button" onClick={googlelogin}>
            <i class="fa-brands fa-google"></i> &nbsp; Login with Google</button>
          <div className="row2">
            <p className="p">Don't have an account?</p>
            <button className="buttonlogin" type="button" onClick={() => navigate("/signup")} onKeyDown={(e) => { if (e.key === "Enter") send(); }}>Sign Up</button>
          </div>
        </form>
        {showterms &&
          (
            <div className="floating">
              <div className="floating-content">
                <h2>Terms & Conditions</h2>
                <ol type="I">
                  <li>a</li>
                  <li>b</li>
                  <li>c</li>
                </ol>
                <button className="buttonlogin3" onClick={() => setshowterms(false)} >Close</button>
              </div>
            </div>
          )}
      </div>

    </>
  );
}

export default Header

