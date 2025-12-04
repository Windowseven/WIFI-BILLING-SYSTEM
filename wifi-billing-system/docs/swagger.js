// Temporary fallback swagger specs (replace when swagger-jsdoc is available)
const specs = {
    openapi: '3.0.0',
    info: {
        title: 'WiFi Billing System API',
        version: '1.0.0',
        description: 'A comprehensive WiFi billing system with voucher-based authentication',
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 5000}`,
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        '/': {
            get: {
                summary: 'API Root',
                responses: {
                    '200': {
                        description: 'API information'
                    }
                }
            }
        },
        '/health': {
            get: {
                summary: 'Health Check',
                responses: {
                    '200': {
                        description: 'System health status'
                    }
                }
            }
        }
    }
};

module.exports = specs;
