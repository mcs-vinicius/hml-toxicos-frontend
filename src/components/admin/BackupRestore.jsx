// src/components/admin/BackupRestore.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaDownload, FaUpload } from 'react-icons/fa';

// Estilos embutidos para simplicidade, consistentes com o tema do projeto
const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Chakra Petch, sans-serif',
        color: '#e0fbfc',
    },
    title: {
        textAlign: 'center',
        color: '#ffffff',
        textShadow: '0 0 10px #ff00ff',
        marginBottom: '30px',
    },
    section: {
        marginTop: '30px',
        padding: '20px',
        border: '1px solid rgba(0, 255, 255, 0.2)',
        borderRadius: '8px',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    subtitle: {
        color: '#00ffff',
        marginBottom: '10px',
    },
    description: {
        color: 'rgba(224, 251, 252, 0.8)',
        fontSize: '14px',
        lineHeight: '1.5',
    },
    warning: {
        color: '#ff2d55',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'transparent',
        color: '#00ffff',
        padding: '10px 15px',
        border: '1px solid #00ffff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.3s ease',
    },
    buttonRestore: {
        color: '#ff2d55',
        borderColor: '#ff2d55',
        marginLeft: '10px',
    },
    input: {
        padding: '8px',
        fontFamily: 'inherit',
        color: '#e0fbfc',
        backgroundColor: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '4px',
    },
    messageSuccess: {
        color: '#28a745',
        textAlign: 'center',
        fontWeight: 'bold',
        padding: '10px',
        border: '1px solid #28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderRadius: '4px',
    },
    messageError: {
        color: '#dc3545',
        textAlign: 'center',
        fontWeight: 'bold',
        padding: '10px',
        border: '1px solid #dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderRadius: '4px',
    },
};


const BackupRestore = () => {
    const [isLoadingBackup, setIsLoadingBackup] = useState(false);
    const [isLoadingRestore, setIsLoadingRestore] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleBackup = async () => {
        setIsLoadingBackup(true);
        setMessage('');
        setError('');
        try {
            const response = await axios.get(`${API_URL}/backup`, {
                withCredentials: true,
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const today = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `backup_toxicos_${today}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setMessage('Backup gerado e baixado com sucesso!');
        } catch (err) {
            let errorMessage = 'Erro ao gerar o backup. Verifique o console do servidor para mais detalhes.';
            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
                if(err.response.data.details) {
                    errorMessage += ` Detalhes: ${err.response.data.details}`;
                }
            }
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoadingBackup(false);
        }
    };


    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setError('');
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            setError('Por favor, selecione um arquivo de backup para restaurar.');
            return;
        }

        const confirmRestore = window.confirm(
            'ATENÇÃO: Esta ação substituirá TODOS os dados atuais pelos dados do arquivo de backup. A operação não pode ser desfeita. Deseja continuar?'
        );

        if (!confirmRestore) return;

        setIsLoadingRestore(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(`${API_URL}/restore`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data.message || 'Dados restaurados com sucesso!');
            setSelectedFile(null);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Erro ao restaurar os dados.';
            setError(errorMessage);
        } finally {
            setIsLoadingRestore(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Backup e Restauração</h2>
            
            {message && <p style={styles.messageSuccess}>{message}</p>}
            {error && <p style={styles.messageError}>{error}</p>}

            <div style={styles.section}>
                <h3 style={styles.subtitle}>1. Gerar Backup Completo</h3>
                <p style={styles.description}>
                    Cria e baixa um arquivo JSON contendo todos os dados do sistema. Guarde este arquivo em um local seguro.
                </p>
                <button 
                    onClick={handleBackup} 
                    disabled={isLoadingBackup}
                    style={styles.button}
                >
                    <FaDownload />
                    {isLoadingBackup ? 'Gerando...' : 'Gerar Backup'}
                </button>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>2. Restaurar a partir de um Backup</h3>
                <p style={styles.warning}>
                    AVISO: A restauração substituirá todos os dados existentes no site.
                </p>
                <input 
                    type="file" 
                    accept=".json"
                    onChange={handleFileChange} 
                    style={styles.input}
                    // Adiciona uma key para forçar a remontagem e limpar o valor do input
                    key={selectedFile || ''}
                />
                <button 
                    onClick={handleRestore} 
                    disabled={isLoadingRestore || !selectedFile}
                    style={{...styles.button, ...styles.buttonRestore}}
                >
                    <FaUpload />
                    {isLoadingRestore ? 'Restaurando...' : 'Restaurar Dados'}
                </button>
            </div>
        </div>
    );
};

export default BackupRestore;