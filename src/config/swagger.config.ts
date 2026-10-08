import { adminSwaggerPaths } from '../modules/admin/admin.swagger';
import { doctorSwaggerPaths } from '../modules/doctor/doctor.swagger';
import { userSwaggerPaths } from '../modules/user/user.swagger';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DocAppointment API Documentation',
    version: '1.0.0',
    description: 'Modular Monolith REST API documentation for DocAppointment Backend',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      AdminAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'atoken',
        description: 'Admin Authorization token',
      },
      DoctorAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'dtoken',
        description: 'Doctor Authorization token',
      },
      UserAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'token',
        description: 'User Authorization token',
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'Root Welcome Endpoint',
        tags: ['System'],
        responses: {
          200: { description: 'Welcome message' },
        },
      },
    },
    '/api/wakeup': {
      get: {
        summary: 'Wakeup Server',
        tags: ['System'],
        responses: {
          200: { description: 'Server is awake' },
        },
      },
    },
    ...adminSwaggerPaths,
    ...doctorSwaggerPaths,
    ...userSwaggerPaths,
  },
};
