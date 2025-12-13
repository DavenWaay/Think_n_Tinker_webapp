import React, { useState } from 'react';
import { createLevel } from '../../services/firestore';
import type { AlphabetGameType, AlphabetStageData, SubjectType } from '../../types';
import './AlphabetLevelForm.css';

interface Props {
  gameType: AlphabetGameType;
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
    stages: AlphabetStageData[];
  };
  isEditMode?: boolean;
  levelId?: string;
}

const AlphabetLevelForm = ({ gameType, subjectId, sectionId, levelIndex, onSuccess, onCancel, initialData, isEditMode = false, levelId }: Props) => {
  const [levelName, setLevelName] = useState(initialData?.levelName || '');
  const [levelTitle, setLevelTitle] = useState(initialData?.levelTitle || '');
  const [iconSet, setIconSet] = useState(initialData?.iconSet || 'MaterialIcons');
  const [iconName, setIconName] = useState(initialData?.iconName || 'star');
  const [stages, setStages] = useState<AlphabetStageData[]>(initialData?.stages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current stage being edited
  const [currentStage, setCurrentStage] = useState<Partial<AlphabetStageData>>({});
  
  // Track which stage index is being edited (null means adding new stage)
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  
  // For mixed gameType: track the selected gameType for the current stage
  const [currentStageGameType, setCurrentStageGameType] = useState<AlphabetGameType>(gameType === 'mixed' ? 'phonics' : gameType);
  
  // Raw string inputs for comma-separated fields
  const [choicesInput, setChoicesInput] = useState('');
  const [pairsInput, setPairsInput] = useState('');
  const [strokeOrderInput, setStrokeOrderInput] = useState('');
  const [soundPairsInput, setSoundPairsInput] = useState('');
  const [isVowels, setIsVowels] = useState(false);

  const handleAddStage = () => {
    // For catching gameType, only allow one stage (unless editing)
    if (gameType === 'catching' && stages.length >= 1 && editingStageIndex === null) {
      setError('Catching game type only allows one stage');
      return;
    }

    if (isStageValid(currentStage)) {
      // Add gameType to the stage before saving
      const stageWithGameType = {
        ...currentStage,
        gameType: gameType === 'mixed' ? currentStageGameType : gameType
      } as AlphabetStageData;
      
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
      setPairsInput('');
      setStrokeOrderInput('');
      setSoundPairsInput('');
      setIsVowels(false);
      // Reset to default gameType for next stage in mixed mode
      if (gameType === 'mixed') {
        setCurrentStageGameType('phonics');
      }
      setError(null);
    } else {
      setError('Please fill in all required fields for the stage');
    }
  };

  const handleEditStage = (index: number) => {
    const stage = stages[index];
    setCurrentStage(stage);
    setEditingStageIndex(index);
    
    // Set the gameType for mixed levels
    if (gameType === 'mixed' && stage.gameType) {
      setCurrentStageGameType(stage.gameType);
    }
    
    // Populate input fields based on stage data
    if (stage.choices) setChoicesInput(stage.choices.join(', '));
    if (stage.pairs) setPairsInput(stage.pairs.join(', '));
    if (stage.strokeOrder) setStrokeOrderInput(stage.strokeOrder.join(', '));
    if (stage.soundPairs) setSoundPairsInput(stage.soundPairs.map(p => p.letter).join(', '));
  };

  const handleCancelEdit = () => {
    setCurrentStage({});
    setEditingStageIndex(null);
    setChoicesInput('');
    setPairsInput('');
    setStrokeOrderInput('');
    setSoundPairsInput('');
    setIsVowels(false);
    if (gameType === 'mixed') {
      setCurrentStageGameType('phonics');
    }
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const isStageValid = (stage: Partial<AlphabetStageData>): boolean => {
    // For mixed gameType, validate based on the selected currentStageGameType
    const typeToCheck = gameType === 'mixed' ? currentStageGameType : gameType;
    
    switch (typeToCheck) {
      case 'phonics':
      case 'image':
        return !!(stage.correctLetter && stage.choices && stage.choices.length >= 2);
      case 'catching':
        return !!((stage.correctLetter && stage.choices) || (stage.correctLetters && stage.correctLetters.length > 0));
      case 'tracing':
        return !!(stage.letter && stage.strokeOrder && stage.strokeOrder.length > 0);
      case 'cards':
        return !!(stage.cardPairs && stage.cardPairs.length === 3);
      case 'sound':
        return !!(stage.soundPairs && stage.soundPairs.length >= 2);
      case 'matching':
        return !!(stage.cardPairs && stage.cardPairs.length >= 2);
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
        // Use updateLevel for edit mode
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
        // Use createLevel for create mode
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
      case 'mixed':
        return (
          <div className="stage-form">
            <h4>Stage Configuration</h4>
            <div className="form-group">
              <label>Stage Game Type *</label>
              <select 
                value={currentStageGameType} 
                onChange={(e) => {
                  setCurrentStageGameType(e.target.value as AlphabetGameType);
                  // Reset current stage when switching game type
                  setCurrentStage({});
                  setPairsInput('');
                  setSoundPairsInput('');
                  setChoicesInput('');
                  setIsVowels(false);
                }}
              >
                <option value="phonics">Phonics</option>
                <option value="image">Image</option>
                <option value="cards">Cards</option>
                <option value="sound">Sound</option>
              </select>
            </div>
            
            {/* Dynamically render form based on selected gameType */}
            {currentStageGameType === 'phonics' || currentStageGameType === 'image' ? (
              <>
                <div className="form-group">
                  <label>Correct Letter *</label>
                  <input
                    type="text"
                    maxLength={1}
                    value={currentStage.correctLetter || ''}
                    onChange={(e) => setCurrentStage({ ...currentStage, correctLetter: e.target.value.toUpperCase() })}
                    placeholder="A"
                  />
                </div>
                <div className="form-group">
                  <label>Choices (comma-separated) *</label>
                  <input
                    type="text"
                    value={choicesInput}
                    onChange={(e) => {
                      const input = e.target.value;
                      setChoicesInput(input);
                      const choices = input.split(',').map(c => c.trim().toUpperCase()).filter(c => c);
                      setCurrentStage({ ...currentStage, choices });
                    }}
                    placeholder="A,B,C,D"
                  />
                  <small>Include the correct letter in choices</small>
                </div>
              </>
            ) : currentStageGameType === 'cards' ? (
              <div className="form-group">
                <label>Card Pairs (3 letters, comma-separated) *</label>
                <input
                  type="text"
                  value={pairsInput}
                  onChange={(e) => {
                    const input = e.target.value;
                    setPairsInput(input);
                    const letters = input.split(',').map(p => p.trim().toUpperCase()).filter(p => p);
                    const cardPairs = letters.map(letter => ({ letter }));
                    setCurrentStage({ ...currentStage, cardPairs });
                  }}
                  placeholder="A,B,C"
                />
                <small>Enter exactly 3 letters. Each will appear as a card pair in the memory game.</small>
                {pairsInput && currentStage.cardPairs && currentStage.cardPairs.length !== 3 && (
                  <small style={{ color: 'red', display: 'block', marginTop: '4px' }}>
                    ⚠ Please enter exactly 3 letters
                  </small>
                )}
              </div>
            ) : currentStageGameType === 'sound' ? (
              <>
                <div className="form-group">
                  <label>Sound Pairs</label>
                  <small>Add letters (max 5). Sound ID will be auto-generated as "sound_[letter]"</small>
                </div>
                <div className="sound-pairs-list">
                  {currentStage.soundPairs?.map((pair, idx) => (
                    <div key={idx} className="sound-pair-item">
                      <span>{pair.letter} - {pair.soundId}</span>
                      <button 
                        onClick={() => {
                          const newPairs = [...(currentStage.soundPairs || [])];
                          newPairs.splice(idx, 1);
                          setCurrentStage({ ...currentStage, soundPairs: newPairs });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {(!currentStage.soundPairs || currentStage.soundPairs.length < 5) && (
                  <div className="add-sound-pair">
                    <input
                      type="text"
                      maxLength={1}
                      placeholder="Letter"
                      id="newSoundLetterMixed"
                    />
                    <button
                      onClick={() => {
                        const letter = (document.getElementById('newSoundLetterMixed') as HTMLInputElement)?.value.toUpperCase();
                        if (letter && /^[A-Z]$/.test(letter)) {
                          const soundId = `sound_${letter}`;
                          const newPairs = [...(currentStage.soundPairs || []), { letter, soundId }];
                          setCurrentStage({ ...currentStage, soundPairs: newPairs });
                          (document.getElementById('newSoundLetterMixed') as HTMLInputElement).value = '';
                        }
                      }}
                    >
                      Add Letter
                    </button>
                  </div>
                )}
                {currentStage.soundPairs && currentStage.soundPairs.length >= 5 && (
                  <small style={{ color: '#27ae60', display: 'block', marginTop: '0.5rem' }}>
                    ✓ Maximum of 5 pairs reached
                  </small>
                )}
              </>
            ) : null}
          </div>
        );

      case 'phonics':
      case 'image':
        return (
          <div className="stage-form">
            <h4>Stage Configuration</h4>
            <div className="form-group">
              <label>Correct Letter *</label>
              <input
                type="text"
                maxLength={1}
                value={currentStage.correctLetter || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctLetter: e.target.value.toUpperCase() })}
                placeholder="A"
              />
            </div>
            <div className="form-group">
              <label>Choices (comma-separated) *</label>
              <input
                type="text"
                value={choicesInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setChoicesInput(input);
                  const choices = input.split(',').map(c => c.trim().toUpperCase()).filter(c => c);
                  setCurrentStage({ ...currentStage, choices });
                }}
                placeholder="A,B,C,D"
              />
              <small>Include the correct letter in choices</small>
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
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isVowels}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsVowels(checked);
                      if (checked) {
                        setCurrentStage({
                          correctLetter: 'vowels',
                          correctLetters: ['A', 'E', 'I', 'O', 'U'],
                          choices: ['A', 'E', 'I', 'O', 'U']
                        });
                      } else {
                        setCurrentStage({});
                        }
                      }}
                      style={{ margin: 0 }}
                    />
                  </div>
                  <span style={{ width: '80%', userSelect: 'none' }}>Catch Vowels (A, E, I, O, U)</span>
              </label>
            </div>
            {!isVowels && (
              <div className="form-group">
                <label>Target Letter to Catch *</label>
                <input
                  type="text"
                  maxLength={1}
                  value={currentStage.correctLetter || ''}
                  onChange={(e) => {
                    const letter = e.target.value.toUpperCase();
                    setCurrentStage({ 
                      ...currentStage, 
                      correctLetter: letter,
                      choices: letter ? [letter] : []
                    });
                  }}
                  placeholder="A"
                />
                <small>Distractors will be automatically rendered by the game</small>
              </div>
            )}
          </div>
        );

      case 'tracing':
        return (
          <div className="stage-form">
            <h4>Tracing Game Configuration</h4>
            <div className="form-group">
              <label>Letter to Trace *</label>
              <input
                type="text"
                maxLength={1}
                value={currentStage.letter || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, letter: e.target.value.toUpperCase() })}
                placeholder="A"
              />
            </div>
            <div className="form-group">
              <label>Stroke Order (comma-separated paths) *</label>
              <input
                type="text"
                value={strokeOrderInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setStrokeOrderInput(input);
                  const strokeOrder = input.split(',').map(s => s.trim()).filter(s => s);
                  setCurrentStage({ ...currentStage, strokeOrder });
                }}
                placeholder="path1,path2,path3"
              />
              <small>SVG path data or stroke identifiers</small>
            </div>
          </div>
        );

      case 'cards':
        return (
          <div className="stage-form">
            <h4>Memory Card Game Configuration</h4>
            <div className="form-group">
              <label>Card Pairs (3 letters, comma-separated) *</label>
              <input
                type="text"
                value={pairsInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setPairsInput(input);
                  // Parse comma-separated letters and convert to cardPairs array
                  const letters = input.split(',').map(p => p.trim().toUpperCase()).filter(p => p);
                  const cardPairs = letters.map(letter => ({ letter }));
                  setCurrentStage({ ...currentStage, cardPairs });
                }}
                placeholder="A,B,C"
              />
              <small>Enter exactly 3 letters. Each will appear as a card pair in the memory game.</small>
              {pairsInput && currentStage.cardPairs && currentStage.cardPairs.length !== 3 && (
                <small style={{ color: 'red', display: 'block', marginTop: '4px' }}>
                  ⚠ Please enter exactly 3 letters
                </small>
              )}
            </div>
          </div>
        );

      case 'sound':
        return (
          <div className="stage-form">
            <h4>Sound Matching Game Configuration</h4>
            <div className="form-group">
              <label>Sound Pairs</label>
              <small>Add letters (max 5). Sound ID will be auto-generated as "sound_[letter]"</small>
            </div>
            <div className="sound-pairs-list">
              {currentStage.soundPairs?.map((pair, idx) => (
                <div key={idx} className="sound-pair-item">
                  <span>{pair.letter} - {pair.soundId}</span>
                  <button 
                    onClick={() => {
                      const newPairs = [...(currentStage.soundPairs || [])];
                      newPairs.splice(idx, 1);
                      setCurrentStage({ ...currentStage, soundPairs: newPairs });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {(!currentStage.soundPairs || currentStage.soundPairs.length < 5) && (
              <div className="add-sound-pair">
                <input
                  type="text"
                  maxLength={1}
                  placeholder="Letter"
                  id="newSoundLetter"
                />
                <button
                  onClick={() => {
                    const letter = (document.getElementById('newSoundLetter') as HTMLInputElement)?.value.toUpperCase();
                    if (letter && /^[A-Z]$/.test(letter)) {
                      const soundId = `sound_${letter}`;
                      const newPairs = [...(currentStage.soundPairs || []), { letter, soundId }];
                      setCurrentStage({ ...currentStage, soundPairs: newPairs });
                      (document.getElementById('newSoundLetter') as HTMLInputElement).value = '';
                    }
                  }}
                >
                  Add Letter
                </button>
              </div>
            )}
            {currentStage.soundPairs && currentStage.soundPairs.length >= 5 && (
              <small style={{ color: '#27ae60', display: 'block', marginTop: '0.5rem' }}>
                ✓ Maximum of 5 pairs reached
              </small>
            )}
          </div>
        );

      case 'mixed':
        return (
          <div className="stage-form">
            <h4>Mixed Game Configuration</h4>
            <p>Mixed games combine multiple game types. Configure basic stage data:</p>
            <div className="form-group">
              <label>Correct Letter (optional)</label>
              <input
                type="text"
                maxLength={1}
                value={currentStage.correctLetter || ''}
                onChange={(e) => setCurrentStage({ ...currentStage, correctLetter: e.target.value.toUpperCase() })}
                placeholder="A"
              />
            </div>
            <div className="form-group">
              <label>Choices (optional, comma-separated)</label>
              <input
                type="text"
                value={choicesInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setChoicesInput(input);
                  const choices = input.split(',').map(c => c.trim().toUpperCase()).filter(c => c);
                  setCurrentStage({ ...currentStage, choices });
                }}
                placeholder="A,B,C,D"
              />
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
      <p>Game Type: <strong>{gameType}</strong></p>
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
            placeholder="e.g., Letters A-E"
          />
        </div>
        <div className="form-group">
          <label>Level Title *</label>
          <input
            type="text"
            value={levelTitle}
            onChange={(e) => setLevelTitle(e.target.value)}
            placeholder="e.g., Learn Letters A to E"
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

      <div className="stages-section">
        <h3>Stages</h3>
        
        {stages.length > 0 && (
          <div className="stages-list">
            {stages.map((stage, index) => (
              <React.Fragment key={index}>
                <div className="stage-item">
                  <div className="stage-info">
                    <strong>Stage {index + 1}</strong>
                    <span>{stage.correctLetter || stage.letter || 'Configured'}</span>
                  </div>
                  <div className="stage-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditStage(index)}
                      disabled={editingStageIndex === index}
                    >
                      {editingStageIndex === index ? 'Editing...' : 'Edit'}
                    </button>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveStage(index)}
                    >
                      Remove
                    </button>
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
                      className="btn btn-secondary"
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

        {editingStageIndex === null && (
          <>
            {renderStageForm()}
            <button 
              className="btn btn-secondary"
              onClick={handleAddStage}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              ✓ Confirm & Add Stage
            </button>
          </>
        )}
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleSaveLevel}
          disabled={loading || stages.length === 0}
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update Level' : 'Create Level')}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => {
            // Clear all stage-related fields and reset to default
            setCurrentStage({});
            setChoicesInput('');
            setPairsInput('');
            setStrokeOrderInput('');
            setIsVowels(false);
            setError(null);
          }}
          disabled={loading}
        >
          Clear Stage Form
        </button>
      </div>
    </div>
  );
};

export default AlphabetLevelForm;
