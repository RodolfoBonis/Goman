package database

import (
	"apiclient/backend/models"
	"database/sql"
	"time"
)

// Request operations
func CreateRequest(request *models.Request) error {
	query := `
		INSERT INTO requests (name, method, url, headers, body, collection_id, folder_id) 
		VALUES (?, ?, ?, ?, ?, ?, ?)
		RETURNING id, created_at, updated_at
	`

	var id int
	var createdAt, updatedAt string
	err := DB.QueryRow(query, request.Name, request.Method, request.URL, request.Headers, request.Body, request.CollectionID, request.FolderID).Scan(&id, &createdAt, &updatedAt)
	if err != nil {
		return err
	}

	request.ID = id
	request.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	request.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
	return nil
}

func GetRequests() ([]*models.Request, error) {
	query := `SELECT id, name, method, url, headers, body, collection_id, folder_id, created_at, updated_at FROM requests ORDER BY name`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*models.Request
	for rows.Next() {
		var request models.Request
		var collectionID, folderID sql.NullInt64
		var createdAt, updatedAt string
		err := rows.Scan(&request.ID, &request.Name, &request.Method, &request.URL, &request.Headers, &request.Body, &collectionID, &folderID, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		
		if collectionID.Valid {
			val := int(collectionID.Int64)
			request.CollectionID = &val
		}
		
		if folderID.Valid {
			val := int(folderID.Int64)
			request.FolderID = &val
		}
		
		request.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		request.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
		requests = append(requests, &request)
	}

	return requests, nil
}

func GetRequest(id int) (*models.Request, error) {
	query := `SELECT id, name, method, url, headers, body, collection_id, folder_id, created_at, updated_at FROM requests WHERE id = ?`
	row := DB.QueryRow(query, id)

	var request models.Request
	var collectionID, folderID sql.NullInt64
	var createdAt, updatedAt string
	err := row.Scan(&request.ID, &request.Name, &request.Method, &request.URL, &request.Headers, &request.Body, &collectionID, &folderID, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}
	
	if collectionID.Valid {
		val := int(collectionID.Int64)
		request.CollectionID = &val
	}
	
	if folderID.Valid {
		val := int(folderID.Int64)
		request.FolderID = &val
	}
	
	request.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	request.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

	return &request, nil
}

func UpdateRequest(request *models.Request) error {
	query := `
		UPDATE requests 
		SET name = ?, method = ?, url = ?, headers = ?, body = ?, collection_id = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`

	_, err := DB.Exec(query, request.Name, request.Method, request.URL, request.Headers, request.Body, request.CollectionID, request.FolderID, request.ID)
	if err != nil {
		return err
	}

	// Update the updated_at field
	row := DB.QueryRow("SELECT updated_at FROM requests WHERE id = ?", request.ID)
	var updatedAt string
	err = row.Scan(&updatedAt)
	if err != nil {
		return err
	}
	request.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

	return nil
}

func DeleteRequest(id int) error {
	query := `DELETE FROM requests WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

func GetRequestsByCollection(collectionID int) ([]*models.Request, error) {
	query := `SELECT id, name, method, url, headers, body, collection_id, folder_id, created_at, updated_at FROM requests WHERE collection_id = ? ORDER BY name`
	rows, err := DB.Query(query, collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*models.Request
	for rows.Next() {
		var request models.Request
		var folderID sql.NullInt64
		var createdAt, updatedAt string
		err := rows.Scan(&request.ID, &request.Name, &request.Method, &request.URL, &request.Headers, &request.Body, &collectionID, &folderID, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		
		if folderID.Valid {
			val := int(folderID.Int64)
			request.FolderID = &val
		}
		
		request.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		request.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
		requests = append(requests, &request)
	}

	return requests, nil
}

func GetRequestsByFolder(folderID int) ([]*models.Request, error) {
	query := `SELECT id, name, method, url, headers, body, collection_id, folder_id, created_at, updated_at FROM requests WHERE folder_id = ? ORDER BY name`
	rows, err := DB.Query(query, folderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*models.Request
	for rows.Next() {
		var request models.Request
		var collectionID sql.NullInt64
		var createdAt, updatedAt string
		err := rows.Scan(&request.ID, &request.Name, &request.Method, &request.URL, &request.Headers, &request.Body, &collectionID, &folderID, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		
		if collectionID.Valid {
			val := int(collectionID.Int64)
			request.CollectionID = &val
		}
		
		request.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		request.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
		requests = append(requests, &request)
	}

	return requests, nil
}