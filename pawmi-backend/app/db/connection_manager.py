"""
Database Connection Manager with Automatic Fallback
Attempts to connect to Supabase first, falls back to local PostgreSQL if unavailable.
"""
import logging
import socket
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Database URLs
SUPABASE_URL = "postgresql://postgres:PawMi2502..@db.jnttxcptkmokdwglxqpu.supabase.co:5432/postgres"
LOCAL_URL = "postgresql://postgres:2502@localhost:5432/pawMi_db"


def test_connection(host: str, port: int, timeout: float = 3.0) -> bool:
    """
    Test if a database host is reachable.
    
    Args:
        host: Database hostname
        port: Database port
        timeout: Connection timeout in seconds
        
    Returns:
        True if connection succeeds, False otherwise
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        logger.debug(f"Connection test failed for {host}:{port} - {e}")
        return False


def get_database_url() -> tuple[str, str]:
    """
    Get the appropriate database URL based on connectivity.
    
    Returns:
        Tuple of (database_url, database_type)
        database_type is either "SUPABASE" or "LOCAL"
    """
    # Parse Supabase URL to extract host
    parsed = urlparse(SUPABASE_URL)
    supabase_host = parsed.hostname or "db.jnttxcptkmokdwglxqpu.supabase.co"
    supabase_port = parsed.port or 5432
    
    logger.info("Testing database connectivity...")
    
    # Try Supabase first
    if supabase_host and test_connection(supabase_host, supabase_port):
        logger.info(f"✅ Connected to SUPABASE: {supabase_host}")
        return SUPABASE_URL, "SUPABASE"
    
    logger.warning(f"⚠️  Supabase unreachable, falling back to LOCAL database")
    
    # Fallback to local
    if test_connection("localhost", 5432):
        logger.info("✅ Connected to LOCAL: pawMi_db")
        return LOCAL_URL, "LOCAL"
    
    # Both failed - return local anyway and let it fail properly with error message
    logger.error("❌ No database connection available!")
    return LOCAL_URL, "LOCAL"


def get_active_database_info() -> dict:
    """
    Get information about the currently active database.
    
    Returns:
        Dictionary with database connection details
    """
    url, db_type = get_database_url()
    parsed = urlparse(url)
    
    return {
        "type": db_type,
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/"),
        "user": parsed.username,
        "url": url
    }
