import { config } from '../../../data-source';
import { createDatabase } from 'typeorm-extension';

(async () => {
  await createDatabase({
    options: config,
    initialDatabase: 'postgres',
  });
})().catch((error) => {
  console.error('Error creating database:', error);
});
