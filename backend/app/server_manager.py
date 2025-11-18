"""
MCP Server Runtime Manager
Manages lifecycle and execution of hosted MCP servers
"""

import asyncio
import subprocess
import json
import os
import tempfile
from typing import Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MCPServerProcess:
    """Represents a running MCP server process"""

    def __init__(self, server_id: str, config: dict):
        self.server_id = server_id
        self.config = config
        self.process: Optional[subprocess.Popen] = None
        self.status = "stopped"
        self.workspace_path: Optional[str] = None

    async def start(self, server_code: str, requirements: str):
        """Start the MCP server process"""
        try:
            # Create workspace directory
            workspace = tempfile.mkdtemp(prefix=f"mcp_{self.server_id}_")
            self.workspace_path = workspace

            # Write server files
            server_file = os.path.join(workspace, "server.py")
            requirements_file = os.path.join(workspace, "requirements.txt")

            with open(server_file, 'w') as f:
                f.write(server_code)

            with open(requirements_file, 'w') as f:
                f.write(requirements)

            # Install dependencies
            logger.info(f"Installing dependencies for server {self.server_id}")
            install_process = await asyncio.create_subprocess_exec(
                "pip", "install", "-q", "-r", requirements_file,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await install_process.wait()

            # Start the MCP server
            logger.info(f"Starting MCP server {self.server_id}")
            self.process = await asyncio.create_subprocess_exec(
                "python", server_file,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=workspace
            )

            self.status = "running"
            logger.info(f"MCP server {self.server_id} started successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to start server {self.server_id}: {e}")
            self.status = "error"
            return False

    async def stop(self):
        """Stop the MCP server process"""
        try:
            if self.process:
                self.process.terminate()
                await asyncio.wait_for(self.process.wait(), timeout=5)
                self.status = "stopped"
                logger.info(f"MCP server {self.server_id} stopped")

            # Cleanup workspace
            if self.workspace_path and os.path.exists(self.workspace_path):
                import shutil
                shutil.rmtree(self.workspace_path)

        except asyncio.TimeoutError:
            # Force kill if graceful shutdown fails
            if self.process:
                self.process.kill()
                self.status = "stopped"
        except Exception as e:
            logger.error(f"Error stopping server {self.server_id}: {e}")

    async def call_tool(self, tool_name: str, arguments: dict) -> dict:
        """Call a tool on the MCP server"""
        if not self.process or self.status != "running":
            raise RuntimeError("Server is not running")

        try:
            # Create MCP request
            request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": arguments
                }
            }

            # Send to stdin
            request_str = json.dumps(request) + "\n"
            self.process.stdin.write(request_str.encode())
            await self.process.stdin.drain()

            # Read from stdout
            response_line = await self.process.stdout.readline()
            response = json.loads(response_line.decode())

            return response

        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            raise

    def get_status(self) -> dict:
        """Get server status"""
        return {
            "server_id": self.server_id,
            "status": self.status,
            "name": self.config.get("name", "Unknown"),
            "running": self.process is not None and self.process.poll() is None
        }


class MCPServerManager:
    """Manages multiple hosted MCP servers"""

    def __init__(self):
        self.servers: Dict[str, MCPServerProcess] = {}

    async def deploy_server(self, server_id: str, config: dict, server_code: str, requirements: str) -> bool:
        """Deploy a new MCP server"""
        try:
            # Stop existing server if running
            if server_id in self.servers:
                await self.stop_server(server_id)

            # Create and start new server
            server_process = MCPServerProcess(server_id, config)
            success = await server_process.start(server_code, requirements)

            if success:
                self.servers[server_id] = server_process
                return True
            return False

        except Exception as e:
            logger.error(f"Failed to deploy server {server_id}: {e}")
            return False

    async def stop_server(self, server_id: str) -> bool:
        """Stop a running server"""
        if server_id in self.servers:
            await self.servers[server_id].stop()
            del self.servers[server_id]
            return True
        return False

    async def restart_server(self, server_id: str, config: dict, server_code: str, requirements: str) -> bool:
        """Restart a server"""
        await self.stop_server(server_id)
        return await self.deploy_server(server_id, config, server_code, requirements)

    def get_server(self, server_id: str) -> Optional[MCPServerProcess]:
        """Get a server by ID"""
        return self.servers.get(server_id)

    def list_servers(self) -> list:
        """List all servers"""
        return [server.get_status() for server in self.servers.values()]

    async def cleanup_all(self):
        """Stop all servers"""
        for server_id in list(self.servers.keys()):
            await self.stop_server(server_id)


# Global server manager instance
server_manager = MCPServerManager()
