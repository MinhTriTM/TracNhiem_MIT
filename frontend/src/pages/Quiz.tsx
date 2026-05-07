import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Question {
    question: string;
    options: string[];
}

interface QuizData {
    chapter: string;
    total: number;
    questions: Question[];
}

interface QuizResult {
    total: number;
    correctCount: number;
    score: string;
    results: {
        question: string;
        userAnswer: string | null;
        correctAnswer: string;
        isCorrect: boolean;
    }[];
}

const Quiz = () => {
    const { subjectId, quizId } = useParams<{ subjectId: string; quizId: string }>();
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [revealed, setRevealed] = useState<{ [key: number]: boolean }>({});
    const [correctAnswers, setCorrectAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    useEffect(() => {
        fetch(`http://localhost:5051/api/subjects/${subjectId}/quiz/${quizId}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setQuizData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Không thể tải bài thi');
                setLoading(false);
            });
    }, [subjectId, quizId]);

    const handleOptionChange = async (questionIndex: number, option: string) => {
        if (result || revealed[questionIndex]) return; 
        
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: option
        }));

        // Hiển thị đáp án ngay lập tức bằng cách gọi API validate câu hỏi đó hoặc nộp nháp
        try {
            const res = await fetch(`http://localhost:5051/api/subjects/${subjectId}/quiz/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: { [questionIndex]: option } })
            });
            const data = await res.json();
            const qResult = data.results[0];
            
            setCorrectAnswers(prev => ({
                ...prev,
                [questionIndex]: qResult.correctAnswer
            }));
            setRevealed(prev => ({
                ...prev,
                [questionIndex]: true
            }));
        } catch (err) {
            console.error("Lỗi khi kiểm tra đáp án:", err);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5051/api/subjects/${subjectId}/quiz/${quizId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers })
            });
            
            if (!res.ok) throw new Error('Failed to submit');
            const data = await res.json();
            setResult(data);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi nộp bài.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Đang tải bài thi...</div>;
    if (error) return <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--danger-red)'}}>{error}</div>;
    if (!quizData) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Không tìm thấy dữ liệu bài thi</div>;

    const answeredCount = Object.keys(answers).length;
    const progressPercent = Math.round((answeredCount / quizData.questions.length) * 100);

    return (
        <div>
            <div className="nav-links">
                <Link to={`/subject/${subjectId}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Quay lại danh sách bài thi
                </Link>
            </div>
            
            <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
                    {quizData.chapter || quizId}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                    <p style={{ fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        Tổng số: <strong style={{color: 'var(--neon-blue)'}}>{quizData.questions.length}</strong> câu
                    </p>
                    {!result && (
                        <p style={{ fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            Đã làm: <strong style={{color: 'var(--emerald-green)'}}>{answeredCount}</strong> câu ({progressPercent}%)
                        </p>
                    )}
                </div>
                
                {/* Progress bar */}
                {!result && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--emerald-green)', boxShadow: '0 0 10px var(--emerald-green-glow)', transition: 'width 0.3s ease' }}></div>
                    </div>
                )}
            </div>

            {result && (
                <div className="result-summary-box">
                    <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Hoàn Thành Bài Thi!
                    </h3>
                    <div className="score">{result.score} <span style={{fontSize: '1.5rem', color: 'rgba(255,255,255,0.5)'}}>/ 10</span></div>
                    <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
                        Số câu đúng: <strong style={{color: 'var(--emerald-green)'}}>{result.correctCount}</strong> / {result.total}
                    </p>
                </div>
            )}

            <div>
                {quizData.questions.map((q, index) => {
                    const isRevealed = revealed[index] || !!result;
                    const correctAnswer = correctAnswers[index] || result?.results[index].correctAnswer;
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === correctAnswer;

                    return (
                        <div key={index} className="glass-card question-block">
                            <h3><span className="question-number">Câu {index + 1}:</span> {q.question}</h3>
                            <ul className="options-list">
                                {q.options.map((option, optIdx) => {
                                    let labelClass = "option-label";
                                    
                                    if (isRevealed) {
                                        labelClass += " disabled";
                                        if (option === correctAnswer) {
                                            labelClass += " correct";
                                        } else if (option === userAnswer && !isCorrect) {
                                            labelClass += " incorrect";
                                        }
                                    } else {
                                        if (answers[index] === option) {
                                            labelClass += " selected";
                                        }
                                    }

                                    return (
                                        <li key={optIdx}>
                                            <label className={labelClass}>
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value={option}
                                                    checked={answers[index] === option}
                                                    onChange={() => handleOptionChange(index, option)}
                                                    disabled={isRevealed}
                                                />
                                                {option}
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                            {isRevealed && (
                                <div>
                                    {isCorrect ? (
                                        <div className="result-correct">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            Tuyệt vời! Đáp án chính xác.
                                        </div>
                                    ) : (
                                        <div className="result-incorrect">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                            Sai rồi! Đáp án đúng là: <strong style={{color: '#fff', marginLeft: '0.25rem'}}>{correctAnswer}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!result && (
                <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                    <button 
                        className={`btn-emerald ${isSubmitting ? 'btn-disabled' : ''}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting || answeredCount === 0}
                        style={{ fontSize: '1.25rem', padding: '1rem 4rem' }}
                    >
                        {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang Xử Lý...</> : 'NỘP BÀI THI'}
                    </button>
                    {answeredCount > 0 && answeredCount < quizData.questions.length && (
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            Bạn còn <strong>{quizData.questions.length - answeredCount}</strong> câu chưa làm.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Quiz;