const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'webhook.db'));

// Initialize database
db.exec(`
    CREATE TABLE IF NOT EXISTS webhook_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        hostname TEXT NOT NULL DEFAULT 'example.com',
        path TEXT NOT NULL DEFAULT '/webhook',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Insert default config if not exists
const defaultConfig = db.prepare('SELECT * FROM webhook_config WHERE id = 1').get();
if (!defaultConfig) {
    db.prepare('INSERT INTO webhook_config (id, hostname, path) VALUES (1, ?, ?)').run('example.com', '/webhook');
}

// Get webhook config
function getConfig() {
    return db.prepare('SELECT hostname, path FROM webhook_config WHERE id = 1').get();
}

// Update hostname
function setHostname(hostname) {
    return db.prepare('UPDATE webhook_config SET hostname = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(hostname);
}

// Update path
function setPath(webhookPath) {
    return db.prepare('UPDATE webhook_config SET path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(webhookPath);
}

module.exports = {
    getConfig,
    setHostname,
    setPath
};
