import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap()
  .then(() => console.log('Server started on port 3000'))
  .catch((err) => console.error('Error starting server:', err));
