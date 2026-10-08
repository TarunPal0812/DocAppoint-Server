export const adminSwaggerPaths = {
  '/api/admin/login': {
    post: {
      summary: 'Admin Login',
      tags: ['Admin'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', example: 'admin@docappoint.com' },
                password: { type: 'string', example: 'Admin@1234' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: 'Invalid credentials' },
      },
    },
  },
  '/api/admin/add-doctor': {
    post: {
      summary: 'Add New Doctor',
      tags: ['Admin'],
      security: [{ AdminAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: [
                'name',
                'email',
                'password',
                'speciality',
                'degree',
                'experience',
                'about',
                'fees',
                'address',
                'image',
              ],
              properties: {
                name: { type: 'string', example: 'Dr. Jane Smith' },
                email: { type: 'string', example: 'jane.smith@docappoint.com' },
                password: { type: 'string', example: 'Doctor@1234' },
                speciality: { type: 'string', example: 'Dermatologist' },
                degree: { type: 'string', example: 'MBBS, MD' },
                experience: { type: 'string', example: '3 Years' },
                about: { type: 'string', example: 'Experienced dermatologist' },
                fees: { type: 'number', example: 500 },
                address: { type: 'string', example: '{"line1":"123 St","line2":"City"}' },
                image: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Doctor added successfully' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/admin/all-doctors': {
    get: {
      summary: 'Get All Doctors (Admin)',
      tags: ['Admin'],
      security: [{ AdminAuth: [] }],
      responses: {
        200: { description: 'List of all doctors' },
      },
    },
  },
  '/api/admin/change-availability': {
    post: {
      summary: 'Change Doctor Availability',
      tags: ['Admin'],
      security: [{ AdminAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['docId'],
              properties: { docId: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Availability updated' },
      },
    },
  },
  '/api/admin/appointments': {
    get: {
      summary: 'Get All Appointments (Admin)',
      tags: ['Admin'],
      security: [{ AdminAuth: [] }],
      responses: {
        200: { description: 'List of appointments' },
      },
    },
  },
  '/api/admin/cancel-appointments': {
    post: {
      summary: 'Cancel Appointment (Admin)',
      tags: ['Admin'],
      security: [{ AdminAuth: [] }],
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
  '/api/admin/dashboard': {
    get: {
      summary: 'Admin Dashboard Stats',
      tags: ['Admin'],
      security: [{ AdminAuth: [] }],
      responses: {
        200: { description: 'Dashboard metrics' },
      },
    },
  },
};
