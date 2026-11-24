import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

export interface AiChatResponse {
  response: string;
  session_id: string;
  tools_used?: { name: string; args: Record<string, unknown> }[];
  disclaimer?: string;
  emergency?: boolean;
  out_of_domain?: boolean;
}

export class AiService {
  private aiAgentUrl: string;

  constructor() {
    this.aiAgentUrl = process.env.AI_AGENT_URL || 'http://localhost:8000';
  }

  async sendMessage(message: string, sessionId?: string, token?: string): Promise<AiChatResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.token = token;
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.aiAgentUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`AI Agent request failed [${response.status}]: ${errorText}`);
        throw new AppError(
          `AI Agent service returned error: ${response.statusText}`,
          response.status,
        );
      }

      const data = (await response.json()) as AiChatResponse;
      return data;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      const message_err = error instanceof Error ? error.message : 'Unknown connection error';
      logger.error(`Failed to reach AI Agent at ${this.aiAgentUrl}: ${message_err}`);
      throw new AppError(
        'AI Assistant service is currently unavailable. Please ensure the Python agent service is running on port 8000.',
        503,
      );
    }
  }

  async getHistory(sessionId: string): Promise<unknown> {
    try {
      const response = await fetch(`${this.aiAgentUrl}/api/chat/history/${sessionId}`);
      if (!response.ok) {
        return { session_id: sessionId, history: [] };
      }
      return await response.json();
    } catch (error: unknown) {
      const message_err = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Could not fetch history for session ${sessionId}: ${message_err}`);
      return { session_id: sessionId, history: [] };
    }
  }

  async getHealth(): Promise<{ status: string; agent_url: string; details?: unknown }> {
    try {
      const response = await fetch(`${this.aiAgentUrl}/api/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const details = await response.json();
        return { status: 'ok', agent_url: this.aiAgentUrl, details };
      }
      return { status: 'degraded', agent_url: this.aiAgentUrl };
    } catch {
      return { status: 'offline', agent_url: this.aiAgentUrl };
    }
  }

  async getDoctors(speciality?: string): Promise<unknown[]> {
    try {
      const url = speciality
        ? `${this.aiAgentUrl}/api/doctors?speciality=${encodeURIComponent(speciality)}`
        : `${this.aiAgentUrl}/api/doctors`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        return (await response.json()) as unknown[];
      }
      return [];
    } catch {
      return [];
    }
  }
}
