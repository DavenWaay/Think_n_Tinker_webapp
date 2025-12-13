import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSections, getLevels, deleteLevel } from '../services/firestore';
import type { SubjectType, Section, Level } from '../types';

type Step = 'subject' | 'section' | 'level' | 'confirm';

export default function DeleteLevel() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('subject');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selection state
  const [sections, setSections] = useState<Section[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<SubjectType | ''>('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const subjects = [
    { id: 'alphabet', name: 'Alphabet', icon: '🔤' },
    { id: 'numbers', name: 'Numbers', icon: '🔢' },
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'shapes', name: 'Shapes', icon: '🔺' }
  ];

  const loadSections = async (subjectId: SubjectType) => {
    try {
      setLoading(true);
      const data = await getSections(subjectId);
      setSections(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sections');
      setLoading(false);
      console.error(err);
    }
  };

  const loadLevels = async (subjectId: SubjectType, sectionId: string) => {
    try {
      setLoading(true);
      const data = await getLevels(subjectId, sectionId);
      setLevels(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load levels');
      setLoading(false);
      console.error(err);
    }
  };

  const handleSubjectSelect = (subjectId: SubjectType) => {
    setSelectedSubject(subjectId);
    setSelectedSection('');
    setSelectedLevel(null);
    loadSections(subjectId);
    setStep('section');
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setSelectedLevel(null);
    if (selectedSubject) {
      loadLevels(selectedSubject, sectionId);
      setStep('level');
    }
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setStep('confirm');
  };

  const handleDelete = async () => {
    if (!selectedSubject || !selectedSection || !selectedLevel) return;

    try {
      setLoading(true);
      await deleteLevel(selectedSubject, selectedSection, selectedLevel.id);
      alert('Level deleted successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to delete level');
      console.error(err);
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'section') {
      setStep('subject');
      setSelectedSubject('');
    } else if (step === 'level') {
      setStep('section');
      setSelectedSection('');
    } else if (step === 'confirm') {
      setStep('level');
      setSelectedLevel(null);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'subject':
        return (
          <div className="selection-grid">
            <h2>Select Subject</h2>
            <div className="subject-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id as SubjectType)}
                  className="selection-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span style={{ fontSize: '2rem' }}>{subject.icon}</span>
                  <strong>{subject.name}</strong>
                </button>
              ))}
            </div>
          </div>
        );

      case 'section':
        return (
          <div className="selection-grid">
            <h2>Select Section</h2>
            {loading ? (
              <p>Loading sections...</p>
            ) : sections.length === 0 ? (
              <p>No sections found</p>
            ) : (
              sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section.id)}
                  className="selection-card"
                >
                  <strong>{section.name}</strong>
                  <small>{section.description}</small>
                </button>
              ))
            )}
          </div>
        );

      case 'level':
        return (
          <div className="selection-grid">
            <h2>Select Level to Delete</h2>
            {loading ? (
              <p>Loading levels...</p>
            ) : levels.length === 0 ? (
              <p>No levels found</p>
            ) : (
              levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleLevelSelect(level)}
                  className="selection-card"
                >
                  <strong>{level.name}</strong>
                  <small>Stages: {level.stages?.length || 0}</small>
                </button>
              ))
            )}
          </div>
        );

      case 'confirm':
        if (!selectedLevel) return null;
        return (
          <div className="confirm-delete">
            <h2>⚠️ Confirm Deletion</h2>
            <div className="warning-box">
              <p><strong>Warning:</strong> This action cannot be undone!</p>
              <p>You are about to permanently delete the following level:</p>
            </div>
            
            <div className="level-details">
              <h3>{selectedLevel.name}</h3>
              <p><strong>Title:</strong> {selectedLevel.title}</p>
              <p><strong>Subject:</strong> {selectedSubject}</p>
              <p><strong>Section:</strong> {sections.find(s => s.id === selectedSection)?.name}</p>
              <p><strong>Stages:</strong> {selectedLevel.stages?.length || 0}</p>
              <p><strong>Level Index:</strong> {selectedLevel.levelIndex}</p>
              
              {selectedLevel.stages && selectedLevel.stages.length > 0 && (
                <div className="stages-preview">
                  <strong>Stages Preview:</strong>
                  <ul>
                    {selectedLevel.stages.slice(0, 3).map((stage, idx) => (
                      <li key={idx}>
                        Stage {idx + 1}: {JSON.stringify(stage).substring(0, 50)}...
                      </li>
                    ))}
                    {selectedLevel.stages.length > 3 && (
                      <li>...and {selectedLevel.stages.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="confirm-actions">
              <button 
                onClick={handleBack} 
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-danger"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="delete-level-container">
      <div className="header">
        <h1>Delete Level</h1>
        <div className="breadcrumb">
          {selectedSubject && <span>{selectedSubject}</span>}
          {selectedSection && <span> → {sections.find(s => s.id === selectedSection)?.name}</span>}
          {selectedLevel && <span> → {selectedLevel.name}</span>}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {step !== 'subject' && step !== 'confirm' && (
        <button onClick={handleBack} className="btn-back">
          ← Back
        </button>
      )}

      {renderStepContent()}
    </div>
  );
}
