import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubject, getStages, createStage, deleteStage } from '../services/firestore';

interface Stage {
  id: string;
  name: string;
  level: number;
}

function SubjectEditor() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newStage, setNewStage] = useState({ id: '', name: '', level: 1 });

  useEffect(() => {
    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectData, stagesData] = await Promise.all([
        getSubject(subjectId!),
        getStages(subjectId!)
      ]);
      setSubject(subjectData);
      setStages(stagesData as Stage[]);
      setError('');
    } catch (err) {
      setError('Failed to load data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStage(subjectId!, newStage.id, {
        name: newStage.name,
        level: newStage.level,
        games: [],
        updatedAt: new Date().toISOString()
      });
      setNewStage({ id: '', name: '', level: stages.length + 1 });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError('Failed to create stage: ' + (err as Error).message);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;
    try {
      await deleteStage(subjectId!, stageId);
      loadData();
    } catch (err) {
      setError('Failed to delete stage: ' + (err as Error).message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!subject) return <div className="error">Subject not found</div>;

  return (
    <div>
      <Link to="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back to Subjects</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>{subject.name}</h2>
          {subject.description && <p>{subject.description}</p>}
        </div>
        <button 
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Stage'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Create New Stage</h3>
          <form onSubmit={handleCreateStage}>
            <div className="form-group">
              <label>Stage ID (e.g., stage_1)</label>
              <input
                type="text"
                value={newStage.id}
                onChange={(e) => setNewStage({ ...newStage, id: e.target.value })}
                required
                placeholder="stage_1"
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                required
                placeholder="Stage 1"
              />
            </div>
            <div className="form-group">
              <label>Level</label>
              <input
                type="number"
                value={newStage.level}
                onChange={(e) => setNewStage({ ...newStage, level: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <button type="submit" className="button button-success">Create Stage</button>
          </form>
        </div>
      )}

      <div>
        {stages.sort((a, b) => a.level - b.level).map((stage) => (
          <div key={stage.id} className="list-item">
            <div>
              <strong>{stage.name}</strong> (Level {stage.level})
            </div>
            <div className="button-group">
              <Link 
                to={`/subject/${subjectId}/stage/${stage.id}`}
                className="button button-primary"
              >
                Edit Games
              </Link>
              <button
                className="button button-danger"
                onClick={() => handleDeleteStage(stage.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {stages.length === 0 && !showForm && (
        <div className="card">
          <p>No stages found. Click "Add New Stage" to get started.</p>
        </div>
      )}
    </div>
  );
}

export default SubjectEditor;
