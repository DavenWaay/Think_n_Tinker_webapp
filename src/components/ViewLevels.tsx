import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSections, getLevels } from '../services/firestore';
import type { SubjectType, Section, Level } from '../types';
import './ViewLevels.css';

const ViewLevels = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [levelsData, setLevelsData] = useState<Record<string, Level[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectedSubject) {
      loadSectionsAndLevels();
    }
  }, [selectedSubject]);

  const loadSectionsAndLevels = async () => {
    if (!selectedSubject) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedSections = await getSections(selectedSubject);
      setSections(fetchedSections);

      // Load levels for all sections
      const allLevels: Record<string, Level[]> = {};
      for (const section of fetchedSections) {
        const levels = await getLevels(selectedSubject, section.id);
        allLevels[section.id] = levels;
      }
      setLevelsData(allLevels);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSubjectSelect = (subject: SubjectType) => {
    setSelectedSubject(subject);
    setExpandedSections(new Set());
  };

  const renderStageInfo = (stage: any, index: number) => {
    return (
      <div key={index} className="stage-info">
        <strong>Stage {index + 1}:</strong> {stage.gameType}
        {stage.letter && <span> - Letter: {stage.letter}</span>}
        {stage.correctAnswer && <span> - Correct: {stage.correctAnswer}</span>}
        {stage.correctNumber && <span> - Number: {stage.correctNumber}</span>}
        {stage.correctCount && <span> - Count: {stage.correctCount}</span>}
        {stage.correctColor && <span> - Color: {stage.correctColor}</span>}
        {stage.correctChoice && <span> - Choice: {stage.correctChoice}</span>}
        {stage.correctShape && <span> - Shape: {stage.correctShape}</span>}
        {stage.imageCount && <span> - Images: {stage.imageCount}</span>}
        {stage.choices && <span> - Choices: [{stage.choices.join(', ')}]</span>}
        {stage.colors && <span> - Colors: [{stage.colors.join(', ')}]</span>}
      </div>
    );
  };

  if (!selectedSubject) {
    return (
      <div className="view-levels">
        <div className="view-levels-header">
          <h1>View Levels (Read-Only)</h1>
          <p>Browse all levels organized by subject and section</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="subject-selection">
          <h2>Select a Subject</h2>
          <div className="subject-grid">
            <button className="subject-card" onClick={() => handleSubjectSelect('alphabet')}>
              <span className="subject-icon">🔤</span>
              <span className="subject-name">Alphabet</span>
            </button>
            <button className="subject-card" onClick={() => handleSubjectSelect('numbers')}>
              <span className="subject-icon">🔢</span>
              <span className="subject-name">Numbers</span>
            </button>
            <button className="subject-card" onClick={() => handleSubjectSelect('colors')}>
              <span className="subject-icon">🎨</span>
              <span className="subject-name">Colors</span>
            </button>
            <button className="subject-card" onClick={() => handleSubjectSelect('shapes')}>
              <span className="subject-icon">🔷</span>
              <span className="subject-name">Shapes</span>
            </button>
          </div>
        </div>

        <div className="view-levels-footer">
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-levels">
      <div className="view-levels-header">
        <h1>View Levels: {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}</h1>
        <button className="btn btn-secondary" onClick={() => setSelectedSubject(null)}>
          ← Change Subject
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading data...</div>}

      {!loading && sections.length === 0 && (
        <div className="empty-state">
          <p>No sections found for this subject.</p>
        </div>
      )}

      <div className="sections-tree">
        {sections.map((section) => (
          <div key={section.id} className="section-node">
            <div className="section-header" onClick={() => toggleSection(section.id)}>
              <span className="expand-icon">
                {expandedSections.has(section.id) ? '▼' : '▶'}
              </span>
              <div className="section-info">
                <h3>{section.name}</h3>
                <p>{section.title}</p>
                {section.description && <small>{section.description}</small>}
                <span className="level-count">
                  {levelsData[section.id]?.length || 0} level(s)
                </span>
              </div>
            </div>

            {expandedSections.has(section.id) && (
              <div className="levels-list">
                {levelsData[section.id]?.length > 0 ? (
                  levelsData[section.id].map((level) => (
                    <div key={level.id} className="level-node">
                      <div className="level-header">
                        <span className="level-index">#{level.levelIndex}</span>
                        <div className="level-info">
                          <h4>{level.name}</h4>
                          <p>{level.title}</p>
                          <span className="game-type-badge">{level.gameType}</span>
                          <span className="icon-info">
                            Icon: {level.icon.set} / {level.icon.name}
                          </span>
                        </div>
                      </div>
                      <div className="stages-info">
                        <strong>Stages ({level.stages?.length || 0}):</strong>
                        {level.stages && level.stages.length > 0 ? (
                          <div className="stages-list">
                            {level.stages.map((stage, idx) => renderStageInfo(stage, idx))}
                          </div>
                        ) : (
                          <p>No stages configured</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-levels">No levels in this section</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="view-levels-footer">
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ViewLevels;
