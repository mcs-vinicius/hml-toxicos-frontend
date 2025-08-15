// src/page/SnakeGamePage.jsx (Completo)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './SnakeGame.css';

// Configurações do Jogo
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

const DIFFICULTIES = {
    Fácil: 150,
    Normal: 100,
    Difícil: 75,
    Hardcore: 50,
};

const SnakeGamePage = ({ currentUser }) => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState({ x: 0, y: -1 }); // Começa indo para cima
    const [speed, setSpeed] = useState(DIFFICULTIES.Normal);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState([]);
    const [difficulty, setDifficulty] = useState('Normal');

    const canvasRef = useRef(null);

    // Função para gerar nova comida
    const generateFood = useCallback(() => {
        let newFoodPosition;
        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT),
            };
        } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
        setFood(newFoodPosition);
    }, [snake]);

    // Função para buscar o ranking
    const fetchHighScores = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/snake-scores`);
            setHighScores(response.data);
        } catch (error) {
            console.error("Erro ao buscar ranking:", error);
        }
    };
    
    useEffect(() => {
        fetchHighScores();
    }, []);

    const resetGame = useCallback(() => {
        setSnake([{ x: 10, y: 10 }]);
        generateFood();
        setDirection({ x: 0, y: -1 });
        setIsGameOver(false);
        setScore(0);
    }, [generateFood]);
    
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
            case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
            case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
            case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
            default: break;
        }
    }, [direction]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Game Loop
    useEffect(() => {
        if (isGameOver) {
            // Salva a pontuação quando o jogo termina
            if (score > 0 && currentUser) {
                axios.post(`${import.meta.env.VITE_API_URL}/snake-scores`, {
                    username: currentUser.username,
                    score: score,
                    difficulty: difficulty
                }).then(() => fetchHighScores()); // Atualiza o ranking
            }
            return;
        }

        const gameInterval = setInterval(() => {
            const newSnake = [...snake];
            const head = { ...newSnake[0] };
            head.x += direction.x;
            head.y += direction.y;

            // Lógica de Game Over
            if (
                head.x < 0 || head.x >= TILE_COUNT ||
                head.y < 0 || head.y >= TILE_COUNT ||
                newSnake.some(segment => segment.x === head.x && segment.y === head.y)
            ) {
                setIsGameOver(true);
                return;
            }

            newSnake.unshift(head);

            // Lógica de comer a fruta
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                generateFood();
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);

        }, speed);

        return () => clearInterval(gameInterval);
    }, [snake, direction, food, isGameOver, speed, score, currentUser, difficulty, generateFood]);

    // Desenho no Canvas
    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Desenha a cobra
        context.fillStyle = '#00ffff';
        snake.forEach(segment => {
            context.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
        });
        
        // Desenha a comida
        context.fillStyle = '#ff00ff';
        context.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    }, [snake, food]);
    
    const handleDifficultyChange = (e) => {
        const newDifficulty = e.target.value;
        setDifficulty(newDifficulty);
        setSpeed(DIFFICULTIES[newDifficulty]);
        resetGame();
    }

    return (
        <div className="snake-game-container">
            <h1>Jogo da Cobrinha</h1>
            <div className="game-info">
                <span>Pontuação: {score}</span>
                <div className="difficulty-selector">
                    <select onChange={handleDifficultyChange} value={difficulty}>
                        <option>Fácil</option>
                        <option>Normal</option>
                        <option>Difícil</option>
                        <option>Hardcore</option>
                    </select>
                </div>
            </div>
            <div className="game-area">
                <canvas ref={canvasRef} id="game-canvas" width={CANVAS_SIZE} height={CANVAS_SIZE}></canvas>
                {isGameOver && (
                    <div className="game-over-overlay">
                        <h2>Fim de Jogo!</h2>
                        <button onClick={resetGame}>Jogar Novamente</button>
                    </div>
                )}
            </div>
            <div className="mobile-controls">
                <button onClick={() => handleKeyDown({ key: 'ArrowUp' })}>↑</button>
                <div>
                    <button onClick={() => handleKeyDown({ key: 'ArrowLeft' })}>←</button>
                    <button onClick={() => handleKeyDown({ key: 'ArrowDown' })}>↓</button>
                    <button onClick={() => handleKeyDown({ key: 'ArrowRight' })}>→</button>
                </div>
            </div>
             <div className="ranking-container">
                <h2>Ranking</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Pos.</th>
                            <th>Nome</th>
                            <th>Pontuação</th>
                            <th>Dificuldade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highScores.map((entry, index) => (
                            <tr key={index}>
                                <td>{index + 1}º</td>
                                <td>{entry.username}</td>
                                <td>{entry.score}</td>
                                <td>{entry.difficulty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SnakeGamePage;