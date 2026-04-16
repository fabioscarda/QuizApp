import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Quiz } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (quiz: Quiz) => void;
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps): React.JSX.Element {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateAndUpload = (text: string) => {
    try {
      const data = JSON.parse(text);
      
      // Basic validation
      if (!data.title || !Array.isArray(data.questions)) {
        throw new Error('Invalid quiz format. Must have a title and questions array.');
      }

      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || '',
        questions: data.questions.map((q: any, idx: number) => ({
          id: q.id || `q-${idx}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        createdAt: Date.now()
      };

      onUpload(newQuiz);
      setJsonText('');
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      validateAndUpload(content);
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-6 border-bottom border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Upload Quiz</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Option 1: Upload JSON File</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-200 group-hover:border-indigo-400 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all bg-gray-50 group-hover:bg-indigo-50/30">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-gray-600">Click or drag and drop your .json file</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-medium">Or paste JSON text</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Option 2: JSON Text</label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='{ "title": "My Quiz", "questions": [...] }'
                  className="w-full h-48 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => validateAndUpload(jsonText)}
                disabled={!jsonText.trim()}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
              >
                Upload Quiz
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
