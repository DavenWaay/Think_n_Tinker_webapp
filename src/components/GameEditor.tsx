import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStage, addGameToStage, updateGameInStage } from '../services/firestore';
import type { GameData, GameType, Choice } from '../types';

function GameEditor() {
  const { subjectId, stageId, gameId } = useParams<{ subjectId: string; stageId: string; gameId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [gameData, setGameData] = useState<GameData>({
    id: '',
    gameType: 'image',
    correctAnswer: '',
    choices: [],
    question: '',
    hint: '',
    difficulty: 1
  });

  useEffect(() => {
    if (gameId && subjectId && stageId) {
      loadGame();
    }
  }, [gameId, subjectId, stageId]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const stage = await getStage(subjectId!, stageId!) as any;
      const games = (stage?.games || []) as GameData[];
      const game = games.find(g => g.id === gameId);
      if (game) {
        setGameData(game);
      }
    } catch (err) {
      setError('Failed to load game: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!gameData.id) {
      setError('Game ID is required');
      return;
    }

    try {
      setLoading(true);
      if (gameId) {
        await updateGameInStage(subjectId!, stageId!, gameId, gameData);
        setSuccess('Game updated successfully!');
      } else {
        await addGameToStage(subjectId!, stageId!, gameData);
        setSuccess('Game added successfully!');
        setTimeout(() => {
          navigate(`/subject/${subjectId}/stage/${stageId}`);
        }, 1000);
      }
    } catch (err) {
      setError('Failed to save game: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChoice = () => {
    setGameData({
      ...gameData,
      choices: [...gameData.choices, { id: `choice_${Date.now()}`, value: '' }]
    });
  };

  const handleUpdateChoice = (index: number, field: keyof Choice, value: string) => {
    const newChoices = [...gameData.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setGameData({ ...gameData, choices: newChoices });
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = gameData.choices.filter((_, i) => i !== index);
    setGameData({ ...gameData, choices: newChoices });
  };

  const gameTypes: GameType[] = ['image', 'audio', 'match', 'trace', 'quiz', 'sequence'];

  if (loading && gameId) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Link to={`/subject/${subjectId}/stage/${stageId}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Games
      </Link>
      
      <div className="card">
        <h2>{gameId ? 'Edit Game' : 'Add New Game'}</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Game ID *</label>
            <input
              type="text"
              value={gameData.id}
              onChange={(e) => setGameData({ ...gameData, id: e.target.value })}
              required
              disabled={!!gameId}
              placeholder="game_1"
            />
          </div>

          <div className="form-group">
            <label>Game Type *</label>
            <select
              value={gameData.gameType}
              onChange={(e) => setGameData({ ...gameData, gameType: e.target.value as GameType })}
              required
            >
              {gameTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={gameData.question || ''}
              onChange={(e) => setGameData({ ...gameData, question: e.target.value })}
              placeholder="What letter is this?"
            />
          </div>

          <div className="form-group">
            <label>Correct Answer *</label>
            <input
              type="text"
              value={Array.isArray(gameData.correctAnswer) ? gameData.correctAnswer.join(',') : gameData.correctAnswer}
              onChange={(e) => setGameData({ 
                ...gameData, 
                correctAnswer: e.target.value.includes(',') ? e.target.value.split(',') : e.target.value 
              })}
              required
              placeholder="A (or A,B,C for multiple)"
            />
            <small>For multiple answers, separate with commas</small>
          </div>

          <div className="form-group">
            <label>Image Path</label>
            <input
              type="text"
              value={gameData.image || ''}
              onChange={(e) => setGameData({ ...gameData, image: e.target.value })}
              placeholder="assets/images/letter_a.png"
            />
          </div>

          <div className="form-group">
            <label>Audio Path</label>
            <input
              type="text"
              value={gameData.audio || ''}
              onChange={(e) => setGameData({ ...gameData, audio: e.target.value })}
              placeholder="assets/audio/letter_a.mp3"
            />
          </div>

          <div className="form-group">
            <label>Hint</label>
            <input
              type="text"
              value={gameData.hint || ''}
              onChange={(e) => setGameData({ ...gameData, hint: e.target.value })}
              placeholder="Starts with 'Ay' sound"
            />
          </div>

          <div className="form-group">
            <label>Difficulty (1-5)</label>
            <input
              type="number"
              value={gameData.difficulty || 1}
              onChange={(e) => setGameData({ ...gameData, difficulty: parseInt(e.target.value) })}
              min="1"
              max="5"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ marginBottom: 0 }}>Choices</label>
              <button 
                type="button"
                className="button button-secondary"
                onClick={handleAddChoice}
              >
                Add Choice
              </button>
            </div>

            {gameData.choices.map((choice, index) => (
              <div key={choice.id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                borderRadius: '4px', 
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <strong>Choice {index + 1}</strong>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => handleRemoveChoice(index)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem' }}>Value *</label>
                    <input
                      type="text"
                      value={choice.value}
                      onChange={(e) => handleUpdateChoice(index, 'value', e.target.value)}
                      required
                      placeholder="A"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem' }}>Image Path</label>
                    <input
                      type="text"
                      value={choice.image || ''}
                      onChange={(e) => handleUpdateChoice(index, 'image', e.target.value)}
                      placeholder="assets/images/letter_a.png"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem' }}>Audio Path</label>
                    <input
                      type="text"
                      value={choice.audio || ''}
                      onChange={(e) => handleUpdateChoice(index, 'audio', e.target.value)}
                      placeholder="assets/audio/letter_a.mp3"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem' }}>Color</label>
                    <input
                      type="text"
                      value={choice.color || ''}
                      onChange={(e) => handleUpdateChoice(index, 'color', e.target.value)}
                      placeholder="#FF5733"
                    />
                  </div>
                </div>
              </div>
            ))}

            {gameData.choices.length === 0 && (
              <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                No choices added yet. Click "Add Choice" to add options.
              </p>
            )}
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              className="button button-success"
              disabled={loading}
            >
              {loading ? 'Saving...' : (gameId ? 'Update Game' : 'Create Game')}
            </button>
            <button 
              type="button"
              className="button button-secondary"
              onClick={() => navigate(`/subject/${subjectId}/stage/${stageId}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GameEditor;
