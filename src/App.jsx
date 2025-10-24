import { BrowserRouter as Router, Routes, Route,Navigate} from "react-router-dom";
import Header from "./Header.jsx"
import Chat from "./chat.jsx"
import Signup from "./Signup.jsx"

function App() {
  const isLoggedin = JSON.parse(localStorage.getItem("keepLoggedIn"))
 return(
  <Router>
    <Routes>
      <Route path="/" element={isLoggedin ? <Navigate to={"/chat"}/>: <Header/>}/>
      <Route path="/login" element={<Header/>}/>
      <Route path="/chat" element={<Chat/>}/>
      <Route path="/signup" element={<Signup/>}/>
    </Routes>
  </Router>
  );
}

export default App
