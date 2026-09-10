import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileQuestion, PlusCircle, Trash2, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
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

      setMessage({ type: 'success', text: 'Question added successfully!' });
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
    if (!window.confirm('Are you sure you want to delete this question?')) return;

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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

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
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Manage Questions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Build and manage the test question repository
          </p>
        </div>
        <button onClick={fetchQuestions} className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
          <RefreshCw size={14} className={fetching ? 'spin' : ''} /> Refresh List
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Add New Question</h2>
        </div>

        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. What is the time complexity of searching in a balanced Binary Search Tree?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              Options (Select the radio button next to the correct option)
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {options.map((opt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: correctOptionIdx === idx ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-primary)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${correctOptionIdx === idx ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                }}
              >
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctOptionIdx === idx}
                  onChange={() => setCorrectOptionIdx(idx)}
                  id={`opt-radio-${idx}`}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ border: 'none', background: 'transparent', padding: '0.4rem 0.2rem' }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Saving Question...' : 'Save Question'}
          </button>
        </form>
      </div>

      {/* Existing Questions List Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <FileQuestion size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Question Bank ({questions.length})</h2>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No questions available. Add your first question above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {questions.map((q, qIndex) => (
              <div
                key={q._id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--accent-primary)', marginRight: '6px' }}>
                      Q{qIndex + 1}.
                    </span>
                    {q.questionText}
                  </h3>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    title="Delete question"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {q.options &&
                    q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctOption && q.correctOption.trim() === opt.trim();
                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            background: isCorrect ? 'var(--success-bg)' : 'var(--bg-secondary)',
                            border: `1px solid ${isCorrect ? 'rgba(5, 150, 105, 0.4)' : 'var(--border-color)'}`,
                            color: isCorrect ? 'var(--success)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <span style={{ fontWeight: '600' }}>({String.fromCharCode(65 + optIdx)})</span> {opt}
                          {isCorrect && <CheckCircle2 size={14} color="#059669" style={{ marginLeft: 'auto' }} />}
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
