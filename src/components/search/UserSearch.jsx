import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../styles/components/UserSearch.css';
import { FaSearch } from 'react-icons/fa';

const UserSearch = ({ onUserSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-users?query=${query}`);
                setResults(response.data);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };
        const debounceTimeout = setTimeout(() => fetchUsers(), 300);
        return () => clearTimeout(debounceTimeout);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectUser = (habby_id) => {
        setQuery('');
        setResults([]);
        setIsActive(false);
        onUserSelect(habby_id);
    };

    return (
        <div className="search-wrapper" ref={searchRef}>
            <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsActive(true)}
                    placeholder="Buscar membro por Nick ou ID..."
                    className="search-input"
                />
            </div>
            {isActive && results.length > 0 && (
                <ul className="search-results-list">
                    {results.map((user) => (
                        <li key={user.habby_id} onClick={() => handleSelectUser(user.habby_id)}>
                            <span className="result-nick">{user.nick}</span>
                            <span className="result-habbyid">{user.habby_id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserSearch;