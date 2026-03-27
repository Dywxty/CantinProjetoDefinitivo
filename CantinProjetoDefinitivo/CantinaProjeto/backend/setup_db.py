#!/usr/bin/env python3
# Script para configurar o banco de dados
from doctest import debug

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

PGHOST='ep-curly-truth-anfbnugb-pooler.c-6.us-east-1.aws.neon.tech'
PGDATABASE='neondb'
PGUSER='neondb_owner'
PGPASSWORD='npg_Z9FCnYBH5zEp'
PGSSLMODE='require'
PGCHANNELBINDING='require'