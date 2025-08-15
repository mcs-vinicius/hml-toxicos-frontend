// src/page/SnakeGamePage.jsx (Versão com Movimento Fluido)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './SnakeGame.css';

// Configurações do Jogo
const GRID_SIZE = 20;
const CANVAS_SIZE = 500;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

// Níveis de Dificuldade
const DIFFICULTIES = {
    'Fácil': { speed: 2.5, points: 10 },    // Velocidade em pixels por frame
    'Normal': { speed: 3.5, points: 20 },
    'Difícil': { speed: 5, points: 40 },
    'Hardcore': { speed: 7, points: 80 },
};
const DIFFICULTY_LEVELS = ['Fácil', 'Normal', 'Difícil', 'Hardcore'];
const LEVEL_UP_TIME = 180; // 3 minutos

const SnakeGamePage = ({ currentUser }) => {
    // Posições agora são em pixels para movimento fluido
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

    const canvasRef = useRef(null);
    const gameLoopRef = useRef();

    const fetchHighScores = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/snake-scores`);
            setHighScores(response.data);
        } catch (error) { console.error("Erro ao buscar ranking:", error); }
    }, []);

    const generateFood = useCallback(() => {
        const foodX = Math.floor(Math.random() * TILE_COUNT);
        const foodY = Math.floor(Math.random() * TILE_COUNT);
        // Evita que a comida apareça na cobra
        if (snake.some(seg => Math.floor(seg.x / GRID_SIZE) === foodX && Math.floor(seg.y / GRID_SIZE) === foodY)) {
            generateFood();
        } else {
            setFood({ x: foodX, y: foodY });
        }
    }, [snake]);
    
    const resetGame = useCallback(() => {
        setSnake([{ x: 12 * GRID_SIZE, y: 12 * GRID_SIZE }]);
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
    
    // Game Timer e Lógica de Dificuldade (igual à versão anterior)
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

    // Game Loop com requestAnimationFrame para fluidez
    useEffect(() => {
        const gameLoop = () => {
            if (isGameOver) {
                cancelAnimationFrame(gameLoopRef.current);
                return;
            }

            setSnake(prevSnake => {
                const newSnake = prevSnake.map(seg => ({ ...seg })); // Deep copy
                const head = newSnake[0];

                // Movimento baseado em pixels
                let newHeadX = head.x + direction.x * speed;
                let newHeadY = head.y + direction.y * speed;

                // Colisão com as paredes
                if (newHeadX < 0 || newHeadX >= CANVAS_SIZE - GRID_SIZE || newHeadY < 0 || newHeadY >= CANVAS_SIZE - GRID_SIZE) {
                    setIsGameOver(true);
                    return prevSnake;
                }

                // Colisão com o próprio corpo
                for (let i = 1; i < newSnake.length; i++) {
                    if (Math.abs(newHeadX - newSnake[i].x) < GRID_SIZE && Math.abs(newHeadY - newSnake[i].y) < GRID_SIZE) {
                         setIsGameOver(true);
                         return prevSnake;
                    }
                }

                // Movimento do corpo da cobra
                for (let i = newSnake.length - 1; i > 0; i--) {
                    newSnake[i] = { ...newSnake[i-1] };
                }
                
                // Atualiza a cabeça
                newSnake[0] = { x: newHeadX, y: newHeadY };

                // Lógica de comer a fruta
                if (Math.abs(head.x - food.x * GRID_SIZE) < GRID_SIZE && Math.abs(head.y - food.y * GRID_SIZE) < GRID_SIZE) {
                    setScore(s => s + pointsPerFood);
                    // Adiciona um novo segmento na posição do último
                    const tail = newSnake[newSnake.length -1];
                    newSnake.push({...tail});
                    generateFood();
                }

                return newSnake;
            });

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [direction, food, speed, isGameOver, pointsPerFood, generateFood]);
    
    // Salvar Pontuação
    useEffect(() => {
        if (isGameOver && score > 0 && currentUser) {
            axios.post(`${import.meta.env.VITE_API_URL}/snake-scores`, {
                username: currentUser.username,
                score: score,
                difficulty: DIFFICULTY_LEVELS[difficultyLevel]
            }).then(() => fetchHighScores());
        }
    }, [isGameOver, score, currentUser, difficultyLevel, fetchHighScores]);

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
            const isHead = index === 0;
            context.fillStyle = isHead ? '#39ff14' : '#00ffff';
            context.shadowColor = isHead ? '#39ff14' : '#00ffff';
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