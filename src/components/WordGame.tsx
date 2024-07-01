import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../components/ui/alert-dialog';

// Scrabble letter distribution and scores
const letterDistribution: { [key: string]: number } = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1, L: 4, M: 2,
  N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1
};

const letterScores: { [key: string]: number } = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

// Function to generate the deck
const generateDeck = (): string[] => {
  let deck: string[] = [];
  Object.entries(letterDistribution).forEach(([letter, count]) => {
    for (let i = 0; i < count; i++) {
      deck.push(letter);
    }
  });
  return deck;
};

// Function to shuffle the deck
const shuffleDeck = (deck: string[]): string[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Function to draw cards
const drawCards = (deck: string[], count: number): string[] => {
  return deck.splice(0, count);
};

// Main game component
const WordGame: React.FC = () => {
  const [deck, setDeck] = useState<string[]>([]);
  const [hand, setHand] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [playsLeft, setPlaysLeft] = useState<number>(3);
  const [discardsLeft, setDiscardsLeft] = useState<number>(4);
  const [message, setMessage] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [wordlist, setWordlist] = useState<string[]>([]);

  useEffect(() => {
    // Initialize the game
    initializeGame();
    
    // Fetch the word list
    fetch('./dictionary.txt')
      .then(response => response.text())
      .then(text => {
        setWordlist(text.split('\n'));
      });
  }, []);

  const initializeGame = () => {
    const newDeck = shuffleDeck(generateDeck());
    setDeck(newDeck);
    setHand(drawCards(newDeck, 7));
    setSelectedCards(new Set());
    setScore(0);
    setRoundScore(0);
    setPlaysLeft(3);
    setDiscardsLeft(4);
    setMessage('');
    setIsGameOver(false);
  };

  const handleCardClick = (index: number) => {
    const newSelectedCards = new Set(selectedCards);
    if (newSelectedCards.has(index)) {
      newSelectedCards.delete(index);
    } else {
      newSelectedCards.add(index);
    }
    setSelectedCards(newSelectedCards);
  };

  const handlePlay = () => {
    if (playsLeft === 0) {
      setMessage("No plays left this round!");
      return;
    }

    const word = Array.from(selectedCards).sort((a, b) => a - b).map(index => hand[index]).join('').toUpperCase();
    if (word.length < 3) {
      setMessage("Word must be at least 3 letters long!");
      return;
    }

    if (!wordlist.includes(word)) {
      setMessage(`Not a valid word: ${word}!`);
      return;
    }

    const wordScore = word.split('').reduce((sum, letter) => sum + letterScores[letter.toUpperCase()], 0);
    setScore(score + wordScore);
    setRoundScore(roundScore + wordScore);
    setPlaysLeft(playsLeft - 1);

    // Remove played cards and draw new ones
    const newHand = [...hand];
    Array.from(selectedCards).forEach(index => {
      newHand[index] = drawCards(deck, 1)[0];
    });
    setHand(newHand);
    setSelectedCards(new Set());
    setMessage(`Played "${word}" for ${wordScore} points!`);

    if (playsLeft === 1 && discardsLeft === 0) {
      setIsGameOver(true);
    }
  };

  const handleDiscard = () => {
    if (discardsLeft === 0) {
      setMessage("No discards left this round!");
      return;
    }

    if (selectedCards.size === 0) {
      setMessage("Select cards to discard!");
      return;
    }

    const newHand = [...hand];
    Array.from(selectedCards).forEach(index => {
      newHand[index] = drawCards(deck, 1)[0];
    });
    setHand(newHand);
    setSelectedCards(new Set());
    setDiscardsLeft(discardsLeft - 1);
    setMessage(`Discarded ${selectedCards.size} cards.`);

    if (playsLeft === 0 && discardsLeft === 1) {
      setIsGameOver(true);
    }
  };

  const onDragEnd = (result: DropResult) => {
      if (!result.destination) {
          return;
      }

      const newHand = Array.from(hand);
      const [reorderedItem] = newHand.splice(result.source.index, 1);
      newHand.splice(result.destination.index, 0, reorderedItem);

      setHand(newHand);

      // Update selected cards indices if necessary
      const newSelectedCards = new Set<number>();
      selectedCards.forEach(index => {
          if (index === result.source.index) {
              newSelectedCards.add(result.destination!.index);
          } else if (index > result.source.index && index <= result.destination!.index) {
              newSelectedCards.add(index - 1);
          } else if (index < result.source.index && index >= result.destination!.index) {
              newSelectedCards.add(index + 1);
          } else {
              newSelectedCards.add(index);
          }
      });
      setSelectedCards(newSelectedCards);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Scrabblatro</h1>
      <div className="mb-4">
        <p>Total Score: {score}</p>
        <p>Round Score: {roundScore}</p>
        <p>Plays Left: {playsLeft}</p>
        <p>Discards Left: {discardsLeft}</p>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="hand" direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap mb-4">
              {hand.map((letter, index) => (
                 <Draggable key={index} draggableId={`card-${index}`} index={index}>
                  {(provided, snapshot) => (
                      <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'z-10' : ''} mx-0.5`}
                      >
                      <Card 
                      className={`w-20 h-24 flex flex-col items-center justify-center cursor-pointer ${selectedCards.has(index) ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleCardClick(index)}
                      >
                      <CardContent className="p-2 flex flex-col items-center justify-between h-full select-none">
                      <span className="text-sm">{letterScores[letter]} pts</span>
                      <span className="text-4xl font-bold">{letter}</span>
                      <div className="h-2"></div>
                      </CardContent>
                      </Card>
                      </div>
                  )}
                  </Draggable>
              ))}
              {provided.placeholder}
              </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="space-x-2 mb-4">
        <Button onClick={handlePlay} disabled={selectedCards.size === 0 || playsLeft === 0}>Play</Button>
        <Button onClick={handleDiscard} disabled={selectedCards.size === 0 || discardsLeft === 0}>Discard</Button>
      </div>
      <p>{message}</p>
      <AlertDialog open={isGameOver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over!</AlertDialogTitle>
            <AlertDialogDescription>
              Your final score is {score}. Would you like to play again?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={initializeGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WordGame;
