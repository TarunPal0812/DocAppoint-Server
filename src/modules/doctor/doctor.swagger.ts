export const doctorSwaggerPaths = {
  '/api/doctor/list': {
    get: {
      summary: 'Get Public Doctor Catalog',
      tags: ['Doctor'],
      responses: {
        200: { description: 'List of doctors' },
      },
    },
  },
  '/api/doctor/login': {
    post: {
      summary: 'Doctor Login',
      tags: ['Doctor'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', example: 'aanya.sharma@docappoint.com' },
                password: { type: 'string', example: 'Doctor@1234' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Doctor login successful' },
        400: { description: 'Invalid credentials' },
      },
    },
  },
  '/api/doctor/appointments': {
    get: {
      summary: 'Get Doctor Appointments',
      tags: ['Doctor'],
      security: [{ DoctorAuth: [] }],
      responses: {
        200: { description: 'List of doctor appointments' },
      },
    },
  },
  '/api/doctor/appointment-complete': {
    post: {
      summary: 'Mark Appointment Complete',
      tags: ['Doctor'],
      security: [{ DoctorAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['appointmentId'],
              properties: { appointmentId: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Appointment marked as completed' },
      },
    },
  },
  '/api/doctor/appointment-cancled': {
    post: {
      summary: 'Cancel Appointment (Doctor)',
      tags: ['Doctor'],
      security: [{ DoctorAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['appointmentId'],
              properties: { appointmentId: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Appointment cancelled' },
      },
    },
  },
  '/api/doctor/dashboard': {
    get: {
      summary: 'Doctor Dashboard Overview',
      tags: ['Doctor'],
      security: [{ DoctorAuth: [] }],
      responses: {
        200: { description: 'Doctor statistics' },
      },
    },
  },
  '/api/doctor/profile': {
    get: {
      summary: 'Get Doctor Profile',
      tags: ['Doctor'],
      security: [{ DoctorAuth: [] }],
      responses: {
        200: { description: 'Doctor profile' },
      },
    },
  },
  '/api/doctor/update-profile': {
    post: {
      summary: 'Update Doctor Profile',
      tags: ['Doctor'],
      security: [{ DoctorAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                fees: { type: 'number' },
                available: { type: 'boolean' },
                address: { type: 'object' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Profile updated' },
      },
    },
  },
};
