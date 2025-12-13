import { useState } from 'react';
import { createLevel } from '../../services/firestore';
import type { ShapeGameType, ShapeStageData, SubjectType } from '../../types';
import './AlphabetLevelForm.css';

interface Props {
  gameType: ShapeGameType;
  subjectId: SubjectType;
  sectionId: string;
  levelIndex: number;
  onSuccess: () => void;
  onCancel: () => void;
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

const ShapeLevelForm = ({ gameType, subjectId, sectionId, levelIndex, onSuccess, onCancel }: Props) => {
  const [levelName, setLevelName] = useState('');
  const [levelTitle, setLevelTitle] = useState('');
  const [iconSet, setIconSet] = useState('MaterialIcons');
  const [iconName, setIconName] = useState('change-history');
  const [stages, setStages] = useState<ShapeStageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current stage being edited
  const [currentStage, setCurrentStage] = useState<Partial<ShapeStageData>>({});

  const handleAddStage = () => {
    // For catching gameType, only allow one stage
    if (gameType === 'catching' && stages.length >= 1) {
      setError('Catching game type only allows one stage');
      return;
    }

    if (isStageValid(currentStage)) {
      // Add gameType to the stage before saving
      const stageWithGameType = {
        ...currentStage,
        gameType: gameType
      } as ShapeStageData;
      
      setStages([...stages, stageWithGameType]);
      setCurrentStage({});
      setError(null);
    } else {
      setError('Please fill in all required fields correctly');
    }
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

    try {
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
      onSuccess();
    } catch (err) {
      setError('Failed to create level');
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
        <div className="form-row">
          <div className="form-group">
            <label>Icon Set</label>
            <select value={iconSet} onChange={(e) => setIconSet(e.target.value)}>
              <option value="MaterialIcons">MaterialIcons</option>
              <option value="FontAwesome5">FontAwesome5</option>
              <option value="Ionicons">Ionicons</option>
              <option value="MaterialCommunityIcons">MaterialCommunityIcons</option>
            </select>
          </div>
          <div className="form-group">
            <label>Icon Name</label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="change-history"
            />
          </div>
        </div>
      </div>

      {stages.length > 0 && (
        <div className="stages-list" style={{ margin: '2rem 0' }}>
          <h3>Configured Stages ({stages.length})</h3>
          {stages.map((stage, index) => (
            <div key={index} className="stage-item">
              <div className="stage-details" style={{ color: '#2c3e50' }}>
                <strong>Stage {index + 1}</strong>
                {stage.gameType && <span className="stage-type">{stage.gameType}</span>}
                {stage.correctShape && <span>Shape: {stage.correctShape}</span>}
              </div>
              <button onClick={() => handleRemoveStage(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <div className="stages-section">
        <h3>Stages</h3>
        {renderStageForm()}
        <button 
          className="btn-secondary" 
          onClick={handleAddStage}
          disabled={gameType === 'catching' && stages.length >= 1}
        >
          ✓ Confirm & Add Stage
        </button>
      </div>

      <div className="form-actions">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={handleSaveLevel} disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Create Level'}
        </button>
      </div>
    </div>
  );
};

export default ShapeLevelForm;
