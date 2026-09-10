const PDFDocument = require('pdfkit');

const formatTime = (ms) => {
  if (!ms || isNaN(ms)) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const generateTeamPdf = (res, team, submission, questions) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.pipe(res);

  // Header
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('MCQ TEST SYSTEM - RESULT REPORT', { align: 'center' });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1);

  // Divider
  doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // Team & Performance Summary Box
  const summaryTop = doc.y;
  doc
    .rect(40, summaryTop, 515, 80)
    .fillAndStroke('#f8f9fa', '#e9ecef');

  doc.fillColor('#000000');
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Team Name: ${team ? team.teamName : 'Unknown'}`, 55, summaryTop + 12);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Username: ${team ? team.username : 'N/A'}`, 55, summaryTop + 32);
  doc.text(
    `Status: ${submission && submission.submitted ? 'Submitted' : 'Not Submitted'}`,
    55,
    summaryTop + 50
  );

  const scoreText = submission && submission.score !== null ? `${submission.score} / ${questions.length}` : 'Pending';
  const timeText = submission && submission.timeTakenMs ? formatTime(submission.timeTakenMs) : 'N/A';

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Score: ${scoreText}`, 320, summaryTop + 12);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Time Taken: ${timeText}`, 320, summaryTop + 32);
  if (submission && submission.endTime) {
    doc.text(`Submitted At: ${new Date(submission.endTime).toLocaleTimeString()}`, 320, summaryTop + 50);
  }

  doc.y = summaryTop + 95;
  doc.moveDown(0.5);

  // Section Header
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#333333')
    .text('Submitted Answers Breakdown', 40);
  doc.moveDown(0.5);

  // Build Answer Map
  const answerMap = new Map();
  if (submission && Array.isArray(submission.answers)) {
    submission.answers.forEach((ans) => {
      if (ans.questionId) {
        answerMap.set(ans.questionId.toString(), ans.selectedOption);
      }
    });
  }

  // Iterate questions
  questions.forEach((q, index) => {
    const qId = q._id.toString();
    const selected = answerMap.get(qId) || 'Not Answered';
    const isCorrect = q.correctOption && q.correctOption.trim() === selected.trim();

    // Check if we need a new page
    if (doc.y > 700) {
      doc.addPage();
    }

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#111111')
      .text(`Q${index + 1}. ${q.questionText}`, 40);

    doc.moveDown(0.3);

    // Render options
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, optIdx) => {
        const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
        const isThisSelected = opt.trim() === selected.trim();
        const isThisCorrect = q.correctOption && q.correctOption.trim() === opt.trim();

        let marker = `[  ]`;
        if (isThisSelected) {
          marker = `[x]`;
        }

        doc
          .fontSize(10)
          .font(isThisSelected ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(isThisSelected ? (isCorrect ? '#2e7d32' : '#c62828') : '#555555')
          .text(`    ${marker} (${optionLabel}) ${opt}`, 50);
      });
    }

    doc.moveDown(0.3);

    // Selected Answer details
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(selected === 'Not Answered' ? '#d32f2f' : (isCorrect ? '#2e7d32' : '#c62828'))
      .text(`    Selected Answer: ${selected} ${isCorrect ? '(Correct)' : selected === 'Not Answered' ? '' : `(Correct: ${q.correctOption})`}`, 50);

    doc.moveDown(0.8);
    doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);
  });

  doc.end();
};

module.exports = {
  generateTeamPdf,
};
