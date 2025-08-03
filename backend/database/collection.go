package database

import (
	"time"
	"apiclient/backend/models"
)

// Collection operations
func CreateCollection(collection *models.Collection) error {
	query := `
		INSERT INTO collections (name, description) 
		VALUES (?, ?)
		RETURNING id, created_at, updated_at
	`

	var id int
	var createdAt, updatedAt string
	err := DB.QueryRow(query, collection.Name, collection.Description).Scan(&id, &createdAt, &updatedAt)
	if err != nil {
		return err
	}

	collection.ID = id
	collection.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	collection.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
	return nil
}

func GetCollections() ([]*models.Collection, error) {
	query := `SELECT id, name, description, created_at, updated_at FROM collections ORDER BY name`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var collections []*models.Collection
	for rows.Next() {
		var collection models.Collection
		var createdAt, updatedAt string
		err := rows.Scan(&collection.ID, &collection.Name, &collection.Description, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		collection.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		collection.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
		collections = append(collections, &collection)
	}

	return collections, nil
}

func GetCollection(id int) (*models.Collection, error) {
	query := `SELECT id, name, description, created_at, updated_at FROM collections WHERE id = ?`
	row := DB.QueryRow(query, id)

	var collection models.Collection
	var createdAt, updatedAt string
	err := row.Scan(&collection.ID, &collection.Name, &collection.Description, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}
	collection.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	collection.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

	return &collection, nil
}

func UpdateCollection(collection *models.Collection) error {
	query := `
		UPDATE collections 
		SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`

	_, err := DB.Exec(query, collection.Name, collection.Description, collection.ID)
	if err != nil {
		return err
	}

	// Update the updated_at field
	row := DB.QueryRow("SELECT updated_at FROM collections WHERE id = ?", collection.ID)
	var updatedAt string
	err = row.Scan(&updatedAt)
	if err != nil {
		return err
	}
	collection.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

	return nil
}

func DeleteCollection(id int) error {
	query := `DELETE FROM collections WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}