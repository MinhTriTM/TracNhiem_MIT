import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

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
    
    // Quiz State
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [revealed, setRevealed] = useState<{ [key: number]: boolean }>({});
    const [correctAnswers, setCorrectAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    // Hyperfocus State
    const [isFeynmanMode, setIsFeynmanMode] = useState(false);
    const [feynmanRevealed, setFeynmanRevealed] = useState<{ [key: number]: boolean }>({});

    // Ultradian Rhythm (45/15)
    const [isUltradianEnabled, setIsUltradianEnabled] = useState(true);
    const [rhythmPhase, setRhythmPhase] = useState<'focus' | 'rest'>('focus');
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 mins
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Audio
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const leftOscRef = useRef<OscillatorNode | null>(null);
    const rightOscRef = useRef<OscillatorNode | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetch(`http://localhost:5051/api/subjects/${subjectId}/quiz/${quizId}`)
            .then(res => {
                if (!res.ok) throw new Error('Không thể tải bài thi');
                return res.json();
            })
            .then(data => {
                setQuizData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [subjectId, quizId]);

    // Timer Logic
    useEffect(() => {
        if (!isUltradianEnabled || isSubmitting || result) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    // Switch Phase
                    if (rhythmPhase === 'focus') {
                        setRhythmPhase('rest');
                        switchAudioWave('theta');
                        return 15 * 60; // 15 min rest
                    } else {
                        setRhythmPhase('focus');
                        switchAudioWave('beta');
                        return 45 * 60; // 45 min focus
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isUltradianEnabled, isSubmitting, result, rhythmPhase]);

    // Cleanup Audio
    useEffect(() => {
        return () => {
            if (leftOscRef.current) leftOscRef.current.stop();
            if (rightOscRef.current) rightOscRef.current.stop();
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    // Audio Control
    const toggleBinauralBeats = useCallback(() => {
        if (isAudioPlaying) {
            if (leftOscRef.current) leftOscRef.current.stop();
            if (rightOscRef.current) rightOscRef.current.stop();
            setIsAudioPlaying(false);
        } else {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }

            const baseFreq = 200;
            const offset = rhythmPhase === 'focus' ? 14 : 6;

            const leftOsc = audioCtxRef.current.createOscillator();
            const rightOsc = audioCtxRef.current.createOscillator();

            const leftPan = audioCtxRef.current.createStereoPanner(); leftPan.pan.value = -1;
            const rightPan = audioCtxRef.current.createStereoPanner(); rightPan.pan.value = 1;

            const masterGain = audioCtxRef.current.createGain();
            masterGain.gain.value = 0.1;

            leftOsc.type = 'sine'; leftOsc.frequency.value = baseFreq;
            rightOsc.type = 'sine'; rightOsc.frequency.value = baseFreq + offset;

            leftOsc.connect(leftPan).connect(masterGain);
            rightOsc.connect(rightPan).connect(masterGain);
            masterGain.connect(audioCtxRef.current.destination);

            leftOsc.start(); rightOsc.start();

            leftOscRef.current = leftOsc;
            rightOscRef.current = rightOsc;
            setIsAudioPlaying(true);
        }
    }, [isAudioPlaying, rhythmPhase]);

    const switchAudioWave = (wave: 'beta' | 'theta') => {
        if (!isAudioPlaying || !leftOscRef.current || !rightOscRef.current) return;
        const baseFreq = 200;
        const offset = wave === 'beta' ? 14 : 6;
        leftOscRef.current.frequency.setValueAtTime(baseFreq, audioCtxRef.current!.currentTime);
        rightOscRef.current.frequency.setValueAtTime(baseFreq + offset, audioCtxRef.current!.currentTime);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent if rest phase
            if (rhythmPhase === 'rest' || isSubmitting || result) return;

            // Feynman reveal on Space
            if (e.key === ' ' && isFeynmanMode) {
                e.preventDefault();
                // Reveal all unrevealed for simplicity, or we would need to know which question is in view
                const newRevealed = { ...feynmanRevealed };
                quizData?.questions.forEach((_, i) => { newRevealed[i] = true; });
                setFeynmanRevealed(newRevealed);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFeynmanMode, feynmanRevealed, rhythmPhase, isSubmitting, result, quizData]);

    const handleSelectOption = async (qIndex: number, optionChar: string) => {
        if (result || revealed[qIndex] || rhythmPhase === 'rest') return;

        setAnswers({ ...answers, [qIndex]: optionChar });

        try {
            const res = await fetch(`http://localhost:5051/api/subjects/${subjectId}/quiz/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: { [qIndex]: optionChar },
                    single_question: true,
                    question_index: qIndex
                })
            });

            if (res.ok) {
                const checkData = await res.json();
                setCorrectAnswers(prev => ({ ...prev, [qIndex]: checkData.correctAnswer }));
                setRevealed(prev => ({ ...prev, [qIndex]: true }));
            }
        } catch (err) {
            console.error('Lỗi khi check đáp án:', err);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn nộp toàn bộ bài thi?')) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5051/api/subjects/${subjectId}/quiz/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });

            if (!res.ok) throw new Error('Lỗi khi nộp bài');

            const resultData = await res.json();
            setResult(resultData);
            setIsSubmitting(false);
            if (isAudioPlaying) toggleBinauralBeats(); // Stop audio on finish
        } catch (err: any) {
            alert(err.message);
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#60a5fa' }}>Đang kết nối thần kinh...</div>;
    if (error || !quizData) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ef4444' }}>{error}</div>;

    const answeredCount = Object.keys(answers).length;

    return (
        <div className="container" style={{ paddingBottom: '5rem', position: 'relative' }}>
            {/* Rest Phase Overlay (NSDR) */}
            {rhythmPhase === 'rest' && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#0f172a',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#818cf8', marginBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Giai Đoạn Thôi Miên & Nghỉ Ngơi
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.125rem', marginBottom: '3rem' }}>"Tiềm thức của bạn đang dọn dẹp và đóng gói kiến thức..."</p>

                    <div style={{ position: 'relative', width: '12rem', height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#6366f1', borderRadius: '50%', filter: 'blur(32px)', animation: 'breath 8s infinite ease-in-out' }}></div>
                        <div style={{ position: 'relative', zIndex: 10, fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', maxWidth: '28rem', textAlign: 'center', lineHeight: 1.6 }}>
                        Hãy nhắm mắt lại. Hít vào 4 giây, giữ 4 giây, thở ra 6 giây. Lắng nghe sóng Theta và để các nơ-ron thần kinh tự động kết nối.
                    </p>
                    <button
                        onClick={() => {
                            setRhythmPhase('focus');
                            setTimeRemaining(45 * 60);
                            switchAudioWave('beta');
                        }}
                        style={{ marginTop: '3rem', padding: '0.5rem 1.5rem', fontSize: '0.875rem', color: '#64748b', border: '1px solid #334155', borderRadius: '9999px', background: 'transparent', cursor: 'pointer' }}
                    >
                        Bỏ qua & Học tiếp (Không khuyến khích)
                    </button>
                    <style>{`
                        @keyframes breath {
                            0% { transform: scale(1); opacity: 0.5; }
                            50% { transform: scale(1.5); opacity: 1; }
                            100% { transform: scale(1); opacity: 0.5; }
                        }
                    `}</style>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <Link to={`/subject/${subjectId}`} className="btn-secondary" style={{ marginRight: '1rem' }}>← Trở Về</Link>
                    <h1 style={{ display: 'inline-block', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                        {quizData.chapter}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsUltradianEnabled(!isUltradianEnabled)}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                        ⏱ 45/15: {isUltradianEnabled ? 'BẬT' : 'TẮT'}
                    </button>
                    <button
                        onClick={() => setIsFeynmanMode(!isFeynmanMode)}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                        🧠 Feynman: {isFeynmanMode ? 'BẬT' : 'TẮT'}
                    </button>
                    <button
                        onClick={toggleBinauralBeats}
                        style={{ background: isAudioPlaying ? '#4f46e5' : 'transparent', border: '1px solid #4f46e5', color: isAudioPlaying ? '#fff' : '#818cf8', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.875rem' }}
                    >
                        🎧 Sóng Não
                    </button>
                    <div style={{ background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.25rem', color: rhythmPhase === 'focus' ? '#38bdf8' : '#a78bfa' }}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            {result && (
                <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(to bottom right, #1e293b, #0f172a)' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8', marginBottom: '0.5rem' }}>ĐÓNG GÓI THÀNH CÔNG</h2>
                    <p style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', margin: '1rem 0' }}>{result.score}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                        Đã neo vào trí nhớ: <strong style={{ color: '#10b981' }}>{result.correctCount}</strong> / {result.total} câu
                    </p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {quizData.questions.map((q, qIndex) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const userAnswer = result ? result.results[qIndex].userAnswer : answers[qIndex];
                    const isRevealed = result ? true : revealed[qIndex];
                    const correctAnswerStr = result ? result.results[qIndex].correctAnswer : correctAnswers[qIndex];
                    const isCorrect = result ? result.results[qIndex].isCorrect : (userAnswer === correctAnswerStr);

                    const isFeynmanActive = isFeynmanMode && !isRevealed && !feynmanRevealed[qIndex] && !result;

                    return (
                        <div key={qIndex} className="card" style={{ position: 'relative' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                <span style={{ color: 'var(--accent-blue)', marginRight: '0.5rem' }}>Câu {qIndex + 1}:</span>
                                {q.question.replace(/^Câu \d+:\s*/, '')}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', position: 'relative' }}>
                                <div style={{ filter: isFeynmanActive ? 'blur(8px)' : 'none', opacity: isFeynmanActive ? 0.4 : 1, transition: 'all 0.3s' }}>
                                    {q.options.map((opt, oIndex) => {
                                        const char = letters[oIndex];
                                        const isSelected = userAnswer === char;
                                        const isRightOption = isRevealed && char === correctAnswerStr;
                                        const isWrongSelected = isRevealed && isSelected && !isCorrect;

                                        let optionClass = 'quiz-option';
                                        if (isRevealed) {
                                            optionClass += ' quiz-option-disabled';
                                            if (isRightOption) optionClass += ' quiz-option-correct';
                                            else if (isWrongSelected) optionClass += ' quiz-option-wrong';
                                        } else if (isSelected) {
                                            optionClass += ' quiz-option-selected';
                                        }

                                        return (
                                            <button
                                                key={oIndex}
                                                className={optionClass}
                                                onClick={() => {
                                                    if (isFeynmanActive) return;
                                                    handleSelectOption(qIndex, char);
                                                }}
                                                disabled={isRevealed || rhythmPhase === 'rest' || isFeynmanActive}
                                                style={{ marginBottom: '0.75rem', width: '100%' }}
                                            >
                                                <span className="quiz-option-letter">{char}</span>
                                                <span style={{ textAlign: 'left', flex: 1 }}>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {isFeynmanActive && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                        <button
                                            onClick={() => setFeynmanRevealed(prev => ({ ...prev, [qIndex]: true }))}
                                            style={{ background: '#4f46e5', color: 'white', padding: '0.75rem 2rem', borderRadius: '9999px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            👁️ Đã nghĩ xong! Hiển thị đáp án
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isRevealed && !result && (
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', animation: 'fadeIn 0.3s ease-out' }}>
                                    {isCorrect ? (
                                        <div className="result-correct">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            Tuyệt vời! Dopamine đã được giải phóng.
                                        </div>
                                    ) : (
                                        <div className="result-incorrect">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                            Sai rồi! Đáp án đúng là: <strong style={{color: '#fff', marginLeft: '0.25rem'}}>{correctAnswerStr}</strong>
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
                        disabled={isSubmitting || answeredCount === 0 || rhythmPhase === 'rest'}
                        style={{ fontSize: '1.25rem', padding: '1rem 4rem' }}
                    >
                        {isSubmitting ? 'ĐANG ĐÓNG GÓI...' : 'ĐÓNG GÓI KIẾN THỨC'}
                    </button>
                    {answeredCount > 0 && answeredCount < quizData.questions.length && (
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            Đã nạp <strong>{answeredCount} / {quizData.questions.length}</strong> nơ-ron.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Quiz;
