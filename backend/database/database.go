package database

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"os"
	"path/filepath"
)

var DB *sql.DB

func InitDB() {
	// Get the user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}

	// Create the application data directory
	appDir := filepath.Join(homeDir, ".apiclient")
	err = os.MkdirAll(appDir, 0755)
	if err != nil {
		log.Fatal(err)
	}

	// Create or open the database file
	dbPath := filepath.Join(appDir, "apiclient.db")
	DB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}

	// Create tables if they don't exist
	createTables()
}

func createTables() {
	// Collections table
	collectionsTable := `
	CREATE TABLE IF NOT EXISTS collections (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// Folders table
	foldersTable := `
	CREATE TABLE IF NOT EXISTS folders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		collection_id INTEGER,
		parent_folder_id INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
		FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE
	);`

	// Requests table
	requestsTable := `
	CREATE TABLE IF NOT EXISTS requests (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		method TEXT NOT NULL,
		url TEXT NOT NULL,
		headers TEXT, -- JSON
		body TEXT,
		collection_id INTEGER,
		folder_id INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
		FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
	);`

	// Environments table
	environmentsTable := `
	CREATE TABLE IF NOT EXISTS environments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		variables TEXT, -- JSON
		is_active BOOLEAN DEFAULT FALSE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// Request history table
	requestHistoryTable := `
	CREATE TABLE IF NOT EXISTS request_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		request_id INTEGER,
		response_status INTEGER,
		response_time INTEGER,
		response_body TEXT,
		response_headers TEXT, -- JSON
		executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
	);`

	// Execute table creation queries
	queries := []string{
		collectionsTable,
		foldersTable,
		requestsTable,
		environmentsTable,
		requestHistoryTable,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatal(err)
		}
	}
}