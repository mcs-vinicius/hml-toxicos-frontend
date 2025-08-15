// src/page/SnakeGamePage.jsx (Versão Futurista)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './SnakeGame.css';

// Configurações do Jogo
const GRID_SIZE = 20;
const CANVAS_SIZE = 500; // Canvas maior para melhor visualização
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

// Níveis de Dificuldade (velocidade em ms)
const DIFFICULTIES = {
    'Fácil': { speed: 150, points: 10 },
    'Normal': { speed: 100, points: 20 },
    'Difícil': { speed: 75, points: 40 },
    'Hardcore': { speed: 50, points: 80 },
};
const DIFFICULTY_LEVELS = ['Fácil', 'Normal', 'Difícil', 'Hardcore'];
const LEVEL_UP_TIME = 180; // 3 minutos em segundos

const SnakeGamePage = ({ currentUser }) => {
    const [snake, setSnake] = useState([{ x: 12, y: 12 }]);
    const [food, setFood] = useState({ x: 18, y: 18 });
    const [direction, setDirection] = useState({ x: 0, y: -1 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState([]);
    const [gameTime, setGameTime] = useState(0);
    const [difficultyLevel, setDifficultyLevel] = useState(0); // Index para DIFFICULTY_LEVELS
    const [pointsPerFood, setPointsPerFood] = useState(DIFFICULTIES.Fácil.points);
    const [speed, setSpeed] = useState(DIFFICULTIES.Fácil.speed);

    const canvasRef = useRef(null);

    const fetchHighScores = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/snake-scores`);
            setHighScores(response.data);
        } catch (error) {
            console.error("Erro ao buscar ranking:", error);
        }
    }, []);

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

    const resetGame = useCallback(() => {
        setSnake([{ x: 12, y: 12 }]);
        generateFood();
        setDirection({ x: 0, y: -1 });
        setIsGameOver(false);
        setScore(0);
        setGameTime(0);
        setDifficultyLevel(0);
        setSpeed(DIFFICULTIES.Fácil.speed);
        setPointsPerFood(DIFFICULTIES.Fácil.points);
        fetchHighScores();
    }, [generateFood, fetchHighScores]);

    useEffect(() => {
        resetGame();
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (isGameOver) return;
        switch (e.key) {
            case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
            case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
            case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
            case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
            default: break;
        }
    }, [direction, isGameOver]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    // Game Timer e Lógica de Dificuldade
    useEffect(() => {
        if (isGameOver) return;
    
        const timer = setInterval(() => {
            setGameTime(prevTime => {
                const newTime = prevTime + 1;
                const newLevel = Math.floor(newTime / LEVEL_UP_TIME);
    
                if (newLevel > difficultyLevel) {
                    setDifficultyLevel(prevLevel => {
                        // Aumenta o nível até o máximo de "Hardcore"
                        const nextLevel = Math.min(newLevel, DIFFICULTY_LEVELS.length - 1);
                        
                        if (nextLevel > prevLevel) {
                            const newDifficultyName = DIFFICULTY_LEVELS[nextLevel];
                            setSpeed(DIFFICULTIES[newDifficultyName].speed);
                            
                            // Lógica de pontuação que dobra
                            if (newDifficultyName === 'Hardcore') {
                                // Dobra a pontuação anterior a cada novo nível em hardcore
                                setPointsPerFood(p => p * 2);
                            } else {
                                setPointsPerFood(DIFFICULTIES[newDifficultyName].points);
                            }
                        }
                        return nextLevel;
                    });
                }
                return newTime;
            });
        }, 1000);
    
        return () => clearInterval(timer);
    }, [isGameOver, difficultyLevel]);
    

    // Game Loop Principal
    useEffect(() => {
        if (isGameOver) {
            if (score > 0 && currentUser) {
                axios.post(`${import.meta.env.VITE_API_URL}/snake-scores`, {
                    username: currentUser.username,
                    score: score,
                    difficulty: DIFFICULTY_LEVELS[difficultyLevel] // Envia a dificuldade máxima alcançada
                }).then(() => fetchHighScores());
            }
            return;
        }

        const gameInterval = setInterval(() => {
            setSnake(prevSnake => {
                const newSnake = [...prevSnake];
                const head = { ...newSnake[0] };
                head.x += direction.x;
                head.y += direction.y;

                if (
                    head.x < 0 || head.x >= TILE_COUNT ||
                    head.y < 0 || head.y >= TILE_COUNT ||
                    newSnake.some(segment => segment.x === head.x && segment.y === head.y)
                ) {
                    setIsGameOver(true);
                    return prevSnake;
                }

                newSnake.unshift(head);

                if (head.x === food.x && head.y === food.y) {
                    setScore(s => s + pointsPerFood);
                    generateFood();
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, speed);

        return () => clearInterval(gameInterval);
    }, [direction, food, isGameOver, speed, score, currentUser, difficultyLevel, pointsPerFood, generateFood, fetchHighScores]);

    // Desenho no Canvas
    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        
        // Fundo gradiente e grid
        const gradient = context.createLinearGradient(0, 0, 0, CANVAS_SIZE);
        gradient.addColorStop(0, '#0a192f');
        gradient.addColorStop(1, '#1d0a2e');
        context.fillStyle = gradient;
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        context.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        for (let i = 0; i <= TILE_COUNT; i++) {
            context.beginPath();
            context.moveTo(i * GRID_SIZE, 0);
            context.lineTo(i * GRID_SIZE, CANVAS_SIZE);
            context.moveTo(0, i * GRID_SIZE);
            context.lineTo(CANVAS_SIZE, i * GRID_SIZE);
            context.stroke();
        }

        // Desenha a cobra com efeito neon
        snake.forEach((segment, index) => {
            const isHead = index === 0;
            context.fillStyle = isHead ? '#39ff14' : '#00ffff'; // Cabeça verde, corpo ciano
            context.shadowColor = isHead ? '#39ff14' : '#00ffff';
            context.shadowBlur = 10;
            context.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        // Desenha a comida com efeito neon
        context.fillStyle = '#ff00ff';
        context.shadowColor = '#ff00ff';
        context.shadowBlur = 15;
        context.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

        // Reseta o blur para não afetar outros elementos
        context.shadowBlur = 0;

    }, [snake, food]);

    return (
        <div className="snake-game-container">
            <h1>Cyber Snake</h1>
            <div className="game-info">
                <span>Pontuação: {score}</span>
                <span className="difficulty-display">Nível: {DIFFICULTY_LEVELS[difficultyLevel]}</span>
                <span>Tempo: {new Date(gameTime * 1000).toISOString().substr(14, 5)}</span>
            </div>
            <div className="game-area">
                <canvas ref={canvasRef} id="game-canvas" width={CANVAS_SIZE} height={CANVAS_SIZE}></canvas>
                {isGameOver && (
                    <div className="game-over-overlay">
                        <h2>Fim de Jogo!</h2>
                        <p>Sua pontuação final: {score}</p>
                        <button onClick={resetGame}>Jogar Novamente</button>
                    </div>
                )}
            </div>
            
            <div className="ranking-container">
                <h2>Melhores Pontuações</h2>
                <table>
                    <thead>
                        <tr><th>Pos.</th><th>Nome</th><th>Pontuação</th><th>Nível Máx.</th></tr>
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