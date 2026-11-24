export const aiSwaggerPaths = {
  '/api/ai/chat': {
    post: {
      summary: 'Send a message to the AI Clinical Assistant',
      tags: ['AI Assistant'],
      parameters: [
        {
          name: 'token',
          in: 'header',
          required: false,
          schema: { type: 'string' },
          description: 'Optional patient JWT token for authenticated booking',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['message'],
              properties: {
                message: {
                  type: 'string',
                  example: 'I have a high fever and headache. Can you recommend a doctor?',
                },
                session_id: {
                  type: 'string',
                  example: 'patient-session-101',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Triaged AI response with optional doctor tools and slot advice',
        },
        503: {
          description: 'AI Agent service unavailable',
        },
      },
    },
  },
  '/api/ai/health': {
    get: {
      summary: 'Check status of AI Agent service',
      tags: ['AI Assistant'],
      responses: {
        200: {
          description: 'Health status response',
        },
      },
    },
  },
  '/api/ai/history/{sessionId}': {
    get: {
      summary: 'Get conversation history for a session',
      tags: ['AI Assistant'],
      parameters: [
        {
          name: 'sessionId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'History list',
        },
      },
    },
  },
};
