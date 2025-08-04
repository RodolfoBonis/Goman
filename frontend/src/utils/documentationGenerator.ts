import type { Collection, Request, Environment } from '@/types';

export interface APIDocumentation {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
  endpoints: EndpointDocumentation[];
  schemas: SchemaDocumentation[];
}

export interface EndpointDocumentation {
  name: string;
  method: string;
  path: string;
  description: string;
  parameters: ParameterDocumentation[];
  requestBody?: RequestBodyDocumentation;
  responses: ResponseDocumentation[];
  examples: ExampleDocumentation[];
}

export interface ParameterDocumentation {
  name: string;
  type: 'query' | 'path' | 'header';
  required: boolean;
  description: string;
  example?: string;
}

export interface RequestBodyDocumentation {
  contentType: string;
  schema: any;
  example?: string;
}

export interface ResponseDocumentation {
  statusCode: number;
  description: string;
  contentType: string;
  schema?: any;
  example?: string;
}

export interface ExampleDocumentation {
  name: string;
  request: {
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
}

export interface SchemaDocumentation {
  name: string;
  type: string;
  properties: Record<string, any>;
  required: string[];
  example?: any;
}

export class DocumentationGenerator {
  /**
   * Gera documentação completa de uma collection
   */
  static generateFromCollection(
    collection: Collection,
    requests: Request[],
    environment?: Environment
  ): APIDocumentation {
    const collectionRequests = requests.filter(r => r.collection_id === collection.id);
    
    // Extrair base URL da primeira requisição
    const baseUrl = this.extractBaseUrl(collectionRequests[0]?.url || '');
    
    // Gerar documentação de endpoints
    const endpoints = collectionRequests.map(request => 
      this.generateEndpointDocumentation(request, environment)
    );

    // Gerar schemas baseados nos responses
    const schemas = this.generateSchemas(collectionRequests);

    return {
      title: collection.name,
      description: collection.description || `API documentation for ${collection.name}`,
      version: '1.0.0',
      baseUrl,
      endpoints,
      schemas,
    };
  }

  /**
   * Gera documentação de um endpoint específico
   */
  static generateEndpointDocumentation(
    request: Request,
    environment?: Environment
  ): EndpointDocumentation {
    const url = new URL(request.url || 'http://example.com');
    const path = url.pathname;
    
    // Extrair parâmetros da URL
    const pathParams = this.extractPathParameters(path);
    const queryParams = this.extractQueryParameters(request.url || '');
    
    // Gerar parâmetros
    const parameters: ParameterDocumentation[] = [
      ...pathParams.map(param => ({
        name: param,
        type: 'path' as const,
        required: true,
        description: `Path parameter: ${param}`,
        example: `{${param}}`,
      })),
      ...queryParams.map(param => ({
        name: param.name,
        type: 'query' as const,
        required: false,
        description: `Query parameter: ${param.name}`,
        example: param.value,
      })),
    ];

    // Adicionar headers como parâmetros
    try {
      const headers = JSON.parse(request.headers);
      headers.forEach((header: any) => {
        if (header.key && header.key.toLowerCase() !== 'content-type') {
          parameters.push({
            name: header.key,
            type: 'header',
            required: false,
            description: `Header: ${header.key}`,
            example: header.value,
          });
        }
      });
    } catch (error) {
      console.error('Failed to parse headers:', error);
    }

    // Gerar request body
    let requestBody: RequestBodyDocumentation | undefined;
    if (request.body && request.body.trim()) {
      try {
        const body = JSON.parse(request.body);
        requestBody = {
          contentType: 'application/json',
          schema: this.generateSchemaFromObject(body),
          example: request.body,
        };
      } catch {
        requestBody = {
          contentType: 'text/plain',
          schema: { type: 'string' },
          example: request.body,
        };
      }
    }

    // Gerar responses
    const responses: ResponseDocumentation[] = [
      {
        statusCode: 200,
        description: 'Successful response',
        contentType: 'application/json',
        schema: { type: 'object' },
      },
      {
        statusCode: 400,
        description: 'Bad request',
        contentType: 'application/json',
        schema: { type: 'object' },
      },
      {
        statusCode: 500,
        description: 'Internal server error',
        contentType: 'application/json',
        schema: { type: 'object' },
      },
    ];

    // Gerar exemplos
    const examples: ExampleDocumentation[] = [
      {
        name: 'Basic Example',
        request: {
          url: this.applyEnvironmentVariables(request.url || '', environment),
          headers: this.parseHeaders(request.headers),
          body: request.body || undefined,
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: '{"message": "Success"}',
        },
      },
    ];

    return {
      name: request.name,
      method: request.method,
      path,
      description: request.name,
      parameters,
      requestBody,
      responses,
      examples,
    };
  }

  /**
   * Gera schemas baseados nos responses das requisições
   */
  static generateSchemas(requests: Request[]): SchemaDocumentation[] {
    const schemas: SchemaDocumentation[] = [];
    
    requests.forEach(request => {
      // Aqui você poderia analisar responses reais se disponíveis
      // Por enquanto, criamos schemas básicos baseados no nome da requisição
      const schemaName = this.generateSchemaName(request.name);
      
      schemas.push({
        name: schemaName,
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique identifier' },
          name: { type: 'string', description: 'Name of the resource' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        },
        required: ['id', 'name'],
        example: {
          id: '123',
          name: 'Example Resource',
          createdAt: '2024-01-01T00:00:00Z',
        },
      });
    });

    return schemas;
  }

  /**
   * Gera documentação em formato Markdown
   */
  static generateMarkdown(doc: APIDocumentation): string {
    let markdown = `# ${doc.title}\n\n`;
    markdown += `${doc.description}\n\n`;
    markdown += `**Base URL:** \`${doc.baseUrl}\`\n`;
    markdown += `**Version:** ${doc.version}\n\n`;

    // TOC
    markdown += `## Table of Contents\n\n`;
    doc.endpoints.forEach(endpoint => {
      markdown += `- [${endpoint.name}](#${endpoint.name.toLowerCase().replace(/\s+/g, '-')})\n`;
    });
    markdown += `\n`;

    // Endpoints
    markdown += `## Endpoints\n\n`;
    doc.endpoints.forEach(endpoint => {
      markdown += this.generateEndpointMarkdown(endpoint);
    });

    // Schemas
    if (doc.schemas.length > 0) {
      markdown += `## Schemas\n\n`;
      doc.schemas.forEach(schema => {
        markdown += this.generateSchemaMarkdown(schema);
      });
    }

    return markdown;
  }

  /**
   * Gera documentação em formato OpenAPI/Swagger
   */
  static generateOpenAPI(doc: APIDocumentation): any {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: doc.title,
        description: doc.description,
        version: doc.version,
      },
      servers: [
        {
          url: doc.baseUrl,
          description: 'Production server',
        },
      ],
      paths: {},
      components: {
        schemas: {},
      },
    };

    // Adicionar paths
    doc.endpoints.forEach(endpoint => {
      const path = endpoint.path;
      if (!openapi.paths[path]) {
        openapi.paths[path] = {};
      }

      openapi.paths[path][endpoint.method.toLowerCase()] = {
        summary: endpoint.name,
        description: endpoint.description,
        parameters: endpoint.parameters.map(param => ({
          name: param.name,
          in: param.type,
          required: param.required,
          description: param.description,
          schema: { type: 'string' },
          example: param.example,
        })),
        requestBody: endpoint.requestBody ? {
          content: {
            [endpoint.requestBody.contentType]: {
              schema: endpoint.requestBody.schema,
              example: endpoint.requestBody.example,
            },
          },
        } : undefined,
        responses: endpoint.responses.reduce((acc, response) => {
          acc[response.statusCode] = {
            description: response.description,
            content: {
              [response.contentType]: {
                schema: response.schema || { type: 'object' },
                example: response.example,
              },
            },
          };
          return acc;
        }, {} as Record<string, any>),
      };
    });

    // Adicionar schemas
    doc.schemas.forEach(schema => {
      openapi.components.schemas[schema.name] = {
        type: schema.type,
        properties: schema.properties,
        required: schema.required,
        example: schema.example,
      };
    });

    return openapi;
  }

  private static extractBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return 'http://api.example.com';
    }
  }

  private static extractPathParameters(path: string): string[] {
    const matches = path.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  private static extractQueryParameters(url: string): Array<{ name: string; value: string }> {
    try {
      const urlObj = new URL(url);
      return Array.from(urlObj.searchParams.entries()).map(([name, value]) => ({
        name,
        value,
      }));
    } catch {
      return [];
    }
  }

  private static applyEnvironmentVariables(text: string, environment?: Environment): string {
    if (!environment) return text;
    
    try {
      const variables = JSON.parse(environment.variables);
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        text = text.replace(new RegExp(placeholder, 'g'), value as string);
      });
    } catch (error) {
      console.error('Failed to apply environment variables:', error);
    }
    
    return text;
  }

  private static parseHeaders(headersJson: string): Record<string, string> {
    try {
      const headers = JSON.parse(headersJson);
      return headers.reduce((acc: Record<string, string>, header: any) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});
    } catch {
      return {};
    }
  }

  private static generateSchemaFromObject(obj: any): any {
    if (typeof obj === 'string') return { type: 'string' };
    if (typeof obj === 'number') return { type: 'number' };
    if (typeof obj === 'boolean') return { type: 'boolean' };
    if (Array.isArray(obj)) return { type: 'array', items: this.generateSchemaFromObject(obj[0] || {}) };
    if (typeof obj === 'object' && obj !== null) {
      const properties: Record<string, any> = {};
      Object.entries(obj).forEach(([key, value]) => {
        properties[key] = this.generateSchemaFromObject(value);
      });
      return { type: 'object', properties };
    }
    return { type: 'object' };
  }

  private static generateSchemaName(requestName: string): string {
    return requestName
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[a-z]/, (match) => match.toUpperCase()) + 'Response';
  }

  private static generateEndpointMarkdown(endpoint: EndpointDocumentation): string {
    let markdown = `### ${endpoint.name}\n\n`;
    markdown += `**${endpoint.method}** \`${endpoint.path}\`\n\n`;
    markdown += `${endpoint.description}\n\n`;

    if (endpoint.parameters.length > 0) {
      markdown += `#### Parameters\n\n`;
      markdown += `| Name | Type | Required | Description | Example |\n`;
      markdown += `|------|------|----------|-------------|--------|\n`;
      endpoint.parameters.forEach(param => {
        markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} | \`${param.example || '-'}\` |\n`;
      });
      markdown += `\n`;
    }

    if (endpoint.requestBody) {
      markdown += `#### Request Body\n\n`;
      markdown += `**Content Type:** \`${endpoint.requestBody.contentType}\`\n\n`;
      markdown += `\`\`\`json\n${endpoint.requestBody.example}\n\`\`\`\n\n`;
    }

    markdown += `#### Responses\n\n`;
    endpoint.responses.forEach(response => {
      markdown += `**${response.statusCode}** - ${response.description}\n\n`;
      if (response.example) {
        markdown += `\`\`\`json\n${response.example}\n\`\`\`\n\n`;
      }
    });

    return markdown;
  }

  private static generateSchemaMarkdown(schema: SchemaDocumentation): string {
    let markdown = `### ${schema.name}\n\n`;
    markdown += `**Type:** \`${schema.type}\`\n\n`;

    if (Object.keys(schema.properties).length > 0) {
      markdown += `#### Properties\n\n`;
      markdown += `| Name | Type | Required | Description |\n`;
      markdown += `|------|------|----------|-------------|\n`;
      Object.entries(schema.properties).forEach(([name, prop]) => {
        const isRequired = schema.required.includes(name);
        markdown += `| ${name} | ${prop.type} | ${isRequired ? 'Yes' : 'No'} | ${prop.description || '-'} |\n`;
      });
      markdown += `\n`;
    }

    if (schema.example) {
      markdown += `#### Example\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(schema.example, null, 2)}\n\`\`\`\n\n`;
    }

    return markdown;
  }
} 