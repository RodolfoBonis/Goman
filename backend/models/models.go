package models

import "time"

// Collection represents an API request collection
type Collection struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Folder represents a folder within a collection
type Folder struct {
	ID             int       `json:"id"`
	Name           string    `json:"name"`
	CollectionID   int       `json:"collection_id"`
	ParentFolderID *int      `json:"parent_folder_id"`
	CreatedAt      time.Time `json:"created_at"`
}

// Request represents an API request
type Request struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Method       string    `json:"method"`
	URL          string    `json:"url"`
	Headers      string    `json:"headers"` // JSON string
	Body         string    `json:"body"`
	CollectionID *int      `json:"collection_id"`
	FolderID     *int      `json:"folder_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Environment represents an environment with variables
type Environment struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Variables string    `json:"variables"` // JSON string
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// RequestHistory represents a request execution history
type RequestHistory struct {
	ID             int       `json:"id"`
	RequestID      int       `json:"request_id"`
	ResponseStatus int       `json:"response_status"`
	ResponseTime   int       `json:"response_time"`
	ResponseBody   string    `json:"response_body"`
	ResponseHeaders string   `json:"response_headers"` // JSON string
	ExecutedAt     time.Time `json:"executed_at"`
}