// db/migrate.ts
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import 'dotenv/config';

async function migrate() {
  console.log('🚀 Iniciando migración de base de datos...');

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida');
  }

  // Crear conexión directa para migración
  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Crear tabla users
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Tabla users creada');

    // Crear tabla games
    await client`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP DEFAULT NOW() NOT NULL,
        finished_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'in_progress' NOT NULL,
        duration_minutes INTEGER,
        variant VARCHAR(50) DEFAULT 'standard'
      )
    `;
    console.log('✅ Tabla games creada');

    // Crear tabla epochs
    await client`
      CREATE TABLE IF NOT EXISTS epochs (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        epoch_number INTEGER NOT NULL,
        started_at TIMESTAMP DEFAULT NOW() NOT NULL,
        finished_at TIMESTAMP,
        board_state JSONB
      )
    `;
    console.log('✅ Tabla epochs creada');

    // Crear tabla game_players
    await client`
      CREATE TABLE IF NOT EXISTS game_players (
        id SERIAL PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        color VARCHAR(20) NOT NULL,
        final_gold INTEGER DEFAULT 0 NOT NULL,
        final_position INTEGER,
        is_winner BOOLEAN DEFAULT FALSE NOT NULL,
        joined_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Tabla game_players creada');

    // Crear tabla epoch_scores
    await client`
      CREATE TABLE IF NOT EXISTS epoch_scores (
        id SERIAL PRIMARY KEY,
        epoch_id INTEGER NOT NULL REFERENCES epochs(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gold_at_start INTEGER NOT NULL,
        gold_earned INTEGER NOT NULL,
        gold_at_end INTEGER NOT NULL,
        castles_placed INTEGER DEFAULT 0,
        rank_1_used INTEGER DEFAULT 0,
        rank_2_used INTEGER DEFAULT 0,
        rank_3_used INTEGER DEFAULT 0,
        rank_4_used INTEGER DEFAULT 0
      )
    `;
    console.log('✅ Tabla epoch_scores creada');

    console.log('✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    // Cerrar conexión
    await client.end();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));