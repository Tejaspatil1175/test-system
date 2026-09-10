import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import cQuestionsData from '../data/c_questions.json';
import {
  FileQuestion,
  PlusCircle,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  Code2,
  ListOrdered,
  UploadCloud,
  FileCode,
  Sparkles
} from 'lucide-react';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState('mcq'); // 'mcq' or 'code_rearrange'
  const [questionText, setQuestionText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchQuestions = async () => {
    try {
      setFetching(true);
      const res = await api.get('/admin/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const filteredOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      setMessage({ type: 'error', text: 'Please provide at least 2 non-empty options.' });
      return;
    }

    const correctOption = options[correctOptionIdx] ? options[correctOptionIdx].trim() : '';
    if (!correctOption) {
      setMessage({ type: 'error', text: 'Please select a valid non-empty correct option.' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/admin/questions', {
        questionText: questionText.trim(),
        type: questionType,
        codeSnippet: codeSnippet.trim(),
        options: filteredOptions,
        correctOption,
      });

      setMessage({ type: 'success', text: 'Question added to repository successfully!' });
      setQuestionText('');
      setCodeSnippet('');
      setOptions(['', '', '', '']);
      setCorrectOptionIdx(0);
      fetchQuestions();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          (err.response && err.response.data && err.response.data.message) ||
          'Failed to add question.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportSampleCQuestions = async () => {
    if (!window.confirm(`Load ${cQuestionsData.length} curated C Programming and Code Rearrangement questions from JSON into the database?`)) {
      return;
    }

    setImporting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/admin/questions/bulk', {
        questions: cQuestionsData,
      });

      setMessage({
        type: 'success',
        text: res.data.message || `Imported ${cQuestionsData.length} C questions successfully!`,
      });
      fetchQuestions();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          (err.response && err.response.data && err.response.data.message) ||
          'Failed to import sample C questions.',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this question?')) return;

    try {
      await api.delete(`/admin/questions/${id}`);
      setMessage({ type: 'success', text: 'Question deleted successfully.' });
      fetchQuestions();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          (err.response && err.response.data && err.response.data.message) ||
          'Failed to delete question.',
      });
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;
    const term = searchTerm.toLowerCase();
    return questions.filter(
      (q) =>
        (q.questionText && q.questionText.toLowerCase().includes(term)) ||
        (q.codeSnippet && q.codeSnippet.toLowerCase().includes(term))
    );
  }, [questions, searchTerm]);

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Question Bank
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Manage Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Create standard C MCQs, Code Rearrangement problems, or import questions via JSON
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleImportSampleCQuestions}
            className="btn btn-secondary"
            style={{
              padding: '0.6rem 1rem',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
              background: 'rgba(99, 102, 241, 0.05)',
            }}
            disabled={importing}
            title="Import C language and code rearrangement questions from JSON"
          >
            <UploadCloud size={16} /> {importing ? 'Importing JSON...' : 'Import C Questions (JSON)'}
          </button>
          <button onClick={fetchQuestions} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} disabled={fetching}>
            <RefreshCw size={15} className={fetching ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Add Question Card */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PlusCircle size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Create New Question
            </h2>
          </div>

          {/* Question Type Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setQuestionType('mcq')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: questionType === 'mcq' ? '#ffffff' : 'transparent',
                color: questionType === 'mcq' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: questionType === 'mcq' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <FileCode size={14} /> Standard C MCQ
            </button>
            <button
              type="button"
              onClick={() => {
                setQuestionType('code_rearrange');
                if (!options[0] && !options[1]) {
                  setOptions(['1 -> 2 -> 3 -> 4', '4 -> 1 -> 2 -> 3', '2 -> 1 -> 4 -> 3', '3 -> 4 -> 1 -> 2']);
                }
              }}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: questionType === 'code_rearrange' ? '#ffffff' : 'transparent',
                color: questionType === 'code_rearrange' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: questionType === 'code_rearrange' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ListOrdered size={14} /> Code Rearrangement
            </button>
          </div>
        </div>

        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label className="form-label">
              {questionType === 'code_rearrange' ? 'Rearrangement Problem Statement' : 'Question Statement'}
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder={
                questionType === 'code_rearrange'
                  ? 'e.g. Rearrange the scrambled lines of C code below to swap variables x and y.'
                  : 'e.g. Which format specifier is used in printf() for floating point values in C?'
              }
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          {/* Code Snippet Box (for code rearrangement or output prediction) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                {questionType === 'code_rearrange' ? 'Scrambled Code Snippet / Line Blocks' : 'Optional C Code Snippet'}
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {questionType === 'code_rearrange' ? 'Use line labels like [1], [2], [3], [4]' : 'C syntax'}
              </span>
            </div>
            <textarea
              className="form-textarea"
              rows={4}
              style={{
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.88rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
              }}
              placeholder={
                questionType === 'code_rearrange'
                  ? '[1] temp = x;\n[2] x = y;\n[3] y = temp;\n[4] int temp;'
                  : '#include <stdio.h>\nint main() {\n    int a = 10;\n    printf("%d", a);\n    return 0;\n}'
              }
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              Answer Options & Correct Option Selection
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {questionType === 'code_rearrange'
                ? 'Provide line sequences (e.g. 4 -> 1 -> 2 -> 3) and select the radio button of the correct order.'
                : 'Select the radio button next to the option that represents the correct answer.'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {options.map((opt, idx) => {
              const isSelected = correctOptionIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-primary)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="correctOption"
                    checked={isSelected}
                    onChange={() => setCorrectOptionIdx(idx)}
                    id={`opt-radio-${idx}`}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', transform: 'scale(1.1)' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '0.2rem 0',
                      fontWeight: isSelected ? '600' : '400',
                      fontFamily: questionType === 'code_rearrange' ? 'monospace' : 'inherit',
                    }}
                    placeholder={
                      questionType === 'code_rearrange'
                        ? `e.g. 1 -> 2 -> 3 -> 4`
                        : `Option ${String.fromCharCode(65 + idx)} text`
                    }
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Adding Question...' : 'Add Question to Repository'}
          </button>
        </form>
      </div>

      {/* Existing Questions List Card */}
      <div className="glass-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileQuestion size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Active Question Bank ({questions.length})
            </h2>
          </div>

          {/* Search Filter */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
              placeholder="Search question or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={22} className="spin" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            Loading questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            {questions.length === 0 ? (
              <>
                <FileCode size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Question Bank is Empty
                </h3>
                <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
                  You can create new questions with the form above, or click below to quickly import 10 C Programming & Code Rearrangement questions from JSON.
                </p>
                <button
                  onClick={handleImportSampleCQuestions}
                  className="btn btn-primary"
                  disabled={importing}
                >
                  <UploadCloud size={16} /> Load 10 C Questions from JSON
                </button>
              </>
            ) : (
              `No questions matching "${searchTerm}".`
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredQuestions.map((q, qIndex) => {
              const isRearrange = q.type === 'code_rearrange';

              return (
                <div
                  key={q._id}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <span
                        style={{
                          background: isRearrange ? '#ede9fe' : 'var(--bg-secondary)',
                          color: isRearrange ? '#6366f1' : 'var(--text-primary)',
                          fontWeight: '800',
                          fontSize: '0.8rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          marginTop: '2px',
                        }}
                      >
                        Q{qIndex + 1}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          {isRearrange ? (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                background: '#ede9fe',
                                color: '#4f46e5',
                                textTransform: 'uppercase',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <ListOrdered size={11} /> Code Rearrangement
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase',
                              }}
                            >
                              MCQ
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                          {q.questionText}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', flexShrink: 0 }}
                      title="Delete question"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>

                  {/* Code Snippet Box */}
                  {q.codeSnippet && (
                    <div
                      style={{
                        margin: '0.85rem 0 1rem',
                        padding: '0.85rem 1.1rem',
                        background: '#0f172a',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #334155',
                        overflowX: 'auto',
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                          fontSize: '0.86rem',
                          color: '#e2e8f0',
                          lineHeight: 1.5,
                        }}
                      >
                        {q.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {/* Options List */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.65rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    {q.options &&
                      q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOption && q.correctOption.trim() === opt.trim();
                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '0.55rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.86rem',
                              background: isCorrect ? 'var(--success-bg)' : 'var(--bg-secondary)',
                              border: `1px solid ${isCorrect ? 'rgba(5, 150, 105, 0.4)' : 'var(--border-color)'}`,
                              color: isCorrect ? 'var(--success)' : 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontWeight: isCorrect ? '600' : '400',
                              fontFamily: isRearrange ? 'monospace' : 'inherit',
                            }}
                          >
                            <span style={{ fontWeight: '700', opacity: 0.8 }}>({String.fromCharCode(65 + optIdx)})</span>{' '}
                            <span>{opt}</span>
                            {isCorrect && (
                              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: '700', color: '#059669' }}>
                                <CheckCircle2 size={13} /> Correct Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
