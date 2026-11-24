import { AiService } from './ai.service';
import { AppError } from '../../utils/AppError';

describe('AiService', () => {
  let aiService: AiService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    aiService = new AiService();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should successfully return AI chat response when agent responds ok', async () => {
      const mockResponse = {
        response: 'Based on symptoms, consult a Dermatologist.',
        session_id: 'sess-123',
        tools_used: [{ name: 'assess_symptoms', args: {} }],
        disclaimer: 'Informational triage only',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await aiService.sendMessage('I have a skin rash', 'sess-123');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      );
    });

    it('should throw AppError 503 when agent service is offline', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connect ECONNREFUSED'));

      await expect(aiService.sendMessage('I have a skin rash', 'sess-123')).rejects.toThrow(
        AppError,
      );
    });
  });

  describe('getHealth', () => {
    it('should return status ok when agent is healthy', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', service: 'docappoint-ai-agent' }),
      });

      const result = await aiService.getHealth();
      expect(result.status).toBe('ok');
    });

    it('should return status offline when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const result = await aiService.getHealth();
      expect(result.status).toBe('offline');
    });
  });
});
