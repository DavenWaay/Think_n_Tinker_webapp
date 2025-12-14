import React, { useState } from 'react';
import { createLevel } from '../../services/firestore';
import type { ColorGameType, ColorStageData, SubjectType } from '../../types';
import { colorGameTypeIcons } from '../../utils/gameTypeIcons';
import './AlphabetLevelForm.css';

interface Props {
  gameType: ColorGameType;
  subjectId: SubjectType;
  sectionId: string;
  levelIndex: number;
  onSuccess: () => void;
  onCancel: () => void;
  // Optional: for edit mode
  initialData?: {
    levelName: string;
    levelTitle: string;
    stages: ColorStageData[];
  };
  isEditMode?: boolean;
  levelId?: string;
}

const AVAILABLE_COLORS = [
  'red',
  'orange',
  'yellow',
  'gray',
  'brown',
  'green',
  'white',
  'black',
  'pink',
  'violet',
  'blue',
];

const CATCH_AVAILABLE_COLORS = [
  'black',
  'blue',
  'green',
  'orange',
  'red',
  'violet',
  'white',
  'yellow',
];

const ColorLevelForm = ({ gameType, subjectId, sectionId, levelIndex, onSuccess, onCancel, initialData, isEditMode = false, levelId }: Props) => {
  const [levelName, setLevelName] = useState(initialData?.levelName || '');
  const [levelTitle, setLevelTitle] = useState(initialData?.levelTitle || '');
  const [stages, setStages] = useState<ColorStageData[]>(initialData?.stages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current stage being edited
  const [currentStage, setCurrentStage] = useState<Partial<ColorStageData>>({});
  
  // Track which stage index is being edited (null means adding new stage)
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  
  // For matching game: track 4 color selections
  const [matchingColors, setMatchingColors] = useState<string[]>(['-', '-', '-', '-']);

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
      } as ColorStageData;
      
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
      setMatchingColors(['-', '-', '-', '-']);
      setError(null);
    } else {
      setError('Please fill in all required fields correctly');
    }
  };

  const handleEditStage = (index: number) => {
    const stage = stages[index];
    setCurrentStage(stage);
    setEditingStageIndex(index);
    if (stage.colors && stage.colors.length === 4) {
      setMatchingColors(stage.colors);
    }
  };

  const handleCancelEdit = () => {
    setCurrentStage({});
    setEditingStageIndex(null);
    setMatchingColors(['-', '-', '-', '-']);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const isStageValid = (stage: Partial<ColorStageData>): boolean => {
    switch (gameType) {
      case 'colorMultipleChoice':
      case 'catching':
        return !!(stage.correctColor);
      case 'rocket':
        return !!(stage.correctChoice);
      case 'matching':
        if (!stage.colors || stage.colors.length !== 4 || stage.colors.some(c => c === '-')) {
          return false;
        }
        // Check for duplicates
        const uniqueColors = new Set(stage.colors);
        return uniqueColors.size === stage.colors.length;
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

    // Get icon automatically based on game type
    const icon = colorGameTypeIcons[gameType];

    try {
      if (isEditMode && levelId) {
        const { updateLevel } = await import('../../services/firestore');
        await updateLevel(subjectId, sectionId, levelId, {
          name: levelName,
          title: levelTitle,
          icon,
          stages,
        });
      } else {
        await createLevel(subjectId, sectionId, {
          name: levelName,
          title: levelTitle,
          icon,
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
      case 'colorMultipleChoice':
        return (
          <div className="stage-form">
            <h4>Color Multiple Choice Configuration</h4>
            <div className="form-group">
              <label>Correct Color *</label>
              <select
                value={currentStage.correctColor || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctColor: e.target.value })}
              >
                <option value="">-- Select a color --</option>
                {AVAILABLE_COLORS.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'rocket':
        return (
          <div className="stage-form">
            <h4>Rocket Game Configuration</h4>
            <div className="form-group">
              <label>Correct Choice (Color) *</label>
              <select
                value={currentStage.correctChoice || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctChoice: e.target.value })}
              >
                <option value="">-- Select a color --</option>
                {AVAILABLE_COLORS.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="stage-form">
            <h4>Matching Game Configuration</h4>
            <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
              Select 4 colors to match in this stage
            </p>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="form-group">
                <label>Color {index + 1} *</label>
                <select
                  value={matchingColors[index]}
                  onChange={(e) => {
                    const newColors = [...matchingColors];
                    newColors[index] = e.target.value;
                    setMatchingColors(newColors);
                    
                    // Update currentStage with valid colors (excluding '-')
                    const validColors = newColors.filter(c => c !== '-');
                    setCurrentStage({ ...currentStage, colors: validColors });
                  }}
                >
                  <option value="-">-</option>
                  {AVAILABLE_COLORS.map(color => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {matchingColors.some(c => c === '-') && (
              <small style={{ color: 'red', display: 'block', marginTop: '0.5rem' }}>
                ⚠ All 4 colors must be selected
              </small>
            )}
            {(() => {
              const validColors = matchingColors.filter(c => c !== '-');
              const uniqueColors = new Set(validColors);
              return validColors.length > 0 && uniqueColors.size !== validColors.length;
            })() && (
              <small style={{ color: 'red', display: 'block', marginTop: '0.5rem' }}>
                ⚠ Each color must be unique (no duplicates allowed)
              </small>
            )}
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
              <label>Correct Color *</label>
              <select
                value={currentStage.correctColor || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctColor: e.target.value })}
              >
                <option value="">-- Select a color --</option>
                {CATCH_AVAILABLE_COLORS.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
              <small>The color to catch in the game</small>
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
      <p>Game Type: <strong>{gameType === 'colorMultipleChoice' ? 'Color Multiple Choice' : gameType.charAt(0).toUpperCase() + gameType.slice(1)}</strong></p>
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
            placeholder="e.g., Primary Colors"
          />
        </div>
        <div className="form-group">
          <label>Level Title *</label>
          <input
            type="text"
            value={levelTitle}
            onChange={(e) => setLevelTitle(e.target.value)}
            placeholder="e.g., Learn Primary Colors"
          />
        </div>
        <div className="form-group">
          <label>Icon (Auto-assigned)</label>
          <div style={{ padding: '0.75rem', backgroundColor: '#f0f0f0', borderRadius: '4px', color: '#666' }}>
            {colorGameTypeIcons[gameType].set}: {colorGameTypeIcons[gameType].name}
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
                  {stage.gameType && <span className="stage-type">{stage.gameType}</span>}
                  {stage.correctColor && <span>Color: {stage.correctColor}</span>}
                  {stage.correctChoice && <span>Choice: {stage.correctChoice}</span>}
                  {stage.colors && <span>Colors: {stage.colors.join(', ')}</span>}
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

export default ColorLevelForm;
