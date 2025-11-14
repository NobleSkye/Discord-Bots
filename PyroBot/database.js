const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
    constructor() {
        // Create data directory if it doesn't exist BEFORE creating database
        const fs = require('fs');
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.db = new Database(path.join(__dirname, 'data', 'pyrobot.db'));
        this.initDatabase();
    }

    initDatabase() {

        // Create users table for storing API keys and panel URLs
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                api_key TEXT NOT NULL,
                panel_url TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create servers table for storing user's server configurations
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                server_id TEXT NOT NULL,
                server_name TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                UNIQUE(user_id, server_id)
            )
        `);
    }

    // Save or update user's API key and panel URL
    saveUser(userId, apiKey, panelUrl) {
        const stmt = this.db.prepare(`
            INSERT INTO users (user_id, api_key, panel_url, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) 
            DO UPDATE SET api_key = ?, panel_url = ?, updated_at = CURRENT_TIMESTAMP
        `);
        
        return stmt.run(userId, apiKey, panelUrl, apiKey, panelUrl);
    }

    // Get user's API credentials
    getUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE user_id = ?');
        return stmt.get(userId);
    }

    // Delete user's API credentials
    deleteUser(userId) {
        const stmt = this.db.prepare('DELETE FROM users WHERE user_id = ?');
        return stmt.run(userId);
    }

    // Save server configuration for a user
    saveServer(userId, serverId, serverName) {
        const stmt = this.db.prepare(`
            INSERT INTO servers (user_id, server_id, server_name) 
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, server_id) 
            DO UPDATE SET server_name = ?
        `);
        
        return stmt.run(userId, serverId, serverName, serverName);
    }

    // Get user's servers
    getUserServers(userId) {
        const stmt = this.db.prepare('SELECT * FROM servers WHERE user_id = ?');
        return stmt.all(userId);
    }

    // Delete server configuration
    deleteServer(userId, serverId) {
        const stmt = this.db.prepare('DELETE FROM servers WHERE user_id = ? AND server_id = ?');
        return stmt.run(userId, serverId);
    }

    close() {
        this.db.close();
    }
}

module.exports = DatabaseManager;
