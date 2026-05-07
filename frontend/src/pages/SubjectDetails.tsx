import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface SubjectDetailsType {
    id: string;
    name: string;
    summary: string;
    overview: string;
    quizzes: string[];
}

const SubjectDetails = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [subject, setSubject] = useState<SubjectDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5051/api/subjects/${subjectId}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setSubject(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Không thể tải thông tin môn học');
                setLoading(false);
            });
    }, [subjectId]);

    if (loading) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Đang tải...</div>;
    if (error) return <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--danger-red)'}}>{error}</div>;
    if (!subject) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Không tìm thấy môn học</div>;

    return (
        <div>
            <div className="nav-links">
                <Link to="/">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Trở về Trang Chủ
                </Link>
            </div>
            
            <div className="glass-card" style={{ borderLeft: '4px solid var(--neon-blue)' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>{subject.name}</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>{subject.id}</span>
                    <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--neon-blue)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        {subject.quizzes?.length || 0} Bộ đề
                    </span>
                </div>
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><strong>Tóm tắt:</strong> {subject.summary}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>{subject.overview}</p>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--emerald-green)'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Danh sách bộ đề
                </h3>
            </div>
            
            {subject.quizzes && subject.quizzes.length > 0 ? (
                <div className="quiz-list">
                    {subject.quizzes.map(quiz => (
                        <Link key={quiz} to={`/subject/${subject.id}/quiz/${quiz}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            <span style={{ flex: 1 }}>{quiz}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>Thi ngay &rarr;</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="glass-card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p>Chưa có bài thi nào cho môn học này.</p>
                </div>
            )}
        </div>
    );
};

export default SubjectDetails;