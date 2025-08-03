package database

import (
	"apiclient/backend/models"
	"database/sql"
	"time"
)

// Folder operations
func CreateFolder(folder *models.Folder) error {
	query := `
		INSERT INTO folders (name, collection_id, parent_folder_id) 
		VALUES (?, ?, ?)
		RETURNING id, created_at
	`

	var id int
	var createdAt string
	err := DB.QueryRow(query, folder.Name, folder.CollectionID, folder.ParentFolderID).Scan(&id, &createdAt)
	if err != nil {
		return err
	}

	folder.ID = id
	folder.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	return nil
}

func GetFolders() ([]*models.Folder, error) {
	query := `SELECT id, name, collection_id, parent_folder_id, created_at FROM folders ORDER BY name`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var folders []*models.Folder
	for rows.Next() {
		var folder models.Folder
		var parentFolderID sql.NullInt64
		var createdAt string
		err := rows.Scan(&folder.ID, &folder.Name, &folder.CollectionID, &parentFolderID, &createdAt)
		if err != nil {
			return nil, err
		}
		
		if parentFolderID.Valid {
			val := int(parentFolderID.Int64)
			folder.ParentFolderID = &val
		}
		
		folder.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		folders = append(folders, &folder)
	}

	return folders, nil
}

func GetFolder(id int) (*models.Folder, error) {
	query := `SELECT id, name, collection_id, parent_folder_id, created_at FROM folders WHERE id = ?`
	row := DB.QueryRow(query, id)

	var folder models.Folder
	var parentFolderID sql.NullInt64
	var createdAt string
	err := row.Scan(&folder.ID, &folder.Name, &folder.CollectionID, &parentFolderID, &createdAt)
	if err != nil {
		return nil, err
	}
	
	if parentFolderID.Valid {
		val := int(parentFolderID.Int64)
		folder.ParentFolderID = &val
	}
	
	folder.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)

	return &folder, nil
}

func UpdateFolder(folder *models.Folder) error {
	query := `
		UPDATE folders 
		SET name = ?, collection_id = ?, parent_folder_id = ?
		WHERE id = ?
	`

	_, err := DB.Exec(query, folder.Name, folder.CollectionID, folder.ParentFolderID, folder.ID)
	return err
}

func DeleteFolder(id int) error {
	query := `DELETE FROM folders WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

func GetFoldersByCollection(collectionID int) ([]*models.Folder, error) {
	query := `SELECT id, name, collection_id, parent_folder_id, created_at FROM folders WHERE collection_id = ? ORDER BY name`
	rows, err := DB.Query(query, collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var folders []*models.Folder
	for rows.Next() {
		var folder models.Folder
		var parentFolderID sql.NullInt64
		var createdAt string
		err := rows.Scan(&folder.ID, &folder.Name, &folder.CollectionID, &parentFolderID, &createdAt)
		if err != nil {
			return nil, err
		}
		
		if parentFolderID.Valid {
			val := int(parentFolderID.Int64)
			folder.ParentFolderID = &val
		}
		
		folder.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		folders = append(folders, &folder)
	}

	return folders, nil
}