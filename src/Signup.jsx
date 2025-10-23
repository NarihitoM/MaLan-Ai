import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

function Signup() {
  const [text, settext] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const [bool, setbool] = useState(false);
  const [showterms, setshowterms] = useState(false);
  const [context, setcontext] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const navigate = useNavigate();

  const handlevalidation = (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      settext("Please Enter a valid email");
    } else if (password !== confirmpassword) {
      settext("Password is incorrect");
    }
     else if (!context) {
      settext("Please check terms and conditions");
    } else {
      settext("Account Successfully Created");
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    }
  };

  useEffect(() => {
    if(email === "" && password === "" && confirmpassword === "")
    {setbool(true);
    settext("");
    return;
    }
    else if (!emailRegex.test(email) ) {
      settext("Please Enter a valid email");
    } else if (password !== confirmpassword && confirmpassword !== "") {
      settext("Password is incorrect");
    } else {
      settext("");
    }
  }, [email, password, confirmpassword]);

  return (
    <>
    <div className="Body">
      <form className="Form2" onSubmit={handlevalidation}>
        <h1 className="h1">MaLan-Ai</h1>
        <label className="label">Create Email</label>
        <input type="text" className="input" value={email} style={email === "" ?{border: "2px solid gray"} : { border: "2px solid " + (emailRegex.test(email) ? "green" : "red") }} onChange={(e) => setemail(e.target.value)} placeholder="Enter Email"/>
        <label className="label">Create Password</label>
        <input type="password"className="input"value={password} style={{ border: password === "" ? "2px solid gray" : password === confirmpassword ? "2px solid green" : "2px solid red" }} onChange={(e) => setpassword(e.target.value)}placeholder="Enter Password"/>
        <label className="label">Confirm Password</label>
        <input type="password" className="input"value={confirmpassword} style={{ border: confirmpassword === "" ? "2px solid gray" : password === confirmpassword ? "2px solid green" : "2px solid red"}} onChange={(e) => setconfirmpassword(e.target.value)} placeholder="Enter Confirm Password"
        />
        {bool && (<p className="p" style={{ color: text === "Account Successfully Created" ? "green" : "red" }} >{text}</p>)}
        <div className="row3"><input type="checkbox" value={context} onChange={(e) => setcontext(e.target.checked)} /><h3>I agree to <span class="terms" onClick={() => setshowterms(true)} >Terms and conditions</span></h3>
          </div>
        <button className="buttonlogin" type="submit">Submit</button>
        <div className="row2">
          <p className="p">Have an existing account?</p>
          <button className="buttonlogin" type="button" onClick={() => navigate("/login")} >Log In</button>
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

export default Signup;
