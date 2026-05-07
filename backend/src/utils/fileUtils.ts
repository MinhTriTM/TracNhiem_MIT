import fs from 'fs';
import path from 'path';

// Resolve database path relative to the current working directory (backend folder)
export const DB_PATH = path.join(process.cwd(), '../Database');

export interface SubjectInfo {
    id: string;
    name: string;
    summary: string;
    overview: string;
}

export const ensureRenameMd = (subjectDir: string, subjectId: string) => {
    const renamePath = path.join(subjectDir, 'rename.md');
    if (!fs.existsSync(renamePath)) {
        const content = `# Tên môn: ${subjectId}\n\n**Tóm tắt:** Đây là môn học ${subjectId}.\n\n**Tổng quan:** Môn học này cung cấp các kiến thức cơ bản về ${subjectId}, giúp sinh viên nắm vững lý thuyết và thực hành qua các bài tập trắc nghiệm.`;
        fs.writeFileSync(renamePath, content, 'utf-8');
    }
};

export const parseRenameMd = (content: string): Partial<SubjectInfo> => {
    const lines = content.split('\n');
    let name = '';
    let summary = '';
    let overview = '';
    
    for (let line of lines) {
        if (line.startsWith('# Tên môn:')) {
            name = line.replace('# Tên môn:', '').trim();
        } else if (line.startsWith('**Tóm tắt:**')) {
            summary = line.replace('**Tóm tắt:**', '').trim();
        } else if (line.startsWith('**Tổng quan:**')) {
            overview = line.replace('**Tổng quan:**', '').trim();
        }
    }
    
    return { name, summary, overview };
};

export const getSubjects = (): SubjectInfo[] => {
    if (!fs.existsSync(DB_PATH)) {
        return [];
    }
    
    const items = fs.readdirSync(DB_PATH);
    const subjects: SubjectInfo[] = [];
    
    for (const item of items) {
        const subjectPath = path.join(DB_PATH, item);
        const stat = fs.statSync(subjectPath);
        
        if (stat.isDirectory()) {
            ensureRenameMd(subjectPath, item);
            const renameContent = fs.readFileSync(path.join(subjectPath, 'rename.md'), 'utf-8');
            const parsed = parseRenameMd(renameContent);
            
            subjects.push({
                id: item,
                name: parsed.name || item,
                summary: parsed.summary || '',
                overview: parsed.overview || ''
            });
        }
    }
    
    return subjects;
};

export const getQuizzes = (subjectId: string) => {
    const subjectPath = path.join(DB_PATH, subjectId);
    if (!fs.existsSync(subjectPath)) return [];
    
    const items = fs.readdirSync(subjectPath);
    return items.filter(item => item.endsWith('.json')).map(item => item.replace('.json', ''));
};

export const getQuizData = (subjectId: string, quizId: string) => {
    const quizPath = path.join(DB_PATH, subjectId, `${quizId}.json`);
    if (!fs.existsSync(quizPath)) return null;
    
    const content = fs.readFileSync(quizPath, 'utf-8');
    return JSON.parse(content);
};
