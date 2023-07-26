import express from 'express';
import path from 'path';
import chalk from 'chalk';
import env from './config/env';
import loadDb from './loaders/database';
import loadExpress from './loaders/express'; // Correct import statement for your custom 'loadExpress' function
import router from './loaders/routesLoader';
import errorHandler from './routes/middleware/errorHandler';

const app = loadExpress();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set mongodb connection.
loadDb();

app.use('/api', router);

app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  console.log(chalk.green.inverse(`Server running in ${env.NODE_ENV} environment.`));
  console.log(chalk.blue.inverse(`Server running on port ${port}.`));
});
