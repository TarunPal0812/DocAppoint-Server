export const paymentSwaggerPaths = {
  '/api/payment/create-order': {
    post: {
      summary: 'Create Razorpay Payment Order',
      tags: ['Payment'],
      security: [{ UserAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['appointmentId'],
              properties: {
                appointmentId: { type: 'string', example: '6735a29b4f1b2c0012a4b001' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Razorpay order created and tracked' },
        400: { description: 'Appointment already paid or cancelled' },
        404: { description: 'Appointment not found' },
      },
    },
  },
  '/api/payment/verify': {
    post: {
      summary: 'Verify Razorpay Payment Signature',
      tags: ['Payment'],
      security: [{ UserAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
              properties: {
                razorpay_order_id: { type: 'string', example: 'order_EKfwwadQn02enC' },
                razorpay_payment_id: { type: 'string', example: 'pay_29QQoUBi66xm2f' },
                razorpay_signature: { type: 'string', example: '9ef47601449ac0f27b47...6f9b2d' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Payment verified and appointment confirmed' },
        400: { description: 'Invalid signature or parameters' },
      },
    },
  },
  '/api/payment/webhook': {
    post: {
      summary: 'Razorpay Webhook Handler',
      tags: ['Payment'],
      description:
        'Asynchronous webhook processing for payment.captured, payment.failed, and refund.processed',
      parameters: [
        {
          name: 'x-razorpay-signature',
          in: 'header',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                event: { type: 'string', example: 'payment.captured' },
                payload: { type: 'object' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Webhook processed successfully' },
        400: { description: 'Invalid webhook signature' },
      },
    },
  },
  '/api/payment/record-failure': {
    post: {
      summary: 'Record Payment Failure from Client Modal',
      tags: ['Payment'],
      security: [{ UserAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['orderId'],
              properties: {
                orderId: { type: 'string', example: 'order_EKfwwadQn02enC' },
                paymentId: { type: 'string', example: 'pay_29QQoUBi66xm2f' },
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'BAD_REQUEST_ERROR' },
                    description: { type: 'string', example: 'Payment failed at bank gateway' },
                    source: { type: 'string', example: 'bank' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Failure recorded successfully' },
      },
    },
  },
  '/api/payment/history': {
    get: {
      summary: 'Get Patient Payment History',
      tags: ['Payment'],
      security: [{ UserAuth: [] }],
      responses: {
        200: { description: 'List of payment records' },
      },
    },
  },
  '/api/payment/monitoring': {
    get: {
      summary: 'Payment Monitoring and Success/Failure Dashboard',
      tags: ['Payment'],
      security: [{ AdminAuth: [] }],
      responses: {
        200: { description: 'Summary statistics, failure reasons, and recent transactions' },
      },
    },
  },
};
