import React, { useState } from 'react';
import { createLevel } from '../../services/firestore';
import type { NumberGameType, NumberStageData, SubjectType } from '../../types';
import './AlphabetLevelForm.css';

interface Props {
  gameType: NumberGameType;
  subjectId: SubjectType;
  sectionId: string;
  levelIndex: number;
  onSuccess: () => void;
  onCancel: () => void;
  // Optional: for edit mode
  initialData?: {
    levelName: string;
    levelTitle: string;
    iconSet: string;
    iconName: string;
    stages: NumberStageData[];
  };
  isEditMode?: boolean;
  levelId?: string;
}

const NumberLevelForm = ({ gameType, subjectId, sectionId, levelIndex, onSuccess, onCancel, initialData, isEditMode = false, levelId }: Props) => {
  const [levelName, setLevelName] = useState(initialData?.levelName || '');
  const [levelTitle, setLevelTitle] = useState(initialData?.levelTitle || '');
  const [iconSet, setIconSet] = useState(initialData?.iconSet || 'MaterialIcons');
  const [iconName, setIconName] = useState(initialData?.iconName || 'looks-one');
  const [stages, setStages] = useState<NumberStageData[]>(initialData?.stages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current stage being edited
  const [currentStage, setCurrentStage] = useState<Partial<NumberStageData>>({});
  
  // Track which stage index is being edited (null means adding new stage)
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  
  // Raw string inputs for comma-separated fields
  const [choicesInput, setChoicesInput] = useState('');

  const handleAddStage = () => {
    // For catching gameType, only allow one stage (unless editing)
    if (gameType === 'catching' && stages.length >= 1 && editingStageIndex === null) {
      setError('Catching game type only allows one stage');
      return;
    }

    if (isStageValid(currentStage)) {
      const stageWithGameType = {
        ...currentStage,
        gameType: gameType
      } as NumberStageData;
      
      if (editingStageIndex !== null) {
        // Update existing stage
        const updatedStages = [...stages];
        updatedStages[editingStageIndex] = stageWithGameType;
        setStages(updatedStages);
        setEditingStageIndex(null);
      } else {
        // Add new stage
        setStages([...stages, stageWithGameType]);
      }
      
      setCurrentStage({});
      setChoicesInput('');
      setError(null);
    } else {
      setError('Please fill in all required fields correctly');
    }
  };

  const handleEditStage = (index: number) => {
    const stage = stages[index];
    setCurrentStage(stage);
    setEditingStageIndex(index);
    if (stage.choices) setChoicesInput(stage.choices.join(', '));
  };

  const handleCancelEdit = () => {
    setCurrentStage({});
    setEditingStageIndex(null);
    setChoicesInput('');
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const isStageValid = (stage: Partial<NumberStageData>): boolean => {    
    switch (gameType) {
      case 'counting':
        // Validate that correctAnswer exists, and choices includes the correctAnswer
        if (!stage.correctAnswer || !stage.imageCount || !stage.choices || stage.choices.length !== 3) {
          return false;
        }
        // Check if correctAnswer is included in choices
        return stage.choices.includes(stage.correctAnswer);
      case 'dragndrop':
        return !!(stage.correctCount && stage.correctCount >= 1 && stage.correctCount <= 9);
      case 'catching':
        return !!(stage.correctNumber);
      default:
        return false;
    }
  };

  const handleSaveLevel = async () => {
    if (!levelName.trim() || !levelTitle.trim()) {
      setError('Level name and title are required');
      return;
    }

    if (stages.length === 0) {
      setError('At least one stage is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && levelId) {
        const { updateLevel } = await import('../../services/firestore');
        await updateLevel(subjectId, sectionId, levelId, {
          name: levelName,
          title: levelTitle,
          icon: {
            set: iconSet,
            name: iconName,
          },
          stages,
        });
      } else {
        await createLevel(subjectId, sectionId, {
          name: levelName,
          title: levelTitle,
          icon: {
            set: iconSet,
            name: iconName,
          },
          gameType,
          stages,
        });
      }
      onSuccess();
    } catch (err) {
      setError(isEditMode ? 'Failed to update level' : 'Failed to create level');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStageForm = () => {
    switch (gameType) {
      case 'counting':
        return (
          <div className="stage-form">
            <h4>Counting Game Configuration</h4>
            <div className="form-group">
              <label>Correct Answer *</label>
              <input
                type="number"
                min="1"
                max="10"
                value={currentStage.correctAnswer || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value);
                  // Auto-set imageCount to match correctAnswer
                  setCurrentStage({ 
                    ...currentStage, 
                    correctAnswer: value,
                    imageCount: numValue || undefined
                  });
                }}
                placeholder="1"
              />
              <small>Image count will automatically match this number</small>
            </div>
            <div className="form-group">
              <label>Choices (3 numbers, comma-separated) *</label>
              <input
                type="text"
                value={choicesInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setChoicesInput(input);
                  const choices = input.split(',').map(c => c.trim()).filter(c => c);
                  setCurrentStage({ ...currentStage, choices });
                }}
                placeholder="1,2,3"
              />
              <small>Enter exactly 3 numbers. The correct answer should be included.</small>
              {choicesInput && currentStage.choices && currentStage.choices.length !== 3 && (
                <small style={{ color: 'red', display: 'block', marginTop: '4px' }}>
                  ⚠ Please enter exactly 3 numbers
                </small>
              )}
            </div>
          </div>
        );

      case 'dragndrop':
        return (
          <div className="stage-form">
            <h4>Drag and Drop Game Configuration</h4>
            <div className="form-group">
              <label>Correct Count (1-9) *</label>
              <input
                type="number"
                min="1"
                max="9"
                value={currentStage.correctCount || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 9) {
                    setCurrentStage({ ...currentStage, correctCount: value });
                  }
                }}
                placeholder="5"
              />
              <small>Enter a number between 1 and 9</small>
            </div>
          </div>
        );

      case 'catching':
        return (
          <div className="stage-form">
            <h4>Catching Game Configuration</h4>
            {stages.length >= 1 && (
              <div style={{ color: '#e74c3c', marginBottom: '1rem', fontWeight: 'bold' }}>
                ⚠ Catching game type only allows one stage. Remove the existing stage to create a new one.
              </div>
            )}
            <div className="form-group">
              <label>Correct Number *</label>
              <input
                type="text"
                maxLength={2}
                value={currentStage.correctNumber || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctNumber: e.target.value })}
                placeholder="6"
              />
              <small>The number to catch in the game</small>
            </div>
          </div>
        );

      default:
        return <div>Game type not yet implemented</div>;
    }
  };

  return (
    <div className="alphabet-level-form">
      <h2>Step 4: Level Details</h2>
      <p>Game Type: <strong>{gameType === 'dragndrop' ? 'Drag and Drop' : gameType.charAt(0).toUpperCase() + gameType.slice(1)}</strong></p>
      <p>Level Index: <strong>{levelIndex}</strong></p>

      {error && <div className="error-message">{error}</div>}

      <div className="level-basic-info">
        <h3>Basic Information</h3>
        <div className="form-group">
          <label>Level Name *</label>
          <input
            type="text"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
            placeholder="e.g., Numbers 1-3"
          />
        </div>
        <div className="form-group">
          <label>Level Title *</label>
          <input
            type="text"
            value={levelTitle}
            onChange={(e) => setLevelTitle(e.target.value)}
            placeholder="e.g., Learn Numbers 1 to 3"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Icon Set</label>
            <select value={iconSet} onChange={(e) => setIconSet(e.target.value)}>
              <option value="MaterialIcons">MaterialIcons</option>
              <option value="FontAwesome5">FontAwesome5</option>
              <option value="Ionicons">Ionicons</option>
            </select>
          </div>
          <div className="form-group">
            <label>Icon Name</label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="star"
            />
          </div>
        </div>
      </div>

      {stages.length > 0 && (
        <div className="stages-list" style={{ margin: '2rem 0' }}>
          <h3>Configured Stages ({stages.length})</h3>
          {stages.map((stage, index) => (
            <React.Fragment key={index}>
              <div className="stage-item">
                <div className="stage-details" style={{ color: '#2c3e50' }}>
                  <strong>Stage {index + 1}</strong>
                  {stage.gameType && <span className="stage-type">{stage.gameType === 'dragndrop' ? 'Drag and Drop' : stage.gameType}</span>}
                  {stage.correctAnswer && <span>Answer: {stage.correctAnswer}</span>}
                  {stage.correctCount && <span>Count: {stage.correctCount}</span>}
                  {stage.correctNumber && <span>Number: {stage.correctNumber}</span>}
                </div>
                <div className="stage-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditStage(index)}
                    disabled={editingStageIndex === index}
                  >
                    {editingStageIndex === index ? 'Editing...' : 'Edit'}
                  </button>
                  <button onClick={() => handleRemoveStage(index)}>Remove</button>
                </div>
              </div>
              {editingStageIndex === index && (
                <>
                  <div className="editing-notice">
                    ✏️ Editing Stage {editingStageIndex + 1}
                    <button className="btn-cancel-edit" onClick={handleCancelEdit}>Cancel Edit</button>
                  </div>
                  {renderStageForm()}
                  <button 
                    className="btn-secondary" 
                    onClick={handleAddStage}
                    style={{ marginTop: '1rem', width: '100%', marginBottom: '1rem' }}
                  >
                    ✓ Update Stage
                  </button>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="stages-section">
        <h3>Stages</h3>
        {editingStageIndex === null && (
          <>
            {renderStageForm()}
            <button 
              className="btn-secondary" 
              onClick={handleAddStage}
              disabled={gameType === 'catching' && stages.length >= 1 && editingStageIndex === null}
            >
              ✓ Confirm & Add Stage
            </button>
          </>
        )}
      </div>

      <div className="form-actions">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={handleSaveLevel} disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : (isEditMode ? 'Update Level' : 'Create Level')}
        </button>
      </div>
    </div>
  );
};

export default NumberLevelForm;
