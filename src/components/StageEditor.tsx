import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStage, deleteGameFromStage } from '../services/firestore';
import type { GameData } from '../types';

function StageEditor() {
  const { subjectId, stageId } = useParams<{ subjectId: string; stageId: string }>();
  const navigate = useNavigate();
  const [stage, setStage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subjectId && stageId) {
      loadStage();
    }
  }, [subjectId, stageId]);

  const loadStage = async () => {
    try {
      setLoading(true);
      const data = await getStage(subjectId!, stageId!);
      setStage(data);
      setError('');
    } catch (err) {
      setError('Failed to load stage: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await deleteGameFromStage(subjectId!, stageId!, gameId);
      loadStage();
    } catch (err) {
      setError('Failed to delete game: ' + (err as Error).message);
    }
  };

  const handleEditGame = (gameId: string) => {
    navigate(`/subject/${subjectId}/stage/${stageId}/game/${gameId}`);
  };

  const handleAddGame = () => {
    navigate(`/subject/${subjectId}/stage/${stageId}/game`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!stage) return <div className="error">Stage not found</div>;

  const games = (stage.games || []) as GameData[];

  return (
    <div>
      <Link to={`/subject/${subjectId}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Stages
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>{stage.name}</h2>
          <p>Level {stage.level}</p>
        </div>
        <button 
          className="button button-primary"
          onClick={handleAddGame}
        >
          Add New Game
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div>
        {games.map((game, index) => (
          <div key={game.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3>Game #{index + 1}</h3>
                <p><strong>Type:</strong> {game.gameType}</p>
                {game.question && <p><strong>Question:</strong> {game.question}</p>}
                <p><strong>Correct Answer:</strong> {Array.isArray(game.correctAnswer) ? game.correctAnswer.join(', ') : game.correctAnswer}</p>
                <p><strong>Choices:</strong> {game.choices.length} options</p>
                {game.hint && <p><strong>Hint:</strong> {game.hint}</p>}
              </div>
              <div className="button-group">
                <button
                  className="button button-primary"
                  onClick={() => handleEditGame(game.id)}
                >
                  Edit
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleDeleteGame(game.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="card">
          <p>No games found. Click "Add New Game" to get started.</p>
        </div>
      )}
    </div>
  );
}

export default StageEditor;
