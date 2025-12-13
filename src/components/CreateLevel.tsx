import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSections, createSection, getNextLevelIndex } from '../services/firestore';
import type { SubjectType, AlphabetGameType, NumberGameType, Section } from '../types';
import AlphabetLevelForm from './forms/AlphabetLevelForm';
import NumberLevelForm from './forms/NumberLevelForm';
import './CreateLevel.css';

type Step = 'subject' | 'section' | 'gameType' | 'levelDetails';

const CreateLevel = () => {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('subject');
  
  // Form data
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
  const [nextLevelIndex, setNextLevelIndex] = useState<number>(1);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sections when subject is selected
  useEffect(() => {
    if (selectedSubject && currentStep === 'section') {
      loadSections();
    }
  }, [selectedSubject, currentStep]);

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

  // Get next level index when section is selected
  useEffect(() => {
    if (selectedSubject && selectedSection && currentStep === 'gameType') {
      fetchNextLevelIndex();
    }
  }, [selectedSubject, selectedSection, currentStep]);

  const fetchNextLevelIndex = async () => {
    if (!selectedSubject || !selectedSection) return;
    
    try {
      const index = await getNextLevelIndex(selectedSubject, selectedSection);
      setNextLevelIndex(index);
    } catch (err) {
      console.error('Failed to get next level index:', err);
    }
  };

  const handleSubjectSelect = (subject: SubjectType) => {
    setSelectedSubject(subject);
    setCurrentStep('section');
  };

  const handleSectionSelect = async (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentStep('gameType');
  };

  const handleCreateNewSection = async () => {
    if (!selectedSubject || !newSectionName.trim() || !newSectionTitle.trim()) {
      setError('Section name and title are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const sectionId = await createSection(selectedSubject, {
        name: newSectionName,
        title: newSectionTitle,
        description: newSectionDescription || undefined,
      });
      setSelectedSection(sectionId);
      setIsCreatingNewSection(false);
      setCurrentStep('gameType');
    } catch (err) {
      setError('Failed to create section');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
    setCurrentStep('levelDetails');
  };

  const handleBack = () => {
    const steps: Step[] = ['subject', 'section', 'gameType', 'levelDetails'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'subject':
        return (
          <div className="step-content">
            <h2>Step 1: Choose Subject</h2>
            <p>Select which subject you want to create a level for:</p>
            <div className="subject-grid">
              <button 
                className="subject-card"
                onClick={() => handleSubjectSelect('alphabet')}
              >
                <span className="subject-icon">🔤</span>
                <span className="subject-name">Alphabet</span>
              </button>
              <button 
                className="subject-card"
                onClick={() => handleSubjectSelect('numbers')}
              >
                <span className="subject-icon">🔢</span>
                <span className="subject-name">Numbers</span>
              </button>
              <button 
                className="subject-card"
                onClick={() => handleSubjectSelect('colors')}
              >
                <span className="subject-icon">🎨</span>
                <span className="subject-name">Colors</span>
              </button>
              <button 
                className="subject-card"
                onClick={() => handleSubjectSelect('shapes')}
              >
                <span className="subject-icon">⬛</span>
                <span className="subject-name">Shapes</span>
              </button>
            </div>
          </div>
        );

      case 'section':
        return (
          <div className="step-content">
            <h2>Step 2: Choose or Create Section</h2>
            <p>Subject: <strong>{selectedSubject}</strong></p>
            
            {loading ? (
              <div className="loading">Loading sections...</div>
            ) : (
              <>
                {sections.length > 0 && !isCreatingNewSection && (
                  <div className="section-list">
                    <h3>Existing Sections:</h3>
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        className="section-item"
                        onClick={() => handleSectionSelect(section.id)}
                      >
                        <div className="section-info">
                          <strong>{section.title}</strong>
                          <span className="section-id">{section.id}</span>
                        </div>
                        {section.description && (
                          <p className="section-description">{section.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {!isCreatingNewSection && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsCreatingNewSection(true)}
                  >
                    + Create New Section
                  </button>
                )}

                {isCreatingNewSection && (
                  <div className="new-section-form">
                    <h3>Create New Section</h3>
                    <div className="form-group">
                      <label>Section Name *</label>
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="e.g., Basic Letters"
                      />
                    </div>
                    <div className="form-group">
                      <label>Section Title *</label>
                      <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="e.g., Learn the Alphabet"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description (Optional)</label>
                      <textarea
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                        placeholder="Brief description of this section..."
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleCreateNewSection}
                        disabled={loading}
                      >
                        Create Section
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setIsCreatingNewSection(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'gameType':
        return (
          <div className="step-content">
            <h2>Step 3: Choose Game Type</h2>
            <p>Subject: <strong>{selectedSubject}</strong></p>
            <p>Section: <strong>{selectedSection}</strong></p>
            <p>Level Index: <strong>{nextLevelIndex}</strong> (auto-assigned)</p>
            
            {selectedSubject === 'alphabet' && (
              <div className="gametype-grid">
                <button className="gametype-card" onClick={() => handleGameTypeSelect('phonics')}>
                  <span className="gametype-name">Phonics</span>
                  <span className="gametype-desc">Letter sound recognition</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('image')}>
                  <span className="gametype-name">Image</span>
                  <span className="gametype-desc">Match letter with image</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('tracing')}>
                  <span className="gametype-name">Tracing</span>
                  <span className="gametype-desc">Trace letter shapes</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('cards')}>
                  <span className="gametype-name">Cards</span>
                  <span className="gametype-desc">Memory card matching</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('sound')}>
                  <span className="gametype-name">Sound</span>
                  <span className="gametype-desc">Audio-based matching</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('catching')}>
                  <span className="gametype-name">Catching</span>
                  <span className="gametype-desc">Catch falling letters</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('mixed')}>
                  <span className="gametype-name">Mixed</span>
                  <span className="gametype-desc">Combination of games</span>
                </button>
              </div>
            )}

            {selectedSubject === 'numbers' && (
              <div className="gametype-list" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('counting')}>
                  <span className="gametype-name">Counting</span>
                  <span className="gametype-desc">Count objects</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('dragndrop')}>
                  <span className="gametype-name">Drag and Drop</span>
                  <span className="gametype-desc">Drag items to boxes</span>
                </button>
                <button className="gametype-card" onClick={() => handleGameTypeSelect('catching')}>
                  <span className="gametype-name">Catching</span>
                  <span className="gametype-desc">Catch the correct number</span>
                </button>
              </div>
            )}
            
            {/* TODO: Add game types for colors and shapes */}
          </div>
        );

      case 'levelDetails':
        if (selectedSubject === 'alphabet' && selectedGameType) {
          return (
            <AlphabetLevelForm
              gameType={selectedGameType as AlphabetGameType}
              subjectId={selectedSubject}
              sectionId={selectedSection!}
              levelIndex={nextLevelIndex}
              onSuccess={() => navigate('/')}
              onCancel={handleBack}
            />
          );
        }
        if (selectedSubject === 'numbers' && selectedGameType) {
          return (
            <NumberLevelForm
              gameType={selectedGameType as NumberGameType}
              subjectId={selectedSubject}
              sectionId={selectedSection!}
              levelIndex={nextLevelIndex}
              onSuccess={() => navigate('/')}
              onCancel={handleBack}
            />
          );
        }
        return <div>Level form not implemented for this subject yet</div>;

      default:
        return null;
    }
  };

  return (
    <div className="create-level">
      <div className="create-level-header">
        <h1>Create New Level</h1>
        <div className="step-indicator">
          <span className={currentStep === 'subject' ? 'active' : ''}>1. Subject</span>
          <span className={currentStep === 'section' ? 'active' : ''}>2. Section</span>
          <span className={currentStep === 'gameType' ? 'active' : ''}>3. Game Type</span>
          <span className={currentStep === 'levelDetails' ? 'active' : ''}>4. Level Details</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="create-level-body">
        {renderStepContent()}
      </div>

      <div className="create-level-footer">
        {currentStep !== 'subject' && (
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
        )}
        <button className="btn btn-outline" onClick={handleCancel}>
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CreateLevel;
