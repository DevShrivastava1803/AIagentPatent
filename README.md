# Patent Analysis AI Assistant

A comprehensive AI-powered patent analysis platform that uses Google Gemini AI and vector databases to analyze patent documents, provide insights, and enable intelligent Q&A about patent content.

## 🚀 Features

### 📊 **AI-Powered Patent Analysis**
- **Document Processing**: Upload PDF patent documents for AI analysis
- **Intelligent Summaries**: AI-generated summaries of patent content
- **Novelty Scoring**: 0-100 scale novelty assessment
- **Issue Identification**: Automatic detection of potential patent issues
- **Improvement Recommendations**: AI-suggested enhancements
- **Similar Patent Detection**: Find related patents in the database

### 💬 **Document-Specific Chat Assistant**
- **RAG-Powered Q&A**: Ask questions about specific uploaded documents
- **Context-Aware Responses**: AI answers based on document content
- **Vector Search**: Intelligent retrieval of relevant document sections
- **Real-time Chat**: Interactive conversation with patent documents

### 🔍 **Advanced Search & Retrieval**
- **Vector Database**: ChromaDB for efficient similarity search
- **Embedding Generation**: Google Gemini embeddings for semantic search
- **Document Chunking**: Intelligent text splitting for better analysis
- **Metadata Tracking**: Comprehensive document metadata management

### 🎨 **Modern User Interface**
- **React + TypeScript**: Type-safe, modern frontend
- **Tailwind CSS**: Beautiful, responsive design
- **Real-time Updates**: Live progress indicators and status updates
- **Persistent Storage**: Analysis data survives navigation
- **Mobile Responsive**: Works on all device sizes

## 🛠️ Technology Stack

### **Backend**
- **Flask**: Python web framework
- **Google Gemini AI**: Advanced language model for analysis and chat
- **ChromaDB**: Vector database for similarity search
- **LangChain**: Document processing and RAG implementation
- **Pandas**: Data processing and manipulation

### **Frontend**
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Router**: Client-side routing

### **AI & ML**
- **Google Generative AI**: Text generation and analysis
- **Google Embeddings**: Text embedding generation
- **RAG (Retrieval-Augmented Generation)**: Context-aware AI responses
- **Vector Similarity Search**: Semantic document retrieval

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Google AI API Key** (for Gemini AI)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minor2/Backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "GOOGLE_API_KEY=your_google_api_key_here" > .env
   ```

4. **Start the Flask server**
   ```bash
   python -m flask run
   ```
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 🎯 Usage

### 1. **Upload Patent Document**
- Navigate to the Upload page
- Drag and drop or select a PDF patent document
- Wait for AI processing (typically 30-60 seconds)
- View comprehensive analysis results

### 2. **Review Analysis Results**
- **Patent Summary**: AI-generated overview
- **Novelty Score**: 0-100 assessment of innovation
- **Potential Issues**: Identified challenges and concerns
- **Recommendations**: Suggested improvements
- **Similar Patents**: Related documents in the database

### 3. **Chat with Your Document**
- Click "Chat about this Document" on the analysis page
- Ask specific questions about the patent content
- Get AI-powered responses based on document context
- Explore different aspects of the patent

### 4. **General Patent Q&A**
- Visit the Chat page without a specific document
- Ask general questions about patents and IP
- Get answers from the broader patent database

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the Backend directory:

```env
# Required: Google AI API Key
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Flask configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### API Endpoints

- `POST /upload` - Upload and process patent documents
- `GET /analyze/:document_id` - Get analysis for specific document
- `POST /query` - Chat Q&A with document context
- `GET /analysis` - Get last analysis (persistent storage)

## 📁 Project Structure

```
minor2/
├── Backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── analysis_service.py    # AI analysis logic
│   │   │   ├── process.py             # Document processing
│   │   │   └── vector_db/             # Vector database operations
│   │   ├── routes.py                  # API endpoints
│   │   └── __init__.py                # Flask app initialization
│   ├── uploads/                       # Uploaded documents
│   └── .env                          # Environment variables
├── Frontend/
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── utils/                    # Utility functions
│   │   └── App.tsx                   # Main app component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Deployment

### Backend Deployment
- **Heroku**: Use Procfile and requirements.txt
- **Railway**: Direct deployment from GitHub
- **AWS**: Deploy to EC2 or Lambda
- **Docker**: Containerized deployment

### Frontend Deployment
- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Drag and drop or Git integration
- **GitHub Pages**: Static site hosting

### Environment Setup for Production
1. Set `FLASK_ENV=production`
2. Configure CORS for your domain
3. Set up proper database persistence
4. Configure Google AI API quotas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: For providing Gemini AI and embedding services
- **ChromaDB**: For vector database technology
- **LangChain**: For RAG implementation framework
- **React Team**: For the amazing frontend framework
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation

---

**Built with ❤️ using modern AI and web technologies** 