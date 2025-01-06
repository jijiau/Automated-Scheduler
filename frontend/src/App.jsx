import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import AddTasks from "./pages/AddTasks"
import TaskList from "./pages/TaskList"
import SchedulePage from "./pages/SchedulePage";
import TaskPage from "./pages/TaskPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/addtasks" element={<AddTasks />} />
        <Route path="/tasklist" element={<TaskList />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </Router>
  );
}

export default App;
