import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initDb = async () => {
    if (dbInstance) return dbInstance;

    try {
        dbInstance = await open({
            filename: path.join(__dirname, '../../../Database/quiz_app.db'),
            driver: sqlite3.Database
        });

        console.log('✅ SQLite Database connected successfully.');

        // Initialize schema
        await dbInstance.exec(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                passwordHash TEXT NOT NULL,
                role TEXT DEFAULT 'STUDENT_FREE',
                expPoints INTEGER DEFAULT 0,
                currentStreak INTEGER DEFAULT 0,
                coins INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS Quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                subjectId TEXT,
                mode TEXT DEFAULT 'PRACTICE',
                timeLimit INTEGER
            );

            CREATE TABLE IF NOT EXISTS Questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quizId INTEGER,
                content TEXT NOT NULL,
                type TEXT DEFAULT 'SINGLE_CHOICE',
                options TEXT, -- JSON string
                correctAnswer TEXT,
                explanation TEXT,
                FOREIGN KEY(quizId) REFERENCES Quizzes(id)
            );

            CREATE TABLE IF NOT EXISTS QuizAttempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                quizId INTEGER,
                score REAL DEFAULT 0,
                status TEXT DEFAULT 'IN_PROGRESS',
                startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
                endTime DATETIME,
                FOREIGN KEY(userId) REFERENCES Users(id),
                FOREIGN KEY(quizId) REFERENCES Quizzes(id)
            );

            CREATE TABLE IF NOT EXISTS AiConfigurations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                provider TEXT DEFAULT 'GEMINI',
                customApiKey TEXT,
                FOREIGN KEY(userId) REFERENCES Users(id)
            );
        `);
        console.log('✅ Database schema initialized.');

        return dbInstance;
    } catch (error) {
        console.error('❌ Failed to connect to SQLite Database:', error);
        throw error;
    }
};

export const getDb = () => {
    if (!dbInstance) {
        throw new Error('Database has not been initialized. Call initDb first.');
    }
    return dbInstance;
};