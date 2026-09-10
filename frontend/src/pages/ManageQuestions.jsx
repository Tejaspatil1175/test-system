import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  FileQuestion,
  PlusCircle,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
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
        options: filteredOptions,
        correctOption,
      });

      setMessage({ type: 'success', text: 'Question added to the repository successfully!' });
      setQuestionText('');
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
    return questions.filter((q) => q.questionText && q.questionText.toLowerCase().includes(term));
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
            Build, structure, and curate multiple choice questions for the active test series
          </p>
        </div>

        <button onClick={fetchQuestions} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} disabled={fetching}>
          <RefreshCw size={15} className={fetching ? 'spin' : ''} /> Refresh Bank
        </button>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Add Question Card */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <PlusCircle size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Create New Question
          </h2>
        </div>

        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label className="form-label">Question Statement</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Enter the complete question prompt (e.g. What is the time complexity of binary search?)"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              Answer Options & Correct Key Selection
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Select the radio button next to the option that represents the correct answer.
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
                    style={{ border: 'none', background: 'transparent', padding: '0.2rem 0', fontWeight: isSelected ? '600' : '400' }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
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
              placeholder="Search question statement..."
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
            {questions.length === 0
              ? 'No questions found. Use the builder above to add your first question.'
              : `No questions matching "${searchTerm}".`}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredQuestions.map((q, qIndex) => (
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
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--accent-primary)', marginRight: '6px' }}>
                      Q{qIndex + 1}.
                    </span>
                    {q.questionText}
                  </h3>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', flexShrink: 0 }}
                    title="Delete question"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.65rem',
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
