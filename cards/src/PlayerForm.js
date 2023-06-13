// PlayerForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PlayerForm = () => {
  const navigate = useNavigate();
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleStartGame = () => {
    const finalPlayer1Name = player1Name || 'Jugador 1';
    const finalPlayer2Name = player2Name || 'Jugador 2';

    navigate(`/game/${finalPlayer1Name}/${finalPlayer2Name}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleStartGame();
  };

  return (
    <div>
      <h2>Ingresa los nombres de los jugadores</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Jugador 1:
          <input
          placeholder='Nombre Jugador 1'
            type="text"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
          />
        </label>
        <br />
        <label>
          Jugador 2:
          <input
          placeholder='Nombre Jugador 2'
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Comenzar juego</button>
      </form>
    </div>
  );
};

export default PlayerForm;




