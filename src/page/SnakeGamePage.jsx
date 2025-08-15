// src/page/SnakeGamePage.jsx (Versão Definitiva e Corrigida)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './SnakeGame.css';

// Configurações do Jogo
const GRID_SIZE = 20;
const CANVAS_SIZE = 500;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

// Níveis de Dificuldade
const DIFFICULTIES = {
    'Fácil': { speed: 2.5, points: 10 },
    'Normal': { speed: 3.5, points: 20 },
    'Difícil': { speed: 5, points: 40 },
    'Hardcore': { speed: 7, points: 80 },
};
const DIFFICULTY_LEVELS = ['Fácil', 'Normal', 'Difícil', 'Hardcore'];
const LEVEL_UP_TIME = 180; // 3 minutos

const SnakeGamePage = ({ currentUser }) => {
    const [snake, setSnake] = useState([{ x: 12 * GRID_SIZE, y: 12 * GRID_SIZE }]);
    const [food, setFood] = useState({ x: 18, y: 18 });
    const [direction, setDirection] = useState({ x: 0, y: -1 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState([]);
    const [gameTime, setGameTime] = useState(0);
    const [difficultyLevel, setDifficultyLevel] = useState(0);
    const [pointsPerFood, setPointsPerFood] = useState(DIFFICULTIES.Fácil.points);
    const [speed, setSpeed] = useState(DIFFICULTIES.Fácil.speed);
    const [isGameWon, setIsGameWon] = useState(false);

    const canvasRef = useRef(null);
    const gameLoopRef = useRef();
    const directionRef = useRef(direction);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    const fetchHighScores = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/snake-scores`);
            setHighScores(response.data);
        } catch (error) { console.error("Erro ao buscar ranking:", error); }
    }, []);

    const generateFood = useCallback((currentSnake) => {
        let newFoodPosition;
        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT),
            };
        } while (currentSnake.some(seg => Math.floor(seg.x / GRID_SIZE) === newFoodPosition.x && Math.floor(seg.y / GRID_SIZE) === newFoodPosition.y));
        setFood(newFoodPosition);
    }, []);
    
    const resetGame = useCallback(() => {
        const initialSnake = [{ x: 12 * GRID_SIZE, y: 12 * GRID_SIZE }];
        setSnake(initialSnake);
        generateFood(initialSnake);
        setDirection({ x: 0, y: -1 });
        setIsGameOver(false);
        setIsGameWon(false);
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
        const currentDirection = directionRef.current;
        switch (e.key) {
            case 'ArrowUp': if (currentDirection.y === 0) setDirection({ x: 0, y: -1 }); break;
            case 'ArrowDown': if (currentDirection.y === 0) setDirection({ x: 0, y: 1 }); break;
            case 'ArrowLeft': if (currentDirection.x === 0) setDirection({ x: -1, y: 0 }); break;
            case 'ArrowRight': if (currentDirection.x === 0) setDirection({ x: 1, y: 0 }); break;
            default: break;
        }
    }, [isGameOver]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    // Timer e Lógica de Dificuldade
    useEffect(() => {
        if (isGameOver) return;
        const timer = setInterval(() => {
            setGameTime(prevTime => {
                const newTime = prevTime + 1;
                const newLevel = Math.floor(newTime / LEVEL_UP_TIME);
                if (newLevel > difficultyLevel) {
                    setDifficultyLevel(prevLevel => {
                        const nextLevel = Math.min(newLevel, DIFFICULTY_LEVELS.length - 1);
                        if (nextLevel > prevLevel) {
                            const newDifficultyName = DIFFICULTY_LEVELS[nextLevel];
                            setSpeed(DIFFICULTIES[newDifficultyName].speed);
                             if (newDifficultyName === 'Hardcore' && prevLevel >= DIFFICULTY_LEVELS.indexOf('Hardcore') -1) {
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

    // Game Loop com requestAnimationFrame
    useEffect(() => {
        const gameLoop = () => {
            if (isGameOver) {
                cancelAnimationFrame(gameLoopRef.current);
                return;
            }
    
            setSnake(prevSnake => {
                const newSnake = JSON.parse(JSON.stringify(prevSnake));
                const head = { ...newSnake[0] };
    
                // 1. Calcular a nova posição da cabeça
                head.x += direction.x * speed;
                head.y += direction.y * speed;
    
                // 2. Lógica de atravessar paredes
                if (head.x >= CANVAS_SIZE) head.x = 0;
                if (head.x < 0) head.x = CANVAS_SIZE - GRID_SIZE;
                if (head.y >= CANVAS_SIZE) head.y = 0;
                if (head.y < 0) head.y = CANVAS_SIZE - GRID_SIZE;
    
                // 3. Adicionar a nova cabeça ao início da cobra
                newSnake.unshift(head);
    
                // 4. Lógica de comer a fruta
                const foodPixelX = food.x * GRID_SIZE;
                const foodPixelY = food.y * GRID_SIZE;
                if (Math.hypot(head.x - foodPixelX, head.y - foodPixelY) < GRID_SIZE) {
                    setScore(s => s + pointsPerFood);
                    // Não remove a cauda, fazendo a cobra crescer
    
                    if (newSnake.length === TILE_COUNT * TILE_COUNT) {
                        setIsGameWon(true);
                        setIsGameOver(true);
                    } else {
                        generateFood(newSnake);
                    }
                } else {
                    // Se não comeu, remove o último segmento da cauda
                    newSnake.pop();
                }
    
                // 5. Verificar colisão da cabeça com o resto do corpo
                for (let i = 1; i < newSnake.length; i++) {
                    if (Math.hypot(head.x - newSnake[i].x, head.y - newSnake[i].y) < GRID_SIZE / 2) {
                        setIsGameOver(true);
                        return prevSnake;
                    }
                }
                
                return newSnake;
            });
    
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };
    
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [isGameOver, direction, food, speed, pointsPerFood, generateFood]);
    
    
    // Salvar Pontuação
    useEffect(() => {
        if (isGameOver && (score > 0 || isGameWon) && currentUser) {
            axios.post(`${import.meta.env.VITE_API_URL}/snake-scores`, {
                score: score,
                difficulty: DIFFICULTY_LEVELS[difficultyLevel],
                completed: isGameWon,
                username: currentUser.username
            }).then(() => fetchHighScores());
        }
    }, [isGameOver, score, currentUser, difficultyLevel, isGameWon, fetchHighScores]);

    // Desenho no Canvas
    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, CANVAS_SIZE);
        gradient.addColorStop(0, '#0a192f');
        gradient.addColorStop(1, '#1d0a2e');
        context.fillStyle = gradient;
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        context.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        for (let i = 0; i <= TILE_COUNT; i++) {
            context.beginPath();
            context.moveTo(i * GRID_SIZE, 0); context.lineTo(i * GRID_SIZE, CANVAS_SIZE);
            context.moveTo(0, i * GRID_SIZE); context.lineTo(CANVAS_SIZE, i * GRID_SIZE);
            context.stroke();
        }

        snake.forEach((segment, index) => {
            context.fillStyle = index === 0 ? '#39ff14' : '#00ffff';
            context.shadowColor = index === 0 ? '#39ff14' : '#00ffff';
            context.shadowBlur = 10;
            context.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        context.fillStyle = '#ff00ff';
        context.shadowColor = '#ff00ff';
        context.shadowBlur = 15;
        context.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
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
                        <h2>{isGameWon ? "VOCÊ VENCEU!" : "Fim de Jogo!"}</h2>
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
                                <td className={entry.completed_game ? 'winner' : ''}>{entry.username}</td>
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