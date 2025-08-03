package database

import (
	"apiclient/backend/models"
	"time"
)

// RequestHistory operations
func CreateRequestHistory(history *models.RequestHistory) error {
	query := `
		INSERT INTO request_history (request_id, response_status, response_time, response_body, response_headers) 
		VALUES (?, ?, ?, ?, ?)
		RETURNING id, executed_at
	`

	var id int
	var executedAt string
	err := DB.QueryRow(query, history.RequestID, history.ResponseStatus, history.ResponseTime, history.ResponseBody, history.ResponseHeaders).Scan(&id, &executedAt)
	if err != nil {
		return err
	}

	history.ID = id
	history.ExecutedAt, _ = time.Parse("2006-01-02 15:04:05", executedAt)
	return nil
}

func GetRequestHistory() ([]*models.RequestHistory, error) {
	query := `SELECT id, request_id, response_status, response_time, response_body, response_headers, executed_at FROM request_history ORDER BY executed_at DESC`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var histories []*models.RequestHistory
	for rows.Next() {
		var history models.RequestHistory
		var executedAt string
		err := rows.Scan(&history.ID, &history.RequestID, &history.ResponseStatus, &history.ResponseTime, &history.ResponseBody, &history.ResponseHeaders, &executedAt)
		if err != nil {
			return nil, err
		}
		history.ExecutedAt, _ = time.Parse("2006-01-02 15:04:05", executedAt)
		histories = append(histories, &history)
	}

	return histories, nil
}

func GetRequestHistoryByRequest(requestID int) ([]*models.RequestHistory, error) {
	query := `SELECT id, request_id, response_status, response_time, response_body, response_headers, executed_at FROM request_history WHERE request_id = ? ORDER BY executed_at DESC`
	rows, err := DB.Query(query, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var histories []*models.RequestHistory
	for rows.Next() {
		var history models.RequestHistory
		var executedAt string
		err := rows.Scan(&history.ID, &history.RequestID, &history.ResponseStatus, &history.ResponseTime, &history.ResponseBody, &history.ResponseHeaders, &executedAt)
		if err != nil {
			return nil, err
		}
		history.ExecutedAt, _ = time.Parse("2006-01-02 15:04:05", executedAt)
		histories = append(histories, &history)
	}

	return histories, nil
}

func GetRequestHistoryByID(id int) (*models.RequestHistory, error) {
	query := `SELECT id, request_id, response_status, response_time, response_body, response_headers, executed_at FROM request_history WHERE id = ?`
	row := DB.QueryRow(query, id)

	var history models.RequestHistory
	var executedAt string
	err := row.Scan(&history.ID, &history.RequestID, &history.ResponseStatus, &history.ResponseTime, &history.ResponseBody, &history.ResponseHeaders, &executedAt)
	if err != nil {
		return nil, err
	}
	history.ExecutedAt, _ = time.Parse("2006-01-02 15:04:05", executedAt)

	return &history, nil
}

func DeleteRequestHistory(id int) error {
	query := `DELETE FROM request_history WHERE id = ?`
	_, err := DB.Exec(query, id)
	return err
}

func ClearRequestHistory() error {
	query := `DELETE FROM request_history`
	_, err := DB.Exec(query)
	return err
}