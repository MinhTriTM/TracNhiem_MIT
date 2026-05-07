import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subjectRoutes from './routes/subjectRoutes';
import { getSubjects } from './utils/fileUtils';
import { initDb } from './utils/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5051;

app.use(cors());
app.use(express.json());

// Initialize Database
initDb().catch(console.error);

// Run initialization to ensure rename.md files exist
getSubjects();

app.use('/api/subjects', subjectRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
