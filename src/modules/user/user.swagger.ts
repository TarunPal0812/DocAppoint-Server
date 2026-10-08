export const userSwaggerPaths = {
  '/api/user/register': {
    post: {
      summary: 'Register User',
      tags: ['User'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', example: 'Tarun Pal' },
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'User@1234' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'User registered successfully' },
        400: { description: 'Validation failed or email exists' },
      },
    },
  },
  '/api/user/login': {
    post: {
      summary: 'User Login',
      tags: ['User'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'User@1234' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Login successful' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
  '/api/user/get-profile': {
    get: {
      summary: 'Get User Profile',
      tags: ['User'],
      security: [{ UserAuth: [] }],
      responses: {
        200: { description: 'User profile data' },
      },
    },
  },
  '/api/user/update-profile': {
    post: {
      summary: 'Update User Profile',
      tags: ['User'],
      security: [{ UserAuth: [] }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string', example: '{"line1":"123 St"}' },
                dob: { type: 'string' },
                gender: { type: 'string' },
                image: { type: 'string', format: 'binary' },
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
  '/api/user/book-appointment': {
    post: {
      summary: 'Book Appointment',
      tags: ['User'],
      security: [{ UserAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['docId', 'slotDate', 'slotTime'],
              properties: {
                docId: { type: 'string' },
                slotDate: { type: 'string', example: '20_10_2026' },
                slotTime: { type: 'string', example: '10:00 AM' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Appointment booked' },
      },
    },
  },
  '/api/user/appointments': {
    get: {
      summary: 'List User Appointments',
      tags: ['User'],
      security: [{ UserAuth: [] }],
      responses: {
        200: { description: 'List of user appointments' },
      },
    },
  },
  '/api/user/cancle-appointment': {
    post: {
      summary: 'Cancel Appointment (User)',
      tags: ['User'],
      security: [{ UserAuth: [] }],
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
  '/api/user/payment-razorpay': {
    post: {
      summary: 'Create Razorpay Payment Order',
      tags: ['User'],
      security: [{ UserAuth: [] }],
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
        200: { description: 'Razorpay order created' },
      },
    },
  },
  '/api/user/verifyRazorpay': {
    post: {
      summary: 'Verify Razorpay Payment',
      tags: ['User'],
      security: [{ UserAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['razorpay_order_id'],
              properties: { razorpay_order_id: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Payment verification status' },
      },
    },
  },
  '/api/user/refund-payment': {
    post: {
      summary: 'Refund Razorpay Payment',
      tags: ['User'],
      security: [{ UserAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['razorpay_payment_id'],
              properties: { razorpay_payment_id: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Refund status' },
      },
    },
  },
};
