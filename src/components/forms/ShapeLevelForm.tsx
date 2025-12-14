import React, { useState } from 'react';
import { createLevel } from '../../services/firestore';
import type { ShapeGameType, ShapeStageData, SubjectType } from '../../types';
import { shapeGameTypeIcons } from '../../utils/gameTypeIcons';
import './AlphabetLevelForm.css';

interface Props {
  gameType: ShapeGameType;
  subjectId: SubjectType;
  sectionId: string;
  levelIndex: number;
  onSuccess: () => void;
  onCancel: () => void;
  // Optional: for edit mode
  initialData?: {
    levelName: string;
    levelTitle: string;
    stages: ShapeStageData[];
  };
  isEditMode?: boolean;
  levelId?: string;
}

// Shapes available in shapesLibrary (for shapesMultipleChoice and rocketShapes)
const SHAPES_LIBRARY = [
  'circle',
  'square',
  'triangle',
  'star',
  'heart',
  'diamond',
  'rectangle',
  'oval',
  'crescent',
];

// Shapes available in CatchShapes (for catching and racing)
const CATCH_SHAPES = [
  'circle',
  'crescent',
  'heart',
  'oval',
  'rectangle',
  'rhombus',
  'square',
  'star',
  'triangle',
];

const ShapeLevelForm = ({ gameType, subjectId, sectionId, levelIndex, onSuccess, onCancel, initialData, isEditMode = false, levelId }: Props) => {
  const [levelName, setLevelName] = useState(initialData?.levelName || '');
  const [levelTitle, setLevelTitle] = useState(initialData?.levelTitle || '');
  const [stages, setStages] = useState<ShapeStageData[]>(initialData?.stages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current stage being edited
  const [currentStage, setCurrentStage] = useState<Partial<ShapeStageData>>({});
  
  // Track which stage index is being edited (null means adding new stage)
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);

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
      } as ShapeStageData;
      
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
      setError(null);
    } else {
      setError('Please fill in all required fields correctly');
    }
  };

  const handleEditStage = (index: number) => {
    const stage = stages[index];
    setCurrentStage(stage);
    setEditingStageIndex(index);
  };

  const handleCancelEdit = () => {
    setCurrentStage({});
    setEditingStageIndex(null);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const isStageValid = (stage: Partial<ShapeStageData>): boolean => {
    switch (gameType) {
      case 'shapesMultipleChoice':
      case 'rocketShapes':
      case 'catching':
      case 'racing':
        return !!(stage.correctShape);
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
    const icon = shapeGameTypeIcons[gameType];

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

  const getShapeOptions = () => {
    // Use CATCH_SHAPES for catching and racing, SHAPES_LIBRARY for others
    if (gameType === 'catching' || gameType === 'racing') {
      return CATCH_SHAPES;
    }
    return SHAPES_LIBRARY;
  };

  const renderStageForm = () => {
    const shapeOptions = getShapeOptions();

    switch (gameType) {
      case 'shapesMultipleChoice':
        return (
          <div className="stage-form">
            <h4>Shape Multiple Choice Configuration</h4>
            <div className="form-group">
              <label>Correct Shape *</label>
              <select
                value={currentStage.correctShape || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctShape: e.target.value })}
              >
                <option value="">-- Select a shape --</option>
                {shapeOptions.map(shape => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'rocketShapes':
        return (
          <div className="stage-form">
            <h4>Rocket Shapes Configuration</h4>
            <div className="form-group">
              <label>Correct Choice (Shape) *</label>
              <select
                value={currentStage.correctShape || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctShape: e.target.value })}
              >
                <option value="">-- Select a shape --</option>
                {shapeOptions.map(shape => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))}
              </select>
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
              <label>Correct Shape *</label>
              <select
                value={currentStage.correctShape || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctShape: e.target.value })}
              >
                <option value="">-- Select a shape --</option>
                {shapeOptions.map(shape => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))}
              </select>
              <small>The shape to catch in the game</small>
            </div>
          </div>
        );

      case 'racing':
        return (
          <div className="stage-form">
            <h4>Racing Game Configuration</h4>
            <div className="form-group">
              <label>Correct Shape *</label>
              <select
                value={currentStage.correctShape || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctShape: e.target.value })}
              >
                <option value="">-- Select a shape --</option>
                {shapeOptions.map(shape => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))}
              </select>
              <small>The shape to match in the racing game</small>
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
      <p>Game Type: <strong>{gameType === 'shapesMultipleChoice' ? 'Shapes Multiple Choice' : gameType === 'rocketShapes' ? 'Rocket Shapes' : gameType.charAt(0).toUpperCase() + gameType.slice(1)}</strong></p>
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
            placeholder="e.g., Basic Shapes"
          />
        </div>
        <div className="form-group">
          <label>Level Title *</label>
          <input
            type="text"
            value={levelTitle}
            onChange={(e) => setLevelTitle(e.target.value)}
            placeholder="e.g., Learn Basic Shapes"
          />
        </div>
        <div className="form-group">
          <label>Icon (Auto-assigned)</label>
          <div style={{ padding: '0.75rem', backgroundColor: '#f0f0f0', borderRadius: '4px', color: '#666' }}>
            {shapeGameTypeIcons[gameType].set}: {shapeGameTypeIcons[gameType].name}
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
                  {stage.correctShape && <span>Shape: {stage.correctShape}</span>}
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

export default ShapeLevelForm;
