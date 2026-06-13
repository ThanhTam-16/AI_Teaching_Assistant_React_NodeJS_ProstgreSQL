/**
 * formatAIContent.js
 * Utility helper to convert AI-generated JSON objects into clean, readable Markdown strings
 * to be saved directly in the database.
 */

export function formatLessonOutline(data) {
  if (!data) return '';
  let md = '';

  if (data.title) {
    md += `# ${data.title}\n\n`;
  }

  if (data.objectives && Array.isArray(data.objectives) && data.objectives.length > 0) {
    md += `## Mục tiêu bài học\n`;
    md += data.objectives.map(o => `- ${o}`).join('\n') + '\n\n';
  } else if (data.objectives && typeof data.objectives === 'string') {
    md += `## Mục tiêu bài học\n${data.objectives}\n\n`;
  }

  if (data.sections && Array.isArray(data.sections)) {
    md += `## Nội dung chi tiết\n\n`;
    data.sections.forEach((sec, idx) => {
      md += `### ${idx + 1}. ${sec.heading || 'Phần ' + (idx + 1)}\n`;
      if (sec.summary) {
        md += `${sec.summary}\n\n`;
      }
      if (sec.keyPoints && Array.isArray(sec.keyPoints) && sec.keyPoints.length > 0) {
        md += `**Các điểm chính:**\n`;
        md += sec.keyPoints.map(kp => `- ${kp}`).join('\n') + '\n\n';
      }
    });
  }

  if (data.keyConcepts && Array.isArray(data.keyConcepts) && data.keyConcepts.length > 0) {
    md += `## Các khái niệm cốt lõi\n`;
    md += data.keyConcepts.map(c => `- ${c}`).join('\n') + '\n\n';
  }

  if (data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
    md += `## Hoạt động trên lớp\n`;
    md += data.activities.map(a => `- ${a}`).join('\n') + '\n\n';
  }

  if (data.assessmentSuggestion) {
    md += `## Gợi ý đánh giá\n${data.assessmentSuggestion}\n\n`;
  }

  return md.trim();
}

export function formatExercise(ex) {
  if (!ex) return '';
  let md = '';

  if (ex.title) {
    md += `# ${ex.title}\n`;
  }
  if (ex.difficulty) {
    md += `*Độ khó: ${ex.difficulty === 'EASY' ? 'Dễ' : ex.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}*\n\n`;
  }

  if (ex.description) {
    md += `## Mô tả bài tập\n${ex.description}\n\n`;
  }

  if (ex.requirements && Array.isArray(ex.requirements) && ex.requirements.length > 0) {
    md += `## Yêu cầu cần đạt\n`;
    md += ex.requirements.map(r => `- ${r}`).join('\n') + '\n\n';
  } else if (ex.requirements && typeof ex.requirements === 'string') {
    md += `## Yêu cầu cần đạt\n${ex.requirements}\n\n`;
  }

  if (ex.rubric && Array.isArray(ex.rubric) && ex.rubric.length > 0) {
    md += `## Tiêu chí chấm điểm (Rubric)\n`;
    md += ex.rubric.map(r => `- **${r.criteria || r.criterion}**: ${r.points}đ`).join('\n') + '\n\n';
  }

  return md.trim();
}

export function formatSlideOutline(data) {
  if (!data) return '';
  let md = '';

  if (data.title) {
    md += `# Slide Outline: ${data.title}\n\n`;
  } else {
    md += `# Slide Outline\n\n`;
  }

  if (data.slides && Array.isArray(data.slides)) {
    data.slides.forEach((slide, idx) => {
      md += `## Slide ${slide.slideNumber || (idx + 1)}: ${slide.title || 'Không có tiêu đề'}\n`;
      if (slide.bulletPoints && Array.isArray(slide.bulletPoints)) {
        md += slide.bulletPoints.map(bp => `- ${bp}`).join('\n') + '\n\n';
      } else if (slide.bulletPoints) {
        md += `- ${slide.bulletPoints}\n\n`;
      }
    });
  }

  return md.trim();
}

export default function formatAIContent(type, data) {
  if (type === 'LESSON_OUTLINE') return formatLessonOutline(data);
  if (type === 'EXERCISE') return formatExercise(data);
  if (type === 'SLIDE_OUTLINE') return formatSlideOutline(data);
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}
