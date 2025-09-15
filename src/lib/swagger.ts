import { createSwaggerSpec } from 'next-swagger-doc';

const apiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Xeno Mini CRM API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Xeno Mini CRM platform',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Customers',
      description: 'Customer management endpoints',
    },
    {
      name: 'Orders',
      description: 'Order management endpoints',
    },
  ],
  paths: {
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Get all customers',
        responses: {
          '200': {
            description: 'List of customers',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Customer',
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal Server Error',
          },
        },
      },
      post: {
        tags: ['Customers'],
        summary: 'Create a new customer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CustomerInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Customer created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Customer',
                },
              },
            },
          },
          '400': {
            description: 'Bad Request',
          },
          '409': {
            description: 'Customer already exists',
          },
          '500': {
            description: 'Internal Server Error',
          },
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get all orders',
        responses: {
          '200': {
            description: 'List of orders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order',
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal Server Error',
          },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create a new order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OrderInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order',
                },
              },
            },
          },
          '400': {
            description: 'Bad Request',
          },
          '404': {
            description: 'Customer not found',
          },
          '500': {
            description: 'Internal Server Error',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Customer: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          phoneNumber: { type: 'string' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
          customerSegment: {
            type: 'string',
            enum: ['new', 'regular', 'vip', 'inactive'],
          },
          totalOrders: { type: 'number' },
          totalSpent: { type: 'number' },
          lastPurchaseDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CustomerInput: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          phoneNumber: { type: 'string' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          customerId: { type: 'string' },
          orderNumber: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                productName: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
          totalAmount: { type: 'number' },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'failed', 'refunded'],
          },
          shippingAddress: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
          orderDate: { type: 'string', format: 'date-time' },
          deliveryDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderInput: {
        type: 'object',
        required: ['customerId', 'items', 'totalAmount'],
        properties: {
          customerId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'productName', 'quantity', 'price'],
              properties: {
                productId: { type: 'string' },
                productName: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
          totalAmount: { type: 'number' },
          shippingAddress: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const getSwaggerSpec = () => createSwaggerSpec(apiConfig);
