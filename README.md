# Product API

A multi-vendor product API built with NestJS and MongoDB, featuring vendor isolation, JWT authentication, and product filtering.

## 🚀 Features

- **Vendor Management**: Registration and authentication system
- **CRUD Operations**: Full product lifecycle management
- **Vendor Isolation**: Strict enforcement preventing cross-vendor access
- **JWT Authentication**: Secure token-based authentication
- **Pagination**: Efficient data retrieval with customizable page sizes
- **Filtering**: Filter products by category, price range
- **Soft Delete**: Products are soft-deleted, preserving data integrity
- **Swagger Documentation**: Interactive API documentation
- **DTO Validation**: Input validation using class-validator
- **Modular Architecture**: Clean separation of concerns following SOLID principles

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd product-api > project
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/{whatever}
JWT_SECRET=your-secure-secret-key
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB service
mongod
```

5. **Run the application**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api
```

## 🔐 Authentication Flow

1. **Register a vendor**
   - POST `/vendors/register`
   - Receive JWT token in response

2. **Login as vendor**
   - POST `/vendors/login`
   - Receive JWT token in response

3. **Use token for authenticated requests**
   - Include token in Authorization header: `Bearer <token>`

## 📖 API Endpoints

### Vendors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vendors/register` | Register new vendor | No |
| POST | `/vendors/login` | Login vendor | No |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/products` | Create product | Yes |
| GET | `/products` | Get all products (paginated) | Yes |
| GET | `/products/:id` | Get product by ID | Yes |
| PATCH | `/products/:id` | Update product | Yes |
| DELETE | `/products/:id` | Soft delete product | Yes |

### Query Parameters for GET `/products`

- `page` (default: 1): Page number
- `limit` (default: 10): Items per page
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

## 🔍 Example Usage

### 1. Register a Vendor
```bash
curl -X POST http://localhost:3000/vendors/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "SecurePass123!",
    "businessName": "Tech Store Inc.",
    "description": "Leading electronics retailer"
  }'
```

Response:
```json
{
  "vendor": {
    "id": "65f...",
    "email": "vendor@example.com",
    "businessName": "Tech Store Inc.",
    "isActive": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Create a Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100
  }'
```

### 3. Get Products with Filters
```bash
curl -X GET "http://localhost:3000/products?category=Electronics&minPrice=20&maxPrice=50&page=1&limit=10" \
  -H "Authorization: Bearer <your-token>"
```

## 🏗️ Architecture & Design Choices

### 1. **Modular Architecture**
- **Separation of Concerns**: Each module (Auth, Vendors, Products) is self-contained
- **Dependency Injection**: NestJS's built-in DI container for loose coupling
- **Module Organization**: Clear boundaries between business domains

### 2. **SOLID Principles**

#### Single Responsibility Principle (SRP)
- Each service has one clear responsibility
- Controllers handle HTTP concerns only
- Services contain business logic
- Schemas define data structure only

#### Open/Closed Principle (OCP)
- DTOs are extendable using `PartialType` for update operations
- Services are open for extension through inheritance
- Guards and strategies can be easily extended

#### Liskov Substitution Principle (LSP)
- All guards implement the same interface
- Services follow consistent contracts
- DTOs maintain type safety

#### Interface Segregation Principle (ISP)
- Separate DTOs for create, update, and response
- Query DTOs are optional and specific to needs
- No bloated interfaces forcing unnecessary implementations

#### Dependency Inversion Principle (DIP)
- Services depend on abstractions (Mongoose models)
- High-level modules don't depend on low-level modules
- Repository pattern through Mongoose models

### 3. **Security Measures**

#### Vendor Isolation
```typescript
// Every product query includes vendorId check
const product = await this.productModel.findOne({
  _id: id,
  vendorId: new Types.ObjectId(vendorId),
});

// Ownership verification before updates/deletes
await this.findOne(id, vendorId); // Throws ForbiddenException if not owner
```

#### JWT Authentication
- Tokens expire after 24 hours
- vendorId embedded in token payload
- Token validation on every protected route
- Passwords hashed using bcrypt (10 rounds)

#### Input Validation
- All DTOs validated using class-validator
- Whitelist unknown properties
- Transform types automatically
- Prevent injection attacks

### 4. **Data Model Design**

#### Vendor Schema
```typescript
- email (unique, indexed)
- password (hashed)
- businessName
- Optional: description, address, phone
- isActive flag for account management
- timestamps (createdAt, updatedAt)
```

#### Product Schema
```typescript
- name, description, category
- price (min: 0)
- stock (min: 0)
- vendorId (ObjectId, indexed, required)
- isDeleted (soft delete flag)
- deletedAt (timestamp of deletion)
- timestamps (createdAt, updatedAt)
```

#### Indexes
```typescript
// Compound indexes for efficient queries
- { vendorId: 1, isDeleted: 1 }
- { vendorId: 1, category: 1 }
- { vendorId: 1, price: 1 }
```

### 5. **Error Handling Strategy**

- **NotFoundException**: When resources don't exist
- **ForbiddenException**: When accessing others' resources
- **ConflictException**: When creating duplicates
- **UnauthorizedException**: When authentication fails
- Global validation pipe catches DTO validation errors

### 6. **Pagination Implementation**
```typescript
// Efficient pagination with total count
const skip = (page - 1) * limit;
const [products, total] = await Promise.all([
  this.productModel.find(filter).skip(skip).limit(limit),
  this.productModel.countDocuments(filter)
]);
```

### 7. **Soft Delete Pattern**
- Products marked as deleted, not removed from database
- Maintains referential integrity
- Enables audit trails
- Allows for potential recovery

### 8. **Repository Abstraction**
- Mongoose models act as repository layer
- Service layer handles business logic
- Controllers handle HTTP concerns
- Clear separation enables easy testing

## 🧪 Testing the API

### Using Swagger UI
1. Navigate to `http://localhost:3000/api`
2. Click "Authorize" button
3. Enter: `Bearer <your-token>`
4. Test endpoints interactively

### Using Postman
1. Import the collection from Swagger JSON
2. Set up environment variables
3. Use Postman's authentication helpers

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Expiration**: 24-hour token lifetime
3. **Input Validation**: Strict DTO validation
4. **SQL Injection Prevention**: MongoDB parameterized queries
5. **CORS Enabled**: Configurable cross-origin requests
6. **Environment Variables**: Sensitive data in .env files
7. **Vendor Isolation**: Database-level access control

## 📊 Database Schema

```
┌─────────────────┐
│     Vendor      │
├─────────────────┤
│ _id (ObjectId)  │
│ email (unique)  │
│ password (hash) │
│ businessName    │
│ description     │
│ address         │
│ phone           │
│ isActive        │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    Product      │
├─────────────────┤
│ _id (ObjectId)  │
│ name            │
│ description     │
│ price           │
│ category        │
│ stock           │
│ vendorId (FK)   │◄── Enforces vendor isolation
│ isDeleted       │
│ deletedAt       │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

## 🚦 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Successful GET/PATCH |
| 201 | Created - Successful POST |
| 204 | No Content - Successful DELETE |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Cross-vendor access attempt |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |

## 🎯 Design Decisions Rationale

### Why NestJS?
- Built-in dependency injection
- TypeScript first-class support
- Modular architecture out of the box
- Extensive ecosystem (Swagger, JWT, etc.)
- Enterprise-ready patterns

### Why MongoDB?
- Flexible schema for products
- Excellent horizontal scaling
- Rich query capabilities
- Native ObjectId for relationships
- Good indexing support

### Why JWT?
- Stateless authentication
- Scalable across multiple servers
- Industry standard
- Easy to implement and validate

### Why Soft Delete?
- Preserve data for auditing
- Enable recovery if needed
- Maintain referential integrity
- Required by most regulations

### Why Repository Pattern (via Mongoose)?
- Abstraction over data access
- Easy to mock for testing
- Single point of database queries
- Consistent query interface

## 📈 Future Enhancements

- [ ] Add unit and e2e tests
- [ ] Implement API rate limiting
- [ ] Add caching layer (Redis)
- [ ] Add product image upload
- [ ] Implement full-text search
- [ ] Add product reviews/ratings
- [ ] Multi-language support
- [ ] Add email notifications
- [ ] Implement refresh tokens
- [ ] Add admin panel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- MongoDB team for the excellent database
- All open-source contributors