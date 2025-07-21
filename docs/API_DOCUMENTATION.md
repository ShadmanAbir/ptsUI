# Production Tracking System API Documentation

## Overview

This document provides information about the API structure for the Production Tracking System. The API is hosted at `http://192.168.1.247:9000/api` and provides endpoints for managing production lines, buyers, styles, orders, and production data.

## API Base URL

- Local Network: `http://192.168.1.247:9000/api`
- Internet: `http://175.29.147.129:9000/api`

## Authentication

The API uses JWT token-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

- **POST /auth/login**
  - Description: Authenticate user and get access token
  - Request Body:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - Response:
    ```json
    {
      "token": "string",
      "refreshToken": "string",
      "user": {
        "id": "number",
        "username": "string",
        "fullName": "string",
        "email": "string",
        "avatarUrl": "string"
      },
      "permissions": ["string"]
    }
    ```

### Production Lines

- **GET /production/lines**
  - Description: Get all production lines
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "name": "string",
          "capacity": "number",
          "isActive": "boolean",
          "supervisorId": "number"
        }
      ]
    }
    ```

- **POST /production/lines**
  - Description: Create a new production line
  - Request Body:
    ```json
    {
      "name": "string",
      "capacity": "number",
      "isActive": "boolean",
      "supervisorId": "number"
    }
    ```

### Buyers

- **GET /buyers**
  - Description: Get all buyers
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "contactEmail": "string",
          "isActive": "boolean"
        }
      ]
    }
    ```

- **POST /buyers**
  - Description: Create a new buyer
  - Request Body:
    ```json
    {
      "name": "string",
      "code": "string",
      "contactEmail": "string",
      "isActive": "boolean"
    }
    ```

### Styles

- **GET /styles**
  - Description: Get all styles
  - Query Parameters:
    - `buyerId` (optional): Filter styles by buyer ID
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "styleNo": "string",
          "description": "string",
          "buyerId": "number",
          "fabricType": "string",
          "targetSAM": "number",
          "complexity": "string"
        }
      ]
    }
    ```

- **POST /styles**
  - Description: Create a new style
  - Request Body:
    ```json
    {
      "styleNo": "string",
      "description": "string",
      "buyerId": "number",
      "fabricType": "string",
      "targetSAM": "number",
      "complexity": "string"
    }
    ```

### Orders

- **GET /orders**
  - Description: Get all production orders
  - Query Parameters:
    - `status` (optional): Filter orders by status
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "orderNo": "string",
          "styleId": "number",
          "buyerId": "number",
          "quantity": "number",
          "deliveryDate": "string",
          "unitPrice": "number",
          "status": "string",
          "createdAt": "string"
        }
      ]
    }
    ```

- **POST /orders**
  - Description: Create a new production order
  - Request Body:
    ```json
    {
      "orderNo": "string",
      "styleId": "number",
      "buyerId": "number",
      "quantity": "number",
      "deliveryDate": "string",
      "unitPrice": "number",
      "status": "string"
    }
    ```

### Line Setup

- **GET /production/line-setups**
  - Description: Get all line setups
  - Query Parameters:
    - `date` (optional): Filter by production date
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "lineId": "number",
          "orderId": "number",
          "productionDate": "string",
          "targetQuantity": "number",
          "setupTime": "string",
          "isActive": "boolean"
        }
      ]
    }
    ```

- **POST /production/line-setup**
  - Description: Create a new line setup
  - Request Body:
    ```json
    {
      "lineId": "number",
      "orderId": "number",
      "productionDate": "string",
      "targetQuantity": "number",
      "setupTime": "string",
      "isActive": "boolean"
    }
    ```

### Hourly Production

- **GET /production/hourly**
  - Description: Get hourly production entries
  - Query Parameters:
    - `lineSetupId` (optional): Filter by line setup ID
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "lineSetupId": "number",
          "hourSlot": "string",
          "targetQuantity": "number",
          "actualQuantity": "number",
          "defectQuantity": "number",
          "remarks": "string",
          "entryTime": "string",
          "enteredBy": "number"
        }
      ]
    }
    ```

- **POST /production/hourly**
  - Description: Create a new hourly production entry
  - Request Body:
    ```json
    {
      "lineSetupId": "number",
      "hourSlot": "string",
      "targetQuantity": "number",
      "actualQuantity": "number",
      "defectQuantity": "number",
      "remarks": "string",
      "entryTime": "string",
      "enteredBy": "number"
    }
    ```

### Quality Defects

- **GET /quality/defects**
  - Description: Get quality defects
  - Query Parameters:
    - `hourlyProductionId` (optional): Filter by hourly production ID
  - Response:
    ```json
    {
      "data": [
        {
          "id": "number",
          "hourlyProductionId": "number",
          "defectType": "string",
          "defectCount": "number",
          "severity": "string",
          "description": "string",
          "actionTaken": "string"
        }
      ]
    }
    ```

- **POST /quality/defects**
  - Description: Create a new quality defect entry
  - Request Body:
    ```json
    {
      "hourlyProductionId": "number",
      "defectType": "string",
      "defectCount": "number",
      "severity": "string",
      "description": "string",
      "actionTaken": "string"
    }
    ```

### Reports

- **POST /reports/production**
  - Description: Get production report data
  - Request Body:
    ```json
    {
      "startDate": "string",
      "endDate": "string"
    }
    ```
  - Response:
    ```json
    {
      "data": [
        {
          "lineId": "number",
          "productionDate": "string",
          "style": "string",
          "orderNo": "string",
          "buyer": "string",
          "totalTarget": "number",
          "totalActual": "number",
          "efficiency": "number"
        }
      ]
    }
    ```

- **POST /reports/export**
  - Description: Export production report
  - Request Body:
    ```json
    {
      "startDate": "string",
      "endDate": "string",
      "format": "string"
    }
    ```
  - Response:
    ```json
    {
      "url": "string"
    }
    ```

### Dashboard

- **GET /dashboard/metrics**
  - Description: Get dashboard metrics
  - Query Parameters:
    - `date` (optional): Filter by date
  - Response:
    ```json
    {
      "data": {
        "totalLines": "number",
        "activeLines": "number",
        "todayProduction": "number",
        "todayTarget": "number",
        "overallEfficiency": "number",
        "qualityRate": "number",
        "topPerformingLine": "string",
        "criticalOrders": "number"
      }
    }
    ```

## API Improvement Suggestions

Based on the analysis of your API, here are some suggestions for improvement:

### 1. Standardize Response Format

Ensure all API endpoints return responses in a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "errors": null
}
```

### 2. Add Pagination Support

For endpoints that return lists, add pagination support:

```
GET /api/buyers?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 3. Implement Filtering and Sorting

Add more filtering and sorting options:

```
GET /api/production/hourly?sortBy=hourSlot&order=desc&date=2023-01-01
```

### 4. Add Batch Operations

Implement batch operations for creating or updating multiple records:

```
POST /api/production/hourly/batch
```

### 5. Implement Proper Error Handling

Return detailed error messages with appropriate HTTP status codes:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    {
      "field": "targetQuantity",
      "message": "Target quantity must be greater than zero"
    }
  ]
}
```

### 6. Add API Versioning

Implement API versioning to ensure backward compatibility:

```
/api/v1/buyers
/api/v2/buyers
```

### 7. Implement Rate Limiting

Add rate limiting to prevent abuse:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```

### 8. Add Caching Headers

Implement proper caching headers:

```
Cache-Control: max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

### 9. Implement HATEOAS

Add hyperlinks to related resources:

```json
{
  "data": {
    "id": 1,
    "name": "Line 1",
    "_links": {
      "self": { "href": "/api/production/lines/1" },
      "setups": { "href": "/api/production/line-setups?lineId=1" }
    }
  }
}
```

### 10. Add Webhooks for Real-time Updates

Implement webhooks to notify clients of changes:

```
POST /api/webhooks/register
{
  "url": "https://example.com/webhook",
  "events": ["production.created", "production.updated"]
}
```

### 11. Implement GraphQL

Consider adding a GraphQL endpoint for more flexible data fetching:

```
POST /api/graphql
{
  "query": "{ productionLines { id name capacity } }"
}
```

### 12. Add API Documentation

Implement Swagger/OpenAPI documentation for your API.

### 13. Implement Proper Authentication and Authorization

- Use OAuth 2.0 or JWT with refresh tokens
- Implement role-based access control
- Add API key authentication for machine-to-machine communication

### 14. Add Health and Metrics Endpoints

```
GET /api/health
GET /api/metrics
```

### 15. Implement Bulk Data Import/Export

Add endpoints for importing and exporting data in bulk:

```
POST /api/import/styles
GET /api/export/production?format=csv
```

By implementing these improvements, your API will be more robust, scalable, and developer-friendly.