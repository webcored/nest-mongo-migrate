import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    await CommandFactory.run(AppModule);
  } catch (error) {
    console.log(error);
  }

  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
}
bootstrap();
