# MCP-Busbar

A powerful visual builder for **Model Context Protocol (MCP) Servers** with dual node-based UI options (React Flow & GoJS) and a Python FastAPI backend.

## Features

- **🎨 Dual Diagram Libraries**: Choose between React Flow or GoJS for your preferred diagramming experience
- **🔌 MCP Server Builder**: Visually design and generate complete MCP servers
- **🚀 One-Click Deployment**: Deploy MCP servers directly to the platform with a single click
- **☁️ Hosted Servers**: Host your MCP servers on the platform with unique URLs
- **🛠️ Tool Creation**: Define custom tools with input schemas and implementations
- **📚 Resource Management**: Configure resources with URIs and MIME types
- **💬 Prompt Templates**: Create reusable prompt templates with arguments
- **📦 Export & Download**: Export complete MCP servers as ready-to-use ZIP files
- **📊 Server Management**: Monitor, restart, and manage your hosted servers
- **🔗 HTTP API Access**: Call MCP server tools via REST API at `/mcp/{server_id}/tools/call`
- **🐳 Docker Support**: Easy deployment with Docker and Docker Compose
- **💾 Real-time Persistence**: Save and load your designs

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. MCP-Busbar makes it easy to build MCP servers visually without writing code.

## Project Structure

```
MCP-Busbar/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Main FastAPI application
│   │   ├── models.py          # MCP data models
│   │   └── mcp_generator.py   # MCP server code generator
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Flow.jsx              # React Flow diagram
│   │   │   ├── GoJSDiagram.jsx       # GoJS diagram
│   │   │   ├── MCPServerNode.jsx     # MCP Server node
│   │   │   ├── MCPToolNode.jsx       # Tool node
│   │   │   ├── MCPResourceNode.jsx   # Resource node
│   │   │   └── MCPPromptNode.jsx     # Prompt node
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup
└── .env.example
```

## Prerequisites

### Option 1: Using Docker (Recommended)
- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher

### Option 2: Manual Setup
- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **npm**: 7 or higher

## Quick Start with Docker (Recommended)

### Production Mode

```bash
# Clone and start
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Development Mode (with hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Docker Commands

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after changes
docker-compose up --build

# Clean up everything
docker-compose down -v
```

## Manual Setup

### Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Using MCP-Busbar

### 1. Choose Your Diagram Library

MCP-Busbar supports two powerful diagramming libraries:

- **React Flow**: Modern, lightweight, and highly customizable
- **GoJS**: Feature-rich commercial library (free for evaluation/non-commercial use)

Switch between them using the toggle button in the UI.

### 2. Build Your MCP Server

#### Create an MCP Server Node

1. The diagram starts with an **MCP Server** node (purple, with 🖥️ icon)
2. Click "Configure" to set:
   - Server name
   - Description
   - Version

#### Add Tools

1. Add **Tool nodes** (orange, with 🔧 icon)
2. Configure each tool:
   - **Name**: Tool identifier (e.g., `get_weather`)
   - **Description**: What the tool does
   - **Input Schema**: JSON schema for tool parameters
   - **Implementation**: Python code for the tool logic

Example tool configuration:
```json
{
  "type": "object",
  "properties": {
    "location": {
      "type": "string",
      "description": "City name"
    }
  },
  "required": ["location"]
}
```

#### Add Resources

1. Add **Resource nodes** (green, with 📄 icon)
2. Configure:
   - **Name**: Resource identifier
   - **URI**: Resource location (e.g., `file:///data/notes.txt`)
   - **Description**: Resource description
   - **MIME Type**: Content type (e.g., `text/plain`)

#### Add Prompts

1. Add **Prompt nodes** (blue, with 💬 icon)
2. Configure:
   - **Name**: Prompt identifier
   - **Description**: Prompt purpose
   - **Template**: Prompt text with `{{variable}}` placeholders
   - **Arguments**: JSON array of argument definitions

Example prompt template:
```
Analyze the following {{data_type}} and provide insights:

{{content}}

Focus on: {{focus_area}}
```

### 3. Connect Nodes

- Draw connections from Tools/Resources/Prompts **to** the MCP Server node
- Connections define which components are part of your server

### 4. Generate & Export

Click **"Export MCP Server (ZIP)"** to download a complete package containing:

- `server.py` - Complete MCP server implementation
- `requirements.txt` - Python dependencies
- `README.md` - Usage instructions

### 5. Use Your MCP Server

```bash
# Unzip the export
unzip my_mcp_server.zip
cd my_mcp_server

# Install dependencies
pip install -r requirements.txt

# Run the server
python server.py
```

### 6. Integrate with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/path/to/server.py"]
    }
  }
}
```

## Hosting Servers on the Platform

MCP-Busbar now supports **hosting MCP servers directly on the platform**! Instead of just downloading and running servers locally, you can deploy them with one click.

### Deploy a Server

1. **Build Your Server**: Create your MCP server using the visual builder
2. **Click "🚀 Deploy Server"**: This will:
   - Convert your flow to an MCP server
   - Deploy it to the hosting platform
   - Assign it a unique URL
3. **Access Your Server**: Navigate to the "Hosted Servers" tab to manage your deployment

### Server URLs

Each deployed server gets a unique URL pattern:

```
/mcp/{server_id}/
```

### Calling Hosted Server Tools

Call tools on your hosted server via HTTP:

```bash
# Call a tool
curl -X POST http://localhost:8000/mcp/{server_id}/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "get_weather",
    "arguments": {"location": "San Francisco"}
  }'
```

### Managing Hosted Servers

From the **Hosted Servers** dashboard, you can:

- **View Status**: See which servers are running
- **Get Info**: View server details, tools, resources, and prompts
- **Restart**: Restart a server with updated code
- **Stop**: Stop and remove a server
- **Copy URL**: Copy the server's API endpoint

### Server Lifecycle

- **Running**: Server is active and accepting requests
- **Stopped**: Server has been stopped
- **Error**: Server encountered an error during startup

## API Endpoints

### Flow Management

- `GET /` - API information
- `GET /health` - Health check
- `GET /nodes` - Get all nodes
- `POST /nodes` - Create node
- `GET /edges` - Get all edges
- `POST /edges` - Create edge
- `GET /flow` - Get entire flow
- `POST /flow` - Save flow
- `DELETE /flow` - Clear flow

### MCP Server Management

- `POST /mcp/server` - Create/update MCP server configuration
- `GET /mcp/servers` - List all MCP servers
- `GET /mcp/server/{id}` - Get specific server
- `DELETE /mcp/server/{id}` - Delete server
- `POST /mcp/generate/{id}` - Generate server code
- `POST /mcp/export/{id}` - Export server as ZIP
- `POST /mcp/flow-to-server` - Convert flow to MCP server

### Hosted Server Management

- `POST /mcp/deploy/{id}` - Deploy server to hosting platform
- `DELETE /mcp/deploy/{id}` - Stop and remove hosted server
- `POST /mcp/deploy/{id}/restart` - Restart hosted server
- `GET /mcp/hosted` - List all hosted servers
- `GET /mcp/hosted/{id}/status` - Get server status
- `GET /mcp/{id}/info` - Get hosted server information
- `POST /mcp/{id}/tools/call` - Call a tool on hosted server

## Node Types

### MCP Server Node (Purple)
Central hub for your MCP server. All tools, resources, and prompts connect to this node.

**Properties:**
- Name: Server identifier
- Description: Server purpose
- Version: Semantic version

### Tool Node (Orange)
Defines executable tools that can be called by LLMs.

**Properties:**
- Name: Tool function name
- Description: Tool documentation
- Input Schema: JSON schema for parameters
- Implementation: Python code

### Resource Node (Green)
Exposes data sources to the MCP server.

**Properties:**
- Name: Resource identifier
- URI: Resource location
- Description: Resource documentation
- MIME Type: Content type

### Prompt Node (Blue)
Reusable prompt templates with variable substitution.

**Properties:**
- Name: Prompt identifier
- Description: Prompt purpose
- Template: Text with `{{variables}}`
- Arguments: Array of argument definitions

## Diagram Libraries

### React Flow

**Pros:**
- MIT licensed (free for all uses)
- Lightweight and performant
- Great for simple to medium complexity diagrams
- Active open-source community

**Best for:** Most use cases, open-source projects

### GoJS

**Pros:**
- Highly feature-rich
- Advanced layout algorithms
- Professional-grade diagrams
- Extensive customization

**Cons:**
- Requires commercial license ($1,500+) for production use
- Larger bundle size

**Best for:** Complex enterprise diagrams, commercial projects

**Licensing:** GoJS is free for evaluation and non-commercial use. For commercial use, purchase a license at [gojs.net](https://gojs.net).

## Examples

### Weather Tool MCP Server

**Server Configuration:**
- Name: "Weather Server"
- Description: "Provides weather information"

**Tool:**
- Name: `get_weather`
- Description: "Get current weather for a location"
- Input Schema:
  ```json
  {
    "type": "object",
    "properties": {
      "location": {"type": "string"}
    }
  }
  ```
- Implementation:
  ```python
  import requests
  weather_data = requests.get(f"https://api.weather.com/{arguments['location']}")
  return f"Weather in {arguments['location']}: {weather_data.json()}"
  ```

### Document Resource Server

**Server Configuration:**
- Name: "Knowledge Base"

**Resource:**
- Name: `company_docs`
- URI: `file:///docs/company`
- Description: "Company documentation"
- MIME Type: `text/markdown`

## Development

### Backend

Edit `backend/app/main.py` for API changes.

The backend uses:
- **FastAPI**: Modern async web framework
- **Pydantic**: Data validation
- **CORS**: Configured for frontend access

### Frontend

Edit files in `frontend/src/`.

The frontend uses:
- **React 18**: Modern React with hooks
- **Vite**: Fast build tooling
- **React Flow**: Free node-based UI
- **GoJS**: Commercial node-based UI
- **Axios**: HTTP client

### Environment Variables

Copy `.env.example` to `.env`:

```bash
VITE_API_URL=http://localhost:8000
```

## Building for Production

### Docker (Recommended)

```bash
docker-compose up --build
```

### Manual Build

**Backend:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Docker Issues

- **Port conflicts**: Modify ports in `docker-compose.yml`
- **Build failures**: Ensure Docker has 4GB+ memory
- **Changes not reflected**: Use `docker-compose up --build`

### Backend Issues

- **Import errors**: Check virtual environment is activated
- **Port in use**: Change port in uvicorn command

### Frontend Issues

- **API connection failed**: Ensure backend is running on port 8000
- **Module not found**: Run `npm install` again
- **GoJS licensing warning**: Normal for evaluation use

## License

This project is open source and available under the MIT License.

**Note:** GoJS is a separate library with its own licensing requirements. See [gojs.net](https://gojs.net) for details.

## Contributing

Contributions welcome! Please submit a Pull Request.

## Learn More

- **MCP Documentation**: https://modelcontextprotocol.io
- **React Flow**: https://reactflow.dev
- **GoJS**: https://gojs.net
- **FastAPI**: https://fastapi.tiangolo.com

## Support

For issues or questions:
- Open an issue on GitHub
- Check the API documentation at http://localhost:8000/docs

---

**Built with** ❤️ **for the MCP community**
