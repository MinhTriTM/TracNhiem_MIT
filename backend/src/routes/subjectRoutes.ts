import { Router } from 'express';
import { getAllSubjects, getSubjectDetails, getQuiz, submitQuiz } from '../controllers/subjectController';

const router = Router();

router.get('/', getAllSubjects);
router.get('/:subjectId', getSubjectDetails);
router.get('/:subjectId/quiz/:quizId', getQuiz);
router.post('/:subjectId/quiz/:quizId/submit', submitQuiz);

export default router;
