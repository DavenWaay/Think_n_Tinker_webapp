import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSections, getLevels, updateSection } from '../services/firestore';
import type { 
  SubjectType, 
  Section, 
  Level,
  AlphabetGameType,
  NumberGameType,
  ColorGameType,
  ShapeGameType
} from '../types';
import AlphabetLevelForm from './forms/AlphabetLevelForm';
import NumberLevelForm from './forms/NumberLevelForm';
import ColorLevelForm from './forms/ColorLevelForm';
import ShapeLevelForm from './forms/ShapeLevelForm';
import './UpdateLevel.css';

type Step = 'subject' | 'section' | 'level' | 'edit';

const UpdateLevel = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<Step>('subject');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Section editing state
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionDescription, setEditSectionDescription] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    if (selectedSubject && currentStep === 'section') {
      loadSections();
    }
  }, [selectedSubject, currentStep]);

  useEffect(() => {
    if (selectedSubject && selectedSection && currentStep === 'level') {
      loadLevels();
    }
  }, [selectedSubject, selectedSection, currentStep]);

  const loadSections = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedSections = await getSections(selectedSubject);
      setSections(fetchedSections);
    } catch (err) {
      setError('Failed to load sections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLevels = async () => {
    if (!selectedSubject || !selectedSection) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedLevels = await getLevels(selectedSubject, selectedSection);
      setLevels(fetchedLevels);
    } catch (err) {
      setError('Failed to load levels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subject: SubjectType) => {
    setSelectedSubject(subject);
    setCurrentStep('section');
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentStep('level');
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setCurrentStep('edit');
  };

  const handleBack = () => {
    const steps: Step[] = ['subject', 'section', 'level', 'edit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setEditSectionName(section.name);
    setEditSectionTitle(section.title);
    setEditSectionDescription(section.description || '');
  };

  const handleCancelEditSection = () => {
    setEditingSection(null);
    setEditSectionName('');
    setEditSectionTitle('');
    setEditSectionDescription('');
  };

  const handleSaveSection = async () => {
    if (!selectedSubject || !editingSection) return;
    
    setSavingSection(true);
    try {
      await updateSection(selectedSubject, editingSection.id, {
        name: editSectionName,
        title: editSectionTitle,
        description: editSectionDescription
      });
      
      // Refresh sections list
      await loadSections();
      handleCancelEditSection();
      alert('Section updated successfully!');
    } catch (err) {
      console.error('Error updating section:', err);
      alert('Failed to update section');
    } finally {
      setSavingSection(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'subject':
        return (
          <div className="step-content">
            <h2>Step 1: Choose Subject</h2>
            <p>Select which subject contains the level you want to update:</p>
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
        );

      case 'section':
        return (
          <div className="step-content">
            <h2>Step 2: Choose Section</h2>
            <p>Subject: <strong>{selectedSubject}</strong></p>
            {loading && <div className="loading">Loading sections...</div>}
            {!loading && sections.length === 0 && (
              <div className="empty-state">No sections found</div>
            )}
            <div className="sections-list">
              {sections.map((section) => (
                <div key={section.id} className="section-card-wrapper">
                  <button
                    className="section-card"
                    onClick={() => handleSectionSelect(section.id)}
                  >
                    <h3>{section.name}</h3>
                    <p>{section.title}</p>
                    {section.description && <small>{section.description}</small>}
                  </button>
                  <button
                    className="btn-edit-section"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSection(section);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'level':
        return (
          <div className="step-content">
            <h2>Step 3: Choose Level</h2>
            <p>Subject: <strong>{selectedSubject}</strong></p>
            <p>Section: <strong>{selectedSection}</strong></p>
            {loading && <div className="loading">Loading levels...</div>}
            {!loading && levels.length === 0 && (
              <div className="empty-state">No levels found in this section</div>
            )}
            <div className="levels-list">
              {levels.map((level) => (
                <button
                  key={level.id}
                  className="level-card"
                  onClick={() => handleLevelSelect(level)}
                >
                  <div className="level-index">#{level.levelIndex}</div>
                  <div className="level-content">
                    <h3>{level.name}</h3>
                    <p>{level.title}</p>
                    <span className="game-type-badge">{level.gameType}</span>
                    <span className="stages-count">{level.stages?.length || 0} stage(s)</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'edit':
        if (!selectedLevel || !selectedSubject || !selectedSection) return null;

        const initialData = {
          levelName: selectedLevel.name,
          levelTitle: selectedLevel.title,
          stages: selectedLevel.stages || [],
        };

        // Render the appropriate form based on subject
        if (selectedSubject === 'alphabet') {
          return (
            <AlphabetLevelForm
              gameType={selectedLevel.gameType as AlphabetGameType}
              subjectId={selectedSubject}
              sectionId={selectedSection}
              levelIndex={selectedLevel.levelIndex}
              onSuccess={() => navigate('/')}
              onCancel={handleBack}
              initialData={initialData}
              isEditMode={true}
              levelId={selectedLevel.id}
            />
          );
        }
        
        if (selectedSubject === 'numbers') {
          return (
            <NumberLevelForm
              gameType={selectedLevel.gameType as NumberGameType}
              subjectId={selectedSubject}
              sectionId={selectedSection}
              levelIndex={selectedLevel.levelIndex}
              onSuccess={() => navigate('/')}
              onCancel={handleBack}
              initialData={initialData}
              isEditMode={true}
              levelId={selectedLevel.id}
            />
          );
        }

        if (selectedSubject === 'colors') {
          return (
            <ColorLevelForm
              gameType={selectedLevel.gameType as ColorGameType}
              subjectId={selectedSubject}
              sectionId={selectedSection}
              levelIndex={selectedLevel.levelIndex}
              onSuccess={() => navigate('/')}
              onCancel={handleBack}
              initialData={initialData}
              isEditMode={true}
              levelId={selectedLevel.id}
            />
          );
        }

        if (selectedSubject === 'shapes') {
          return (
            <ShapeLevelForm
              gameType={selectedLevel.gameType as ShapeGameType}
              subjectId={selectedSubject}
              sectionId={selectedSection}
              levelIndex={selectedLevel.levelIndex}
              onSuccess={() => navigate('/')}
              onCancel={handleBack}
              initialData={initialData}
              isEditMode={true}
              levelId={selectedLevel.id}
            />
          );
        }

        return <div>Subject form not implemented</div>;

      default:
        return null;
    }
  };

  return (
    <div className="update-level">
      <div className="update-level-header">
        <h1>Update Level</h1>
        <div className="step-indicator">
          <span className={currentStep === 'subject' ? 'active' : ''}>1. Subject</span>
          <span className={currentStep === 'section' ? 'active' : ''}>2. Section</span>
          <span className={currentStep === 'level' ? 'active' : ''}>3. Level</span>
          <span className={currentStep === 'edit' ? 'active' : ''}>4. Edit</span>
        </div>
      </div>

      <div className="update-level-body">
        {renderStepContent()}
      </div>

      <div className="update-level-footer">
        {currentStep !== 'subject' && (
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
        )}
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Go Back to Dashboard
        </button>
      </div>

      {/* Section Edit Modal */}
      {editingSection && (
        <div className="modal-overlay" onClick={handleCancelEditSection}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Section</h2>
              <button className="modal-close" onClick={handleCancelEditSection}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Section Name *</label>
                <input
                  type="text"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  placeholder="e.g., section1"
                />
              </div>
              <div className="form-group">
                <label>Section Title *</label>
                <input
                  type="text"
                  value={editSectionTitle}
                  onChange={(e) => setEditSectionTitle(e.target.value)}
                  placeholder="e.g., Basic Letters"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editSectionDescription}
                  onChange={(e) => setEditSectionDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancelEditSection}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveSection}
                disabled={savingSection || !editSectionName || !editSectionTitle}
              >
                {savingSection ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateLevel;
