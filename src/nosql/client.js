import config from '../config/mongo.config.json' assert { type: 'json' };;
import mongoose from 'mongoose';

mongoose.connect(config.connectionString);

export default mongoose;