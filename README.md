# Network Speed Test Backend

A robust backend service for collecting, storing, and analyzing network speed test results. This application provides RESTful APIs to submit speed test data, manage user privacy settings, and submit feedback about network quality.

## Features

- 📊 Store and retrieve network speed test results
- 🔒 User privacy settings management
- 📝 Feedback submission system
- 🌍 CORS-enabled for cross-origin requests
- 🚀 Ready for deployment on Render.com

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- MongoDB Atlas account or local MongoDB instance

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Masango-12/backend.git
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see below)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=4000
MONGO_URI=your_mongodb_connection_string
```

## API Endpoints

### Speed Tests
- `POST /api/tests` - Submit a new speed test result
- `GET /api/tests` - Get all test results (optional: `?userId=USER_ID`)

### Privacy Settings
- `GET /api/privacy-settings/:userId` - Get user's privacy settings
- `PUT /api/privacy-settings/:userId` - Update user's privacy settings

### Feedback
- `POST /api/feedback` - Submit feedback about network quality

### Health Check
- `GET /api/health` - Check if the API is running

## Deployment

This application is configured for deployment on [Render.com](https://render.com). The `render.yaml` file contains the deployment configuration.

1. Push your code to a GitHub repository
2. Connect the repository to your Render account
3. Set the required environment variables in the Render dashboard
4. Deploy!

## Running Locally

1. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

2. The server will be available at `http://localhost:4000`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
