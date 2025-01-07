import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import SchedulePage from "./pages/SchedulePage";
import TaskPage from "./pages/TaskPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </Router>
  );
}

export default App;
