# Luscript AI Tool

A modern web application built with Angular and Spring Boot, designed to provide AI-powered functionality with a beautiful and responsive user interface. This tool leverages advanced AI capabilities to process and analyze text, documents, and media content.

## 🚀 Tech Stack

### Frontend
- Angular 19.2
- Angular Material
- TailwindCSS
- Spartan UI Components
- File handling libraries (docx, pdfmake)
- FFmpeg integration for media processing
- Vercel Analytics for usage tracking

### Backend
- Spring Boot 3.4.5
- Java 21
- Spring WebFlux for reactive programming
- Spring Validation for request validation
- Spring DevTools for development convenience

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- Java 21 or higher
- Maven
- Angular CLI
- Git

## 🔑 Environment Setup

### Frontend Environment Variables
Create a `.env` file in the frontend directory:
```env
API_URL=http://localhost:8080
ANALYTICS_ENABLED=true
```

### Backend Environment Variables
Create `application.properties` in `backend/src/main/resources/`:
```properties
server.port=8080
spring.application.name=luscript-ai-tool
```

## 🛠️ Installation

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the project:
   ```bash
   ./mvnw clean install
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

## 🔧 Development

- Frontend runs on `http://localhost:4200`
- Backend runs on `http://localhost:8080`

### Development Workflow
1. Start both frontend and backend servers
2. Make changes to the code
3. Frontend will automatically reload on changes
4. Backend will restart on changes (with devtools)

## 📦 Project Structure

```
Luscript-AI-tool/
├── frontend/           # Angular application
│   ├── src/           # Source files
│   │   ├── app/       # Application components
│   │   ├── assets/    # Static assets
│   │   └── styles/    # Global styles
│   ├── public/        # Public assets
│   └── libs/          # Shared libraries
├── backend/           # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/  # Java source files
│   │   │   └── resources/ # Configuration files
│   │   └── test/      # Test files
│   └── pom.xml        # Maven configuration
└── .vscode/          # VS Code configuration
```

## 🤖 AI Features

The application provides several AI-powered features:

1. **Text Analysis**
   - Natural Language Processing
   - Sentiment Analysis
   - Text Classification

2. **Document Processing**
   - PDF Analysis
   - Word Document Processing
   - Text Extraction

3. **Media Processing**
   - Video Analysis
   - Audio Processing
   - Image Recognition

## 📡 API Documentation

### REST Endpoints

#### Text Processing
- `POST /api/text/analyze` - Analyze text content
- `POST /api/text/summarize` - Generate text summaries
- `POST /api/text/classify` - Classify text content

#### Document Processing
- `POST /api/documents/process` - Process document files
- `GET /api/documents/{id}` - Retrieve processed document
- `DELETE /api/documents/{id}` - Remove document

#### Media Processing
- `POST /api/media/process` - Process media files
- `GET /api/media/{id}` - Retrieve processed media
- `DELETE /api/media/{id}` - Remove media

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
./mvnw test
```

### Integration Tests
```bash
cd backend
./mvnw verify
```

## 🔒 Security

- All API endpoints are secured with authentication
- HTTPS is enforced in production
- Input validation is implemented on all endpoints
- Rate limiting is applied to prevent abuse

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Follow Angular style guide for frontend code
- Follow Spring Boot best practices for backend code
- Write unit tests for new features
- Update documentation for API changes

## 📫 Contact

For any questions or concerns, please open an issue in the repository.

## 🔄 Updates and Maintenance

- Regular security updates
- Dependency updates
- Performance optimizations
- New feature additions

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```

### Backend Deployment
```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
