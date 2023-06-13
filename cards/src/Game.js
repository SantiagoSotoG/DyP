import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Game.css'; // Importa el archivo CSS para estilos adicionales

const Game = () => {
  const { player1Name, player2Name } = useParams();
  const navigate = useNavigate();
  const [player1DeckId, setPlayer1DeckId] = useState('');
  const [player2DeckId, setPlayer2DeckId] = useState('');
  const [player1Cards, setPlayer1Cards] = useState([]);
  const [player2Cards, setPlayer2Cards] = useState([]);
  const [player1Sets, setPlayer1Sets] = useState([]);
  const [player2Sets, setPlayer2Sets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const player1DeckResponse = await axios.get(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        );
        const player2DeckResponse = await axios.get(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        );
        const player1DrawResponse = await axios.get(
          `https://deckofcardsapi.com/api/deck/${player1DeckResponse.data.deck_id}/draw/?count=10`
        );
        const player2DrawResponse = await axios.get(
          `https://deckofcardsapi.com/api/deck/${player2DeckResponse.data.deck_id}/draw/?count=10`
        );

        setPlayer1DeckId(player1DeckResponse.data.deck_id);
        setPlayer2DeckId(player2DeckResponse.data.deck_id);
        setPlayer1Cards(player1DrawResponse.data.cards);
        setPlayer2Cards(player2DrawResponse.data.cards);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const organizeSets = (cards, setFunc) => {
      const sets = [];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];
      const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];

      const cardsWithInfo = cards.map((card) => {
        const valueIndex = values.indexOf(card.value);
        const suitIndex = suits.indexOf(card.suit);
        return {
          ...card,
          valueIndex,
          suitIndex
        };
      });

      const sortedCards = [...cardsWithInfo].sort((a, b) => {
        return a.valueIndex - b.valueIndex;
      });

      const setsBySuit = suits.map(() => []);
      let currentSet = [];

      sortedCards.forEach((card) => {
        if (currentSet.length === 0) {
          currentSet.push(card);
        } else {
          const prevCard = currentSet[currentSet.length - 1];

          if (prevCard.valueIndex === card.valueIndex - 1 && prevCard.suitIndex === card.suitIndex) {
            currentSet.push(card);
          } else {
            setsBySuit[prevCard.suitIndex].push(currentSet);
            currentSet = [card];
          }
        }
      });

      if (currentSet.length > 0) {
        setsBySuit[currentSet[0].suitIndex].push(currentSet);
      }

      setsBySuit.forEach((setsInSuit) => {
        setsInSuit.forEach((set) => {
          if (set.length >= 2) {
            sets.push(set);
          }
        });
      });

      sortedCards.forEach((card) => {
        if (!sets.some((set) => set.includes(card))) {
          sets.push([card]);
        }
      });

      setFunc(sets);
    };

    organizeSets(player1Cards, setPlayer1Sets);
    organizeSets(player2Cards, setPlayer2Sets);
  }, [player1Cards, player2Cards]);

  const handleDrawCard = async () => {
    try {
      const response = await axios.get(`https://deckofcardsapi.com/api/deck/${player1DeckId}/draw/?count=1`);
      const newCard = response.data.cards[0];
        console.log(newCard);
      const updatedPlayer1Cards = [...player1Cards, newCard];
  
      // Check if the new card can be used to form a set or straight
      const canFormSet = analyzeAndDiscard(updatedPlayer1Cards);
      if (canFormSet) {
        // If the new card can form a set, discard a useless card
        const discardedCardIndex = updatedPlayer1Cards.findIndex((card) => card.code === canFormSet);
        if (discardedCardIndex !== -1) {
          updatedPlayer1Cards.splice(discardedCardIndex, 1);
        }
      } else {
        // If the new card cannot form a set, remove the new card
        updatedPlayer1Cards.pop();
      }
  
      setPlayer1Cards(updatedPlayer1Cards);
      organizeSets(updatedPlayer1Cards, setPlayer1Sets);
      // Discard the card if it was removed from the hand
      if (canFormSet) {
        const discardResponse = await axios.get(
          `https://deckofcardsapi.com/api/deck/${player1DeckId}/pile/discard/add/?cards=${canFormSet}`
        );
        console.log(discardResponse.data);
      }


    } catch (error) {
      console.log(error);
    }



    try {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${player2DeckId}/draw/?count=1`);
      const newCard = response.data.cards[0];
      console.log(newCard);
      const updatedPlayer2Cards = [...player2Cards, newCard];
  
      // Check if the new card can be used to form a set or straight
      const canFormSet = analyzeAndDiscard(updatedPlayer2Cards);
      if (canFormSet) {
        // If the new card can form a set, discard a useless card
        const discardedCardIndex = updatedPlayer2Cards.findIndex((card) => card.code === canFormSet);
        if (discardedCardIndex !== -1) {
          updatedPlayer2Cards.splice(discardedCardIndex, 1);
        }
      } else {
        // If the new card cannot form a set, remove the new card
        updatedPlayer2Cards.pop();
      }
  
      setPlayer2Cards(updatedPlayer2Cards);
      organizeSets(updatedPlayer2Cards, setPlayer2Sets);
      // Discard the card if it was removed from the hand
      if (canFormSet) {
        const discardResponse = await axios.get(
          `https://deckofcardsapi.com/api/deck/${player2DeckId}/pile/discard/add/?cards=${canFormSet}`
        );
        console.log(discardResponse.data);
      }
        
        
    } catch (error) {
        console.log(error);
    }
  };


  
  
  

  const analyzeAndDiscard = (cards) => {
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];
  
    for (let i = 0; i < cards.length; i++) {
      let currentCard = cards[i];
  
      // Check for sets of the same value
      const sameValueSet = cards.filter((card) => card.value === currentCard.value);
      if (sameValueSet.length >= 3) {
        const discardedCard = sameValueSet[0];
        return discardedCard.code;
      }
  
      // Check for straight of the same suit
      const sameSuitStraight = [];
      sameSuitStraight.push(currentCard);
  
      for (let j = i + 1; j < cards.length; j++) {
        const nextCard = cards[j];
  
        if (nextCard.suit === currentCard.suit && values.indexOf(nextCard.value) === values.indexOf(currentCard.value) + 1) {
          sameSuitStraight.push(nextCard);
          currentCard = nextCard;
        } else {
          break;
        }
      }
  
      if (sameSuitStraight.length >= 3) {
        const discardedCard = sameSuitStraight[0];
        return discardedCard.code;
      }
    }
  
    return null;
  };
  

  const handleFinishGame = () => {
    navigate('/');
  };

  const organizeSets = (cards, setFunc) => {
    const sets = [];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];
    const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];

    const cardsWithInfo = cards.map((card) => {
      const valueIndex = values.indexOf(card.value);
      const suitIndex = suits.indexOf(card.suit);
      return {
        ...card,
        valueIndex,
        suitIndex
      };
    });

    const sortedCards = [...cardsWithInfo].sort((a, b) => {
      return a.valueIndex - b.valueIndex;
    });

    const setsBySuit = suits.map(() => []);
    let currentSet = [];

    sortedCards.forEach((card) => {
      if (currentSet.length === 0) {
        currentSet.push(card);
      } else {
        const prevCard = currentSet[currentSet.length - 1];

        if (prevCard.valueIndex === card.valueIndex - 1 && prevCard.suitIndex === card.suitIndex) {
          currentSet.push(card);
        } else {
          setsBySuit[prevCard.suitIndex].push(currentSet);
          currentSet = [card];
        }
      }
    });

    if (currentSet.length > 0) {
      setsBySuit[currentSet[0].suitIndex].push(currentSet);
    }

    setsBySuit.forEach((setsInSuit) => {
      setsInSuit.forEach((set) => {
        if (set.length >= 2) {
          sets.push(set);
        }
      });
    });

    sortedCards.forEach((card) => {
      if (!sets.some((set) => set.includes(card))) {
        sets.push([card]);
      }
    });

    setFunc(sets);
  };
  

  return (
    <div>
      <h2>{player1Name}</h2>
      <p>Deck ID: {player1DeckId}</p>
      <div className="card-container">
        {player1Cards.map((card) => (
          <img
            key={card.code}
            src={card.image}
            alt={`${card.value} of ${card.suit}`}
            className="card"
          />
        ))}
      </div>

      <h2>{player2Name}</h2>
      <p>Deck ID: {player2DeckId}</p>
      <div className="card-container">
        {player2Cards.map((card) => (
          <img
            key={card.code}
            src={card.image}
            alt={`${card.value} of ${card.suit}`}
            className="card"
          />
        ))}
      </div>

      <button onClick={handleDrawCard}>Pedir carta</button>
      <button onClick={handleFinishGame}>Terminar juego</button>
    </div>
  );
};

export default Game;

