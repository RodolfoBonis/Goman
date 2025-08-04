import type { APIResponse, KeyValue } from '@/types';

export class ResponseChaining {
  /**
   * Extrai valores de uma resposta para usar em requisições subsequentes
   */
  static extractValues(response: APIResponse): Record<string, string> {
    const values: Record<string, string> = {};
    
    try {
      // Extrair valores do body JSON
      if (response.contentType.includes('application/json')) {
        const body = JSON.parse(response.body);
        this.extractFromObject(body, '', values);
      }
      
      // Extrair valores dos headers
      const headers = JSON.parse(response.headers);
      headers.forEach((header: KeyValue) => {
        if (header.key && header.value) {
          values[`header.${header.key}`] = header.value;
        }
      });
      
      // Valores especiais
      values['status'] = response.status.toString();
      values['responseTime'] = response.responseTime.toString();
      values['contentType'] = response.contentType;
      
    } catch (error) {
      console.error('Failed to extract values from response:', error);
    }
    
    return values;
  }

  /**
   * Aplica valores extraídos de uma resposta a uma nova requisição
   */
  static applyResponseValues(
    requestData: {
      url?: string;
      headers?: string;
      body?: string;
    },
    responseValues: Record<string, string>
  ): {
    url: string;
    headers: string;
    body: string;
  } {
    let url = requestData.url || '';
    let headers = requestData.headers || '{}';
    let body = requestData.body || '';

    // Aplicar valores à URL
    Object.entries(responseValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      url = url.replace(new RegExp(placeholder, 'g'), value);
    });

    // Aplicar valores aos headers
    try {
      const headersObj = JSON.parse(headers);
      const updatedHeaders = headersObj.map((header: KeyValue) => {
        if (header.value && typeof header.value === 'string') {
          let updatedValue = header.value;
          Object.entries(responseValues).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            updatedValue = updatedValue.replace(new RegExp(placeholder, 'g'), value);
          });
          return { ...header, value: updatedValue };
        }
        return header;
      });
      headers = JSON.stringify(updatedHeaders);
    } catch (error) {
      console.error('Failed to apply values to headers:', error);
    }

    // Aplicar valores ao body
    Object.entries(responseValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    return { url, headers, body };
  }

  /**
   * Gera sugestões de placeholders baseados na resposta
   */
  static generatePlaceholderSuggestions(response: APIResponse): string[] {
    const suggestions: string[] = [];
    
    try {
      // Sugestões básicas
      suggestions.push('status', 'responseTime', 'contentType');
      
      // Sugestões de headers
      const headers = JSON.parse(response.headers);
      headers.forEach((header: KeyValue) => {
        if (header.key) {
          suggestions.push(`header.${header.key}`);
        }
      });
      
      // Sugestões do body JSON
      if (response.contentType.includes('application/json')) {
        const body = JSON.parse(response.body);
        this.generateJsonSuggestions(body, '', suggestions);
      }
      
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
    
    return suggestions;
  }

  private static extractFromObject(
    obj: any, 
    prefix: string, 
    values: Record<string, string>
  ) {
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          values[fullKey] = String(value);
        } else if (typeof value === 'object') {
          this.extractFromObject(value, fullKey, values);
        }
      });
    }
  }

  private static generateJsonSuggestions(
    obj: any, 
    prefix: string, 
    suggestions: string[]
  ) {
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          suggestions.push(fullKey);
        } else if (typeof value === 'object') {
          this.generateJsonSuggestions(value, fullKey, suggestions);
        }
      });
    }
  }
} 