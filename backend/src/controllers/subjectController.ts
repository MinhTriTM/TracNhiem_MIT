import { Request, Response } from 'express';
import { getSubjects, getQuizzes, getQuizData } from '../utils/fileUtils';

export const getAllSubjects = (req: Request, res: Response) => {
    try {
        const subjects = getSubjects();
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách môn học' });
    }
};

export const getSubjectDetails = (req: Request, res: Response) => {
    try {
        const { subjectId } = req.params;
        const subjects = getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        
        if (!subject) {
            return res.status(404).json({ error: 'Không tìm thấy môn học' });
        }
        
        const quizzes = getQuizzes(subjectId);
        res.json({ ...subject, quizzes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server khi lấy thông tin môn học' });
    }
};

export const getQuiz = (req: Request, res: Response) => {
    try {
        const { subjectId, quizId } = req.params;
        const { mode } = req.query; // mode=practice will include answers
        
        let data: any;
        
        if (quizId === 'random' || quizId === 'all') {
            const quizNames = getQuizzes(subjectId);
            let allQuestions: any[] = [];
            
            for (const name of quizNames) {
                const quizData = getQuizData(subjectId, name);
                if (quizData && quizData.questions) {
                    allQuestions = [...allQuestions, ...quizData.questions];
                }
            }
            
            if (quizId === 'random') {
                // Shuffle and take 50
                allQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 50);
                data = {
                    chapter: 'Đề Ngẫu Nhiên (50 câu)',
                    total: allQuestions.length,
                    questions: allQuestions
                };
            } else {
                data = {
                    chapter: 'Đề Tổng Hợp (Tất cả câu hỏi)',
                    total: allQuestions.length,
                    questions: allQuestions
                };
            }
        } else {
            data = getQuizData(subjectId, quizId);
        }
        
        if (!data) {
            return res.status(404).json({ error: 'Không tìm thấy bài thi' });
        }
        
        // Ẩn đáp án nếu không phải chế độ luyện tập
        const sanitizedQuestions = data.questions.map((q: any) => {
            if (mode === 'practice') {
                return q; // Trả về cả đáp án cho chế độ hiện đáp án ngay
            }
            const { answer, ...rest } = q;
            return rest;
        });
        
        res.json({
            chapter: data.chapter,
            total: data.total,
            questions: sanitizedQuestions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server khi lấy bài thi' });
    }
};

export const submitQuiz = (req: Request, res: Response) => {
    try {
        const { subjectId, quizId } = req.params;
        const { answers } = req.body;
        
        let questions: any[] = [];
        
        if (quizId === 'random' || quizId === 'all') {
            // Re-fetch everything (this might be inconsistent if randomized is truly random each time)
            // For submit, we usually need the same question list. 
            // In a better design, we'd sessionize this. 
            // For now, let's assume the frontend sends the whole question list back or we handle it differently.
            // Actually, if we use mode=practice, we don't necessarily need a formal submit if we check locally.
            // But let's try to handle it.
            return res.status(400).json({ error: 'Submit not supported for virtual quizzes. Use practice mode results.' });
        } else {
            const data = getQuizData(subjectId, quizId);
            if (!data) return res.status(404).json({ error: 'Không tìm thấy bài thi' });
            questions = data.questions;
        }
        
        let correctCount = 0;
        const results: any[] = [];
        
        questions.forEach((q: any, index: number) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.answer;
            if (isCorrect) correctCount++;
            
            results.push({
                question: q.question,
                userAnswer: userAnswer || null,
                correctAnswer: q.answer,
                isCorrect
            });
        });
        
        const score = (correctCount / questions.length) * 10;
        
        res.json({
            total: questions.length,
            correctCount,
            score: score.toFixed(2),
            results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server khi nộp bài thi' });
    }
};
