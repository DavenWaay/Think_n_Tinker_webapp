import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateLevel from './components/CreateLevel';
import UpdateLevel from './components/UpdateLevel';
import DeleteLevel from './components/DeleteLevel';
import ViewLevels from './components/ViewLevels';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Think n' Tinker CMS</h1>
          <Link to="/">Dashboard</Link>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-level" element={<CreateLevel />} />
            <Route path="/update-level" element={<UpdateLevel />} />
            <Route path="/delete-level" element={<DeleteLevel />} />
            <Route path="/view-levels" element={<ViewLevels />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
