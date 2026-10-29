import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Affiche les questions d'un questionnaire (voir data/questionnaire.js), par section
const QuestionFields = ({ sections, answers, onChange }) => (
  <div className="space-y-6">
    {sections.map(({ section, questions }) => (
      <div key={section} className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-800 border-b border-teal-200 pb-1">{section}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <Label htmlFor={`q-${q.id}`} className="text-sm text-slate-700">{q.label}</Label>
              {q.options ? (
                <select
                  id={`q-${q.id}`}
                  value={answers[q.id] || ''}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Choisir…</option>
                  {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <Input
                  id={`q-${q.id}`}
                  type={q.type || 'text'}
                  min={q.type === 'number' ? 0 : undefined}
                  inputMode={q.type === 'number' ? 'numeric' : undefined}
                  value={answers[q.id] || ''}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className="border-stone-300 focus:border-teal-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default QuestionFields;
