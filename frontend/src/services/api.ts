// Real Wails API bindings
// This file will use the actual Wails runtime to call Go backend methods

import type { 
  Collection, 
  Folder, 
  Request, 
  Environment, 
  RequestHistory, 
  APIResponse 
} from '@/types';

// Import Wails v3 bindings
import { APIClientService } from '../../bindings/apiclient/backend/services/index.js';

// Real API service using Wails
export class APIService {
  
  // Collections
  async createCollection(name: string, description: string): Promise<Collection> {
    const result = await APIClientService.CreateCollection(name, description);
    if (!result) throw new Error('Failed to create collection');
    return result;
  }

  async getCollections(): Promise<Collection[]> {
    const result = await APIClientService.GetCollections();
    return result.filter(c => c !== null) as Collection[];
  }

  async getCollection(id: number): Promise<Collection | null> {
    return await APIClientService.GetCollection(id);
  }

  async updateCollection(id: number, name: string, description: string): Promise<Collection> {
    const result = await APIClientService.UpdateCollection(id, name, description);
    if (!result) throw new Error('Failed to update collection');
    return result;
  }

  async deleteCollection(id: number): Promise<void> {
    await APIClientService.DeleteCollection(id);
  }

  // Folders
  async createFolder(name: string, collectionId: number, parentFolderId?: number): Promise<Folder> {
    const result = await APIClientService.CreateFolder(name, collectionId, parentFolderId || null);
    if (!result) throw new Error('Failed to create folder');
    return result;
  }

  async getFolders(): Promise<Folder[]> {
    const result = await APIClientService.GetFolders();
    return result.filter(f => f !== null) as Folder[];
  }

  async getFolder(id: number): Promise<Folder | null> {
    return await APIClientService.GetFolder(id);
  }

  async updateFolder(id: number, name: string, collectionId: number, parentFolderId?: number): Promise<Folder> {
    const result = await APIClientService.UpdateFolder(id, name, collectionId, parentFolderId || null);
    if (!result) throw new Error('Failed to update folder');
    return result;
  }

  async deleteFolder(id: number): Promise<void> {
    await APIClientService.DeleteFolder(id);
  }

  async getFoldersByCollection(collectionId: number): Promise<Folder[]> {
    const result = await APIClientService.GetFoldersByCollection(collectionId);
    return result.filter(f => f !== null) as Folder[];
  }

  // Requests
  async createRequest(
    name: string,
    method: string,
    url: string,
    headers: string,
    body: string,
    collectionId?: number,
    folderId?: number
  ): Promise<Request> {
    const result = await APIClientService.CreateRequest(
      name, method, url, headers, body, collectionId || null, folderId || null
    );
    if (!result) throw new Error('Failed to create request');
    return result;
  }

  async getRequests(): Promise<Request[]> {
    const result = await APIClientService.GetRequests();
    return result.filter(r => r !== null) as Request[];
  }

  async getRequest(id: number): Promise<Request | null> {
    return await APIClientService.GetRequest(id);
  }

  async updateRequest(
    id: number,
    name: string,
    method: string,
    url: string,
    headers: string,
    body: string,
    collectionId?: number,
    folderId?: number
  ): Promise<Request> {
    const result = await APIClientService.UpdateRequest(
      id, name, method, url, headers, body, collectionId || null, folderId || null
    );
    if (!result) throw new Error('Failed to update request');
    return result;
  }

  async deleteRequest(id: number): Promise<void> {
    await APIClientService.DeleteRequest(id);
  }

  async getRequestsByCollection(collectionId: number): Promise<Request[]> {
    const result = await APIClientService.GetRequestsByCollection(collectionId);
    return result.filter(r => r !== null) as Request[];
  }

  async getRequestsByFolder(folderId: number): Promise<Request[]> {
    const result = await APIClientService.GetRequestsByFolder(folderId);
    return result.filter(r => r !== null) as Request[];
  }

  // Environments
  async createEnvironment(name: string, variables: string): Promise<Environment> {
    const result = await APIClientService.CreateEnvironment(name, variables);
    if (!result) throw new Error('Failed to create environment');
    return result;
  }

  async getEnvironments(): Promise<Environment[]> {
    const result = await APIClientService.GetEnvironments();
    return result.filter(e => e !== null) as Environment[];
  }

  async getEnvironment(id: number): Promise<Environment | null> {
    return await APIClientService.GetEnvironment(id);
  }

  async updateEnvironment(id: number, name: string, variables: string, isActive: boolean): Promise<Environment> {
    const result = await APIClientService.UpdateEnvironment(id, name, variables, isActive);
    if (!result) throw new Error('Failed to update environment');
    return result;
  }

  async deleteEnvironment(id: number): Promise<void> {
    await APIClientService.DeleteEnvironment(id);
  }

  async getActiveEnvironment(): Promise<Environment | null> {
    return await APIClientService.GetActiveEnvironment();
  }

  // Request History
  async createRequestHistory(
    requestId: number,
    responseStatus: number,
    responseTime: number,
    responseBody: string,
    responseHeaders: string
  ): Promise<RequestHistory> {
    const result = await APIClientService.CreateRequestHistory(
      requestId, responseStatus, responseTime, responseBody, responseHeaders
    );
    if (!result) throw new Error('Failed to create request history');
    return result;
  }

  async getRequestHistory(): Promise<RequestHistory[]> {
    const result = await APIClientService.GetRequestHistory();
    return result.filter(h => h !== null) as RequestHistory[];
  }

  async getRequestHistoryByRequest(requestId: number): Promise<RequestHistory[]> {
    const result = await APIClientService.GetRequestHistoryByRequest(requestId);
    return result.filter(h => h !== null) as RequestHistory[];
  }

  async getRequestHistoryByID(id: number): Promise<RequestHistory | null> {
    return await APIClientService.GetRequestHistoryByID(id);
  }

  async deleteRequestHistory(id: number): Promise<void> {
    await APIClientService.DeleteRequestHistory(id);
  }

  async clearRequestHistory(): Promise<void> {
    await APIClientService.ClearRequestHistory();
  }

  // File operations
  async saveFileToDownloads(filename: string, content: string): Promise<string> {
    return await APIClientService.SaveFileToDownloads(filename, content);
  }

  // Request execution
  async executeRequest(method: string, url: string, headers: string, body: string): Promise<APIResponse> {
    const response = await APIClientService.ExecuteRequest(method, url, headers, body);
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.body,
      responseTime: response.responseTime,
      contentType: response.contentType,
    };
  }
}

// Export singleton instance
export const apiService = new APIService();