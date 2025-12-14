import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Think n' Tinker CMS</h1>
        <p>Content Management System for Think n Tinker</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card create">
          <div className="card-icon">➕</div>
          <h2>Create Level</h2>
          <p>Add a new level to a subject section</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/create-level')}
          >
            Create New Level
          </button>
        </div>

        <div className="dashboard-card update">
          <div className="card-icon">✏️</div>
          <h2>Update Level</h2>
          <p>Edit an existing level</p>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/update-level')}
          >
            Update Level
          </button>
        </div>

        <div className="dashboard-card delete">
          <div className="card-icon">🗑️</div>
          <h2>Delete Level</h2>
          <p>Remove a level from a section</p>
          <button 
            className="btn btn-danger"
            onClick={() => navigate('/delete-level')}
          >
            Delete Level
          </button>
        </div>

        <div className="dashboard-card view">
          <div className="card-icon">👁️</div>
          <h2>View Levels</h2>
          <p>Browse all levels (read-only)</p>
          <button 
            className="btn btn-info"
            onClick={() => navigate('/view-levels')}
          >
            View All Levels
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
