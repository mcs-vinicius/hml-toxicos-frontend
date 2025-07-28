// src/page/AdminToolsPage.jsx
import React from 'react';
import BackupRestore from '../components/admin/BackupRestore';
import '../styles/UserManagementPage.css'; // Reutilizando estilos para consistência

const AdminToolsPage = () => {
    return (
        <div className="user-management-container">
            <h1>Ferramentas do Administrador</h1>
            <div className="user-list-table-wrapper">
                {/* O componente de Backup e Restauração será inserido aqui */}
                <BackupRestore />
            </div>
        </div>
    );
};

export default AdminToolsPage;