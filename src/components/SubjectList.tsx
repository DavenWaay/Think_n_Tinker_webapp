import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubjects, createSubject, deleteSubject } from '../services/firestore';

interface Subject {
  id: string;
  name: string;
  description?: string;
}

function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ id: '', name: '', description: '' });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data as Subject[]);
      setError('');
    } catch (err) {
      setError('Failed to load subjects: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubject(newSubject.id, {
        name: newSubject.name,
        description: newSubject.description,
        updatedAt: new Date().toISOString()
      });
      setNewSubject({ id: '', name: '', description: '' });
      setShowForm(false);
      loadSubjects();
    } catch (err) {
      setError('Failed to create subject: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await deleteSubject(id);
      loadSubjects();
    } catch (err) {
      setError('Failed to delete subject: ' + (err as Error).message);
    }
  };

  if (loading) return <div className="loading">Loading subjects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Subjects</h2>
        <button 
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Subject'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Create New Subject</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Subject ID (e.g., alphabet, numbers)</label>
              <input
                type="text"
                value={newSubject.id}
                onChange={(e) => setNewSubject({ ...newSubject, id: e.target.value })}
                required
                placeholder="alphabet"
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                required
                placeholder="Alphabet"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newSubject.description}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                placeholder="Learn the alphabet..."
              />
            </div>
            <button type="submit" className="button button-success">Create Subject</button>
          </form>
        </div>
      )}

      <div className="grid">
        {subjects.map((subject) => (
          <div key={subject.id} className="card">
            <h3>{subject.name}</h3>
            {subject.description && <p>{subject.description}</p>}
            <div className="button-group">
              <Link to={`/subject/${subject.id}`} className="button button-primary">
                Manage Stages
              </Link>
              <button
                className="button button-danger"
                onClick={() => handleDelete(subject.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && !showForm && (
        <div className="card">
          <p>No subjects found. Click "Add New Subject" to get started.</p>
        </div>
      )}
    </div>
  );
}

export default SubjectList;
