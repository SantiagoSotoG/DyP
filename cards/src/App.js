// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlayerForm from './PlayerForm';
import Game from './Game';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerForm />} />
        <Route path="/game/:player1Name/:player2Name" element={<Game />} />
      </Routes>
    </Router>
  );
};

export default App;



