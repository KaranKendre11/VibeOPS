/**
 * API client for backend communication with SSE streaming support
 */

export interface StreamEvent {
  type: 'agent_status' | 'text' | 'architecture' | 'deployment_status' | 'error';
  [key: string]: any;
}

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * Stream chat messages with SSE
   */
  async *streamChat(
    message: string,
    conversationHistory: any[] = []
  ): AsyncGenerator<StreamEvent> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        type: 'text',
        metadata: {
          conversation_history: conversationHistory
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const event = JSON.parse(data);
              yield event;
            } catch (e) {
              console.error('Failed to parse SSE data:', data, e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get GCP resources
   */
  async getGCPResources(): Promise<any> {
    const response = await fetch(`${this.baseURL}/gcp/resources`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseURL}/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Singleton instance
export const apiClient = new APIClient();
