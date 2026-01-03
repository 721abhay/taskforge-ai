# 🎉 Auth Service is Running!

## ✅ What We Just Built

### Auth Service Features:
1. ✅ **User Registration** - Create new accounts
2. ✅ **User Login** - Authenticate with email/password
3. ✅ **JWT Tokens** - Access & refresh tokens
4. ✅ **Password Hashing** - Bcrypt with salt rounds
5. ✅ **Token Refresh** - Renew expired access tokens
6. ✅ **Protected Routes** - Auth middleware
7. ✅ **Get Current User** - /auth/me endpoint

### Service Running On:
```
🔐 Auth Service: http://localhost:5001
📝 Health Check: http://localhost:5001/health
```

---

## 🧪 Test the API

### Method 1: Using cURL (Command Line)

#### 1. Register a New User
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@1234\",\"fullName\":\"Test User\"}"
```

#### 2. Login
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@1234\"}"
```

#### 3. Get Current User (use access token from login)
```bash
curl -X GET http://localhost:5001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### 4. Refresh Token
```bash
curl -X POST http://localhost:5001/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN_HERE\"}"
```

---

### Method 2: Using PowerShell

#### 1. Register
```powershell
$body = @{
    email = "test@example.com"
    password = "Test@1234"
    fullName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/auth/register" -Method Post -Body $body -ContentType "application/json"
```

#### 2. Login
```powershell
$body = @{
    email = "test@example.com"
    password = "Test@1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5001/auth/login" -Method Post -Body $body -ContentType "application/json"
$response
```

#### 3. Get Current User
```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5001/auth/me" -Method Get -Headers $headers
```

---

### Method 3: Using VS Code REST Client Extension

Create a file `test-auth.http`:

```http
### Register User
POST http://localhost:5001/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@1234",
  "fullName": "Test User"
}

### Login
POST http://localhost:5001/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@1234"
}

### Get Current User
GET http://localhost:5001/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE

### Refresh Token
POST http://localhost:5001/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}

### Logout
POST http://localhost:5001/auth/logout
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```

---

## 📋 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | No |
| GET | `/auth/me` | Get current user | Yes |

---

## 📝 Request/Response Examples

### Register Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "fullName": "Test User",
      "role": "MEMBER",
      "avatarUrl": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "fullName": "Test User",
      "role": "MEMBER",
      "avatarUrl": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 🔐 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

---

## ⚡ Quick Test Script

Save this as `test-auth.ps1`:

```powershell
# Test Auth Service

Write-Host "🧪 Testing Auth Service..." -ForegroundColor Cyan

# 1. Register
Write-Host "`n1️⃣ Registering user..." -ForegroundColor Yellow
$registerBody = @{
    email = "demo@taskforge.ai"
    password = "Demo@1234"
    fullName = "Demo User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5001/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.data.user.id)"
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
}

# 2. Login
Write-Host "`n2️⃣ Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "demo@taskforge.ai"
    password = "Demo@1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5001/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $accessToken = $loginResponse.data.tokens.accessToken
    Write-Host "Access Token: $($accessToken.Substring(0, 50))..."
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit
}

# 3. Get Current User
Write-Host "`n3️⃣ Getting current user..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $accessToken"
}

try {
    $meResponse = Invoke-RestMethod -Uri "http://localhost:5001/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Got user info!" -ForegroundColor Green
    Write-Host "Email: $($meResponse.data.user.email)"
    Write-Host "Name: $($meResponse.data.user.fullName)"
    Write-Host "Role: $($meResponse.data.user.role)"
} catch {
    Write-Host "❌ Failed to get user: $_" -ForegroundColor Red
}

Write-Host "`n🎉 All tests completed!" -ForegroundColor Cyan
```

Run it:
```powershell
.\test-auth.ps1
```

---

## 🎯 Next Steps

1. **Test the API** - Use one of the methods above
2. **Build the Frontend** - Next.js with login/register pages
3. **Connect Frontend to Backend** - API integration

---

## 📊 Progress Update

```
Week 1 Progress: 60% Complete!

Day 1-2: Auth Service ✅ DONE!
├── ✅ User registration
├── ✅ Login with JWT
├── ✅ Password hashing
├── ✅ Token refresh
├── ✅ Protected routes
└── ✅ Auth middleware

Day 3-4: Frontend ⏳ NEXT
├── 📅 Next.js setup
├── 📅 Login page
├── 📅 Register page
└── 📅 Auth flow
```

---

**Ready to test?** Try registering a user and let me know the result! 🚀
