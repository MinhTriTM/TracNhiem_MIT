import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, Zap, ChevronRight } from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    summary: string;
    overview: string;
}

const Home = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5051/api/subjects')
            .then(res => res.json())
            .then(data => {
                setSubjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Không thể đồng bộ dữ liệu với thực thể máy chủ.');
                setLoading(false);
            });
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Đang đồng bộ hóa tri thức...</div>;
    if (error) return <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--danger-red)'}}>{error}</div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', textShadow: '0 0 30px rgba(56, 189, 248, 0.5)' }}>
                        KẾT NỐI <span className="glow-text">TRI THỨC</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                        Trạng thái não bộ: <strong style={{color: 'var(--accent-emerald)'}}>Tối ưu</strong>. Chọn mô-đun dữ liệu bên dưới để bắt đầu quá trình thẩm thấu.
                    </p>
                </motion.div>
            </div>
            
            <div className="bento-grid">
                {/* Intro Bento Box - Tall */}
                <motion.div variants={itemVariants} className="bento-item bento-tall" style={{background: 'linear-gradient(145deg, rgba(126,34,206,0.1), rgba(0,0,0,0))', border: '1px solid rgba(168, 85, 247, 0.3)'}}>
                    <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px', color: 'var(--accent-purple)', width: 'fit-content', marginBottom: '1.5rem' }}>
                        <BrainCircuit className="w-8 h-8 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Mạng Lưới Neural</h3>
                    <p style={{ flex: 1 }}>Hệ thống đang theo dõi nhịp điệu học tập của bạn. Các môn học được sắp xếp dựa trên chỉ số lãng quên dự đoán (Memory Decay Prediction).</p>
                    <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <span>Độ tập trung</span>
                            <span style={{color: 'var(--accent-emerald)'}}>94%</span>
                        </div>
                        <div style={{width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px'}}>
                            <motion.div 
                                initial={{width: 0}}
                                animate={{width: '94%'}}
                                transition={{duration: 1.5, delay: 0.5}}
                                style={{width: '94%', height: '100%', background: 'var(--accent-emerald)', boxShadow: '0 0 10px rgba(52, 211, 153, 0.5)'}}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Subject Cards */}
                {subjects.map((subject, index) => {
                    const isWide = index === 0; // Thẻ đầu tiên làm bento-wide cho đẹp
                    return (
                        <motion.div 
                            key={subject.id} 
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2, zIndex: 10 }}
                            className={`bento-item ${isWide ? 'bento-wide' : ''}`}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: 'var(--accent-blue)' }}>
                                        <Activity className="w-6 h-6 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem' }}>{subject.name}</h3>
                                </div>
                                <Sparkles className="w-5 h-5 text-accent-purple opacity-50" />
                            </div>
                            
                            <p style={{ flex: 1, marginBottom: '2rem', fontSize: '0.95rem' }}>{subject.summary}</p>
                            
                            <div style={{ marginTop: 'auto' }}>
                                <Link to={`/subject/${subject.id}`} className="btn-neon" style={{ width: '100%', justifyContent: 'space-between' }}>
                                    Kích hoạt Mô-đun
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}

                {subjects.length === 0 && (
                    <motion.div variants={itemVariants} className="bento-item bento-wide" style={{textAlign: 'center', justifyContent: 'center'}}>
                        <Zap className="w-12 h-12 text-accent-blue mx-auto mb-1rem opacity-50" />
                        <h3>Kho dữ liệu trống</h3>
                        <p>Vui lòng nạp thêm tri thức vào hệ thống.</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Home;