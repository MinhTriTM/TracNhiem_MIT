import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Map, Mail, Phone, MapPin, Shield, HelpCircle, FileText } from 'lucide-react';
import Home from './pages/Home';
import SubjectDetails from './pages/SubjectDetails';
import Quiz from './pages/Quiz';

function App() {
  return (
    <Router>
      {/* Mesh Gradient Background */}
      <div className="mesh-backdrop">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>
      <div className="noise-overlay"></div>

      <div className="app-wrapper">
        {/* Header Glassmorphism */}
        <header className="app-header">
          <div className="header-container">
            <Link to="/" className="header-title">
              <GraduationCap className="w-8 h-8 text-accent-blue drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
              <span className="glow-text">The Singularity Learning</span>
            </Link>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subject/:subjectId" element={<SubjectDetails />} />
            <Route path="/subject/:subjectId/quiz/:quizId" element={<Quiz />} />
          </Routes>
        </main>

        {/* Footer Dark Aesthetic */}
        <footer className="app-footer">
          <div className="footer-container">
            <div className="footer-section">
              <h4>Thực Thể Trí Tuệ</h4>
              <p>Nền tảng học tập thế hệ mới. Giao diện <strong>Spatial UI & Mesh Gradient</strong>. Hệ thống không chỉ lưu trữ kiến thức, nó còn đồng bộ hóa với tư duy của bạn.</p>
            </div>
            <div className="footer-section">
              <h4>Giao Tiếp Hệ Thống</h4>
              <ul>
                <li>
                  <a href="#">
                    <Mail className="w-4 h-4" /> support@singularity.edu
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Phone className="w-4 h-4" /> 1900 1234
                  </a>
                </li>
                <li>
                  <a href="#">
                    <MapPin className="w-4 h-4" /> Khu Công Nghệ Cao
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Giao Thức Bổ Sung</h4>
              <ul>
                <li><a href="#"><Shield className="w-4 h-4" /> Điều khoản kết nối</a></li>
                <li><a href="#"><FileText className="w-4 h-4" /> Phân tích bảo mật</a></li>
                <li><a href="#"><HelpCircle className="w-4 h-4" /> Hướng dẫn đồng bộ não bộ</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} The Singularity Learning. Powered by Human Curiosity.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;