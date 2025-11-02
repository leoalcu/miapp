// db/migrate-game-storage.ts
import postgres from 'postgres';
import 'dotenv/config';

async function migrate() {
  console.log('🚀 Creando tabla para partidas en curso...');

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida');
  }

  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Crear tabla para almacenar partidas en curso
    await client`
      CREATE TABLE IF NOT EXISTS game_rooms (
        room_code VARCHAR(10) PRIMARY KEY,
        game_state JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Tabla game_rooms creada');

    // Crear índice para limpiar partidas viejas
    await client`
      CREATE INDEX IF NOT EXISTS idx_game_rooms_updated 
      ON game_rooms(updated_at)
    `;
    console.log('✅ Índice creado');

    console.log('✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));