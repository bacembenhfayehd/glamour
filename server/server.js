import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
//import logger from './utils/logger.js'
import app from './app.js';
dotenv.config();

const PORT = process.env.PORT


await connectDB();

app.listen(PORT, () => {
  //logger.info(`Server running on port ${PORT}`);
  console.log(`server is running on port ${PORT}`)
});






