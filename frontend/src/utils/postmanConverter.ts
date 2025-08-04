import type { 
  PostmanCollection, 
  PostmanItem, 
  Collection, 
  Request, 
  Folder 
} from '@/types';

export class PostmanConverter {
  /**
   * Converte uma collection do Postman para o formato interno
   */
  static importFromPostman(postmanCollection: PostmanCollection): {
    collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>;
    folders: Omit<Folder, 'id' | 'created_at'>[];
    requests: Omit<Request, 'id' | 'created_at' | 'updated_at'>[];
  } {
    const collection = {
      name: postmanCollection.info.name,
      description: postmanCollection.info.description || '',
    };

    const folders: Omit<Folder, 'id' | 'created_at'>[] = [];
    const requests: Omit<Request, 'id' | 'created_at' | 'updated_at'>[] = [];

    // Processar itens recursivamente
    this.processItems(postmanCollection.item, folders, requests);

    return { collection, folders, requests };
  }

  /**
   * Converte collections internas para formato Postman
   */
  static exportToPostman(
    collections: Collection[],
    folders: Folder[],
    requests: Request[],
    selectedCollectionIds?: number[]
  ): PostmanCollection | PostmanCollection[] {
    // Se não foram especificadas collections, exportar todas
    const collectionsToExport = selectedCollectionIds 
      ? collections.filter(c => selectedCollectionIds.includes(c.id))
      : collections;

    if (collectionsToExport.length === 0) {
      throw new Error('No collections found to export');
    }

    // Se apenas uma collection, retornar objeto único
    if (collectionsToExport.length === 1) {
      const collection = collectionsToExport[0];
      const collectionFolders = folders.filter(f => f.collection_id === collection.id);
      const collectionRequests = requests.filter(r => r.collection_id === collection.id);

      const items = this.buildPostmanItems(collectionFolders, collectionRequests);

      return {
        info: {
          name: collection.name,
          description: collection.description,
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        item: items,
      };
    }

    // Se múltiplas collections, retornar array
    return collectionsToExport.map(collection => {
      const collectionFolders = folders.filter(f => f.collection_id === collection.id);
      const collectionRequests = requests.filter(r => r.collection_id === collection.id);

      const items = this.buildPostmanItems(collectionFolders, collectionRequests);

      return {
        info: {
          name: collection.name,
          description: collection.description,
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        item: items,
      };
    });
  }

  private static processItems(
    items: PostmanItem[],
    folders: Omit<Folder, 'id' | 'created_at'>[],
    requests: Omit<Request, 'id' | 'created_at' | 'updated_at'>[],
    parentFolderId?: number
  ) {
    items.forEach(item => {
      if (item.request) {
        // É uma requisição
        const request = {
          name: item.name,
          method: item.request.method as any,
          url: this.extractUrl(item.request.url),
          headers: JSON.stringify(item.request.header || []),
          body: this.extractBody(item.request.body),
          collection_id: undefined, // Será definido pelo caller
          folder_id: parentFolderId,
        };
        requests.push(request);
      } else if (item.item) {
        // É uma pasta
        const folder = {
          name: item.name,
          collection_id: undefined, // Será definido pelo caller
          parent_folder_id: parentFolderId,
        };
        folders.push(folder);

        // Processar itens da pasta - usar o índice da pasta atual
        this.processItems(item.item, folders, requests, folders.length - 1);
      }
    });
  }

  private static buildPostmanItems(
    folders: Folder[],
    requests: Request[]
  ): PostmanItem[] {
    const items: PostmanItem[] = [];

    // Agrupar requests por folder
    const requestsByFolder = new Map<number, Request[]>();
    requests.forEach(request => {
      const folderId = request.folder_id || 0;
      if (!requestsByFolder.has(folderId)) {
        requestsByFolder.set(folderId, []);
      }
      requestsByFolder.get(folderId)!.push(request);
    });

    // Criar itens para requests sem pasta
    const rootRequests = requestsByFolder.get(0) || [];
    rootRequests.forEach(request => {
      items.push({
        name: request.name,
        request: {
          method: request.method,
          header: JSON.parse(request.headers),
          url: request.url,
          body: this.buildPostmanBody(request.body),
        },
      });
    });

    // Criar itens para pastas
    folders.forEach(folder => {
      const folderRequests = requestsByFolder.get(folder.id) || [];
      const folderItems: PostmanItem[] = [];

      folderRequests.forEach(request => {
        folderItems.push({
          name: request.name,
          request: {
            method: request.method,
            header: JSON.parse(request.headers),
            url: request.url,
            body: this.buildPostmanBody(request.body),
          },
        });
      });

      items.push({
        name: folder.name,
        item: folderItems,
      });
    });

    return items;
  }

  private static extractUrl(url: string | { raw: string; host: string[]; path: string[] }): string {
    if (typeof url === 'string') {
      return url;
    }
    return url.raw;
  }

  private static extractBody(body?: {
    mode: string;
    raw?: string;
    formdata?: Array<{ key: string; value: string; type: string }>;
  }): string {
    if (!body) return '';
    
    if (body.mode === 'raw' && body.raw) {
      return body.raw;
    }
    
    if (body.mode === 'formdata' && body.formdata) {
      // Converter formdata para JSON (simplificado)
      const formData = body.formdata.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
      return JSON.stringify(formData);
    }
    
    return '';
  }

  private static buildPostmanBody(body: string): {
    mode: string;
    raw?: string;
  } {
    if (!body) return { mode: 'raw' };
    
    try {
      // Tentar parsear como JSON
      JSON.parse(body);
      return { mode: 'raw', raw: body };
    } catch {
      // Se não for JSON válido, tratar como texto
      return { mode: 'raw', raw: body };
    }
  }
} 