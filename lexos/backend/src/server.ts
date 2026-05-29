import app from './app';
import { config } from './config';
import { db } from './config/database';

async function bootstrap() {
  // Verify DB connectivity
  try {
    await db.query('SELECT 1');
    console.log('PostgreSQL: connected');
  } catch (err) {
    console.error('PostgreSQL: connection failed', err);
    process.exit(1);
  }

  const server = app.listen(config.PORT, () => {
    console.log(`LexOS API running on port ${config.PORT} [${config.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await db.end();
      console.log('PostgreSQL pool closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after 10s');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
