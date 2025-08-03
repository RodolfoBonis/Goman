package services

import (
	"apiclient/backend/database"
	"apiclient/backend/models"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"
)

// APIClientService provides the main API for the frontend
type APIClientService struct{}

// Collection methods
func (s *APIClientService) CreateCollection(name, description string) (*models.Collection, error) {
	collection := &models.Collection{
		Name:        name,
		Description: description,
	}
	
	err := database.CreateCollection(collection)
	if err != nil {
		return nil, err
	}
	
	return collection, nil
}

func (s *APIClientService) GetCollections() ([]*models.Collection, error) {
	return database.GetCollections()
}

func (s *APIClientService) GetCollection(id int) (*models.Collection, error) {
	return database.GetCollection(id)
}

func (s *APIClientService) UpdateCollection(id int, name, description string) (*models.Collection, error) {
	collection := &models.Collection{
		ID:          id,
		Name:        name,
		Description: description,
	}
	
	err := database.UpdateCollection(collection)
	if err != nil {
		return nil, err
	}
	
	return collection, nil
}

func (s *APIClientService) DeleteCollection(id int) error {
	return database.DeleteCollection(id)
}

// Folder methods
func (s *APIClientService) CreateFolder(name string, collectionID int, parentFolderID *int) (*models.Folder, error) {
	folder := &models.Folder{
		Name:           name,
		CollectionID:   collectionID,
		ParentFolderID: parentFolderID,
	}
	
	err := database.CreateFolder(folder)
	if err != nil {
		return nil, err
	}
	
	return folder, nil
}

func (s *APIClientService) GetFolders() ([]*models.Folder, error) {
	return database.GetFolders()
}

func (s *APIClientService) GetFolder(id int) (*models.Folder, error) {
	return database.GetFolder(id)
}

func (s *APIClientService) UpdateFolder(id int, name string, collectionID int, parentFolderID *int) (*models.Folder, error) {
	folder := &models.Folder{
		ID:             id,
		Name:           name,
		CollectionID:   collectionID,
		ParentFolderID: parentFolderID,
	}
	
	err := database.UpdateFolder(folder)
	if err != nil {
		return nil, err
	}
	
	return folder, nil
}

func (s *APIClientService) DeleteFolder(id int) error {
	return database.DeleteFolder(id)
}

func (s *APIClientService) GetFoldersByCollection(collectionID int) ([]*models.Folder, error) {
	return database.GetFoldersByCollection(collectionID)
}

// Request methods
func (s *APIClientService) CreateRequest(name, method, url, headers, body string, collectionID, folderID *int) (*models.Request, error) {
	request := &models.Request{
		Name:         name,
		Method:       method,
		URL:          url,
		Headers:      headers,
		Body:         body,
		CollectionID: collectionID,
		FolderID:     folderID,
	}
	
	err := database.CreateRequest(request)
	if err != nil {
		return nil, err
	}
	
	return request, nil
}

func (s *APIClientService) GetRequests() ([]*models.Request, error) {
	return database.GetRequests()
}

func (s *APIClientService) GetRequest(id int) (*models.Request, error) {
	return database.GetRequest(id)
}

func (s *APIClientService) UpdateRequest(id int, name, method, url, headers, body string, collectionID, folderID *int) (*models.Request, error) {
	request := &models.Request{
		ID:           id,
		Name:         name,
		Method:       method,
		URL:          url,
		Headers:      headers,
		Body:         body,
		CollectionID: collectionID,
		FolderID:     folderID,
	}
	
	err := database.UpdateRequest(request)
	if err != nil {
		return nil, err
	}
	
	return request, nil
}

func (s *APIClientService) DeleteRequest(id int) error {
	return database.DeleteRequest(id)
}

func (s *APIClientService) GetRequestsByCollection(collectionID int) ([]*models.Request, error) {
	return database.GetRequestsByCollection(collectionID)
}

func (s *APIClientService) GetRequestsByFolder(folderID int) ([]*models.Request, error) {
	return database.GetRequestsByFolder(folderID)
}

// Environment methods
func (s *APIClientService) CreateEnvironment(name, variables string) (*models.Environment, error) {
	environment := &models.Environment{
		Name:      name,
		Variables: variables,
	}
	
	err := database.CreateEnvironment(environment)
	if err != nil {
		return nil, err
	}
	
	return environment, nil
}

func (s *APIClientService) GetEnvironments() ([]*models.Environment, error) {
	return database.GetEnvironments()
}

func (s *APIClientService) GetEnvironment(id int) (*models.Environment, error) {
	return database.GetEnvironment(id)
}

func (s *APIClientService) UpdateEnvironment(id int, name, variables string, isActive bool) (*models.Environment, error) {
	environment := &models.Environment{
		ID:        id,
		Name:      name,
		Variables: variables,
		IsActive:  isActive,
	}
	
	err := database.UpdateEnvironment(environment)
	if err != nil {
		return nil, err
	}
	
	// If this environment is set to active, update the active environment in the database
	if isActive {
		err = database.SetActiveEnvironment(id)
		if err != nil {
			return nil, err
		}
	}
	
	return environment, nil
}

func (s *APIClientService) DeleteEnvironment(id int) error {
	return database.DeleteEnvironment(id)
}

func (s *APIClientService) GetActiveEnvironment() (*models.Environment, error) {
	return database.GetActiveEnvironment()
}

// RequestHistory methods
func (s *APIClientService) CreateRequestHistory(requestID, responseStatus, responseTime int, responseBody, responseHeaders string) (*models.RequestHistory, error) {
	history := &models.RequestHistory{
		RequestID:       requestID,
		ResponseStatus:  responseStatus,
		ResponseTime:    responseTime,
		ResponseBody:    responseBody,
		ResponseHeaders: responseHeaders,
	}
	
	err := database.CreateRequestHistory(history)
	if err != nil {
		return nil, err
	}
	
	return history, nil
}

func (s *APIClientService) GetRequestHistory() ([]*models.RequestHistory, error) {
	return database.GetRequestHistory()
}

func (s *APIClientService) GetRequestHistoryByRequest(requestID int) ([]*models.RequestHistory, error) {
	return database.GetRequestHistoryByRequest(requestID)
}

func (s *APIClientService) GetRequestHistoryByID(id int) (*models.RequestHistory, error) {
	return database.GetRequestHistoryByID(id)
}

func (s *APIClientService) DeleteRequestHistory(id int) error {
	return database.DeleteRequestHistory(id)
}

func (s *APIClientService) ClearRequestHistory() error {
	return database.ClearRequestHistory()
}

// ExecuteRequest sends an HTTP request and returns the response
func (s *APIClientService) ExecuteRequest(method, url, headers, body string) (map[string]interface{}, error) {
	// Replace environment variables in the URL
	activeEnv, err := database.GetActiveEnvironment()
	if err != nil {
		return nil, err
	}
	
	if activeEnv != nil {
		// Parse environment variables
		var vars map[string]string
		err = json.Unmarshal([]byte(activeEnv.Variables), &vars)
		if err != nil {
			return nil, err
		}
		
		// Replace variables in URL
		for key, value := range vars {
			url = strings.ReplaceAll(url, "{{"+key+"}}", value)
		}
	}
	
	// Create HTTP request
	req, err := http.NewRequest(method, url, strings.NewReader(body))
	if err != nil {
		return nil, err
	}
	
	// Add headers
	if headers != "" {
		var headerMap map[string]string
		err = json.Unmarshal([]byte(headers), &headerMap)
		if err != nil {
			return nil, err
		}
		
		for key, value := range headerMap {
			req.Header.Set(key, value)
		}
	}
	
	// Record start time
	startTime := time.Now()
	
	// Execute request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	// Calculate response time
	responseTime := time.Since(startTime).Milliseconds()
	
	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	// Convert headers to JSON string
	headerBytes, err := json.Marshal(resp.Header)
	if err != nil {
		return nil, err
	}
	
	// Prepare response data
	responseData := map[string]interface{}{
		"status":         resp.StatusCode,
		"statusText":     resp.Status,
		"headers":        string(headerBytes),
		"body":           string(respBody),
		"responseTime":   responseTime,
		"contentType":    resp.Header.Get("Content-Type"),
	}
	
	return responseData, nil
}