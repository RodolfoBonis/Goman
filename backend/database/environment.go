package database

import (
	"database/sql"
	"time"
	"apiclient/backend/models"
)

// Environment operations
func CreateEnvironment(environment *models.Environment) error {
	query := `
		INSERT INTO environments (name, variables, is_active) 
		VALUES (?, ?, ?)
		RETURNING id, created_at
	`

	var id int
	var createdAt string
	err := DB.QueryRow(query, environment.Name, environment.Variables, environment.IsActive).Scan(&id, &createdAt)
	if err != nil {
		return err
	}

	environment.ID = id
	environment.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	return nil
}

func GetEnvironments() ([]*models.Environment, error) {
	query := `SELECT id, name, variables, is_active, created_at FROM environments ORDER BY name`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var environments []*models.Environment
	for rows.Next() {
		var environment models.Environment
		var createdAt string
		err := rows.Scan(&environment.ID, &environment.Name, &environment.Variables, &environment.IsActive, &createdAt)
		if err != nil {
			return nil, err
		}
		environment.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		environments = append(environments, &environment)
	}

	return environments, nil
}

func GetEnvironment(id int) (*models.Environment, error) {
	query := `SELECT id, name, variables, is_active, created_at FROM environments WHERE id = ?`
	row := DB.QueryRow(query, id)

	var environment models.Environment
	var createdAt string
	err := row.Scan(&environment.ID, &environment.Name, &environment.Variables, &environment.IsActive, &createdAt)
	if err != nil {
		return nil, err
	}
	environment.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)

	return &environment, nil
}

func UpdateEnvironment(environment *models.Environment) error {
	query := `
		UPDATE environments 
		SET name = ?, variables = ?, is_active = ?
		WHERE id = ?
	`

	_, err := DB.Exec(query, environment.Name, environment.Variables, environment.IsActive, environment.ID)
	return err
}

func DeleteEnvironment(id int) error {
	query := `DELETE FROM environments WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

func GetActiveEnvironment() (*models.Environment, error) {
	query := `SELECT id, name, variables, is_active, created_at FROM environments WHERE is_active = 1 LIMIT 1`
	row := DB.QueryRow(query)

	var environment models.Environment
	var createdAt string
	err := row.Scan(&environment.ID, &environment.Name, &environment.Variables, &environment.IsActive, &createdAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No active environment
		}
		return nil, err
	}
	environment.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)

	return &environment, nil
}

func SetActiveEnvironment(id int) error {
	// First, set all environments to inactive
	_, err := DB.Exec("UPDATE environments SET is_active = 0")
	if err != nil {
		return err
	}

	// Then, set the specified environment to active
	_, err = DB.Exec("UPDATE environments SET is_active = 1 WHERE id = ?", id)
	return err
}