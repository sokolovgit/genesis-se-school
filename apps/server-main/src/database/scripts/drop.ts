import { dropDatabase } from 'typeorm-extension';
import { config } from '../../../data-source';
(async () => {
  await dropDatabase({
    options: config,
    initialDatabase: 'postgres',
  });
})().catch((error) => {
  console.error('Error dropping database:', error);
});
