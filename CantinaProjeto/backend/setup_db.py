#!/usr/bin/env python3
# Script para configurar o banco de dados
from doctest import debug

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
import psycopg2
import os

def get_connection():
    if os.environ.get("PGHOST") == "localhost":
        conn = psycopg2.connect(
            host=os.environ.get("PGHOST"),
            database=os.environ.get("PGDATABASE"),
            user=os.environ.get("PGUSER"),
            password=os.environ.get("PGPASSWORD"),
            sslmode="PGSSLMODE",
            channel_binding="PGCHANNELBINDING"
        )
    else:
        conn = psycopg2.connect(
            host=os.environ.get("PGHOST"),
            database=os.environ.get("PGDATABASE"),
            user=os.environ.get("PGUSER"),
            password=os.environ.get("PGPASSWORD"),
            sslmode=os.environ.get("PGSSLMODE"),
            channel_binding=os.environ.get("PGCHANNELBINDING")
        )
    return conn
