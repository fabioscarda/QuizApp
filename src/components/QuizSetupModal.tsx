import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Settings2, Hash, Timer, Eye, CheckCircle2 } from 'lucide-react';
import { Quiz } from '../types';

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number, timePerQuestion: number, showImmediateFeedback: boolean) => void;
  quiz: Quiz | null;
}

export const QuizSetupModal: React.FC<QuizSetupModalProps> = ({ isOpen, onClose, onConfirm, quiz }) => {
  const [count, setCount] = useState<number>(0);
  const [customValue, setCustomValue] = useState<string>('');
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30); // Default 30s
  const [showImmediateFeedback, setShowImmediateFeedback] = useState<boolean>(false);

  if (!quiz) return null;

  const total = quiz.questions.length;
  const presets = [5, 10, 20, 50].filter(p => p < total);
  const timePresets = [15, 30, 45, 60];

  const handleConfirm = () => {
    const finalCount = count === 0 ? total : count;
    onConfirm(finalCount, timePerQuestion, showImmediateFeedback);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quiz Setup</h2>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Configure your exam</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Question Count */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-500" />
                  How many questions?
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setCount(0); setCustomValue(''); }}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      count === 0 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                        : 'border-gray-100 text-gray-500 hover:border-indigo-200'
                    }`}
                  >
                    All ({total})
                  </button>
                  {presets.map(p => (
                    <button
                      key={p}
                      onClick={() => { setCount(p); setCustomValue(''); }}
                      className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        count === p 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                          : 'border-gray-100 text-gray-500 hover:border-indigo-200'
                      }`}
                    >
                      {p} Questions
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="Custom amount..."
                    value={customValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val)) {
                        setCustomValue('');
                        setCount(0);
                      } else {
                        const clamped = Math.min(Math.max(1, val), total);
                        setCustomValue(clamped.toString());
                        setCount(clamped);
                      }
                    }}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-bold transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">
                    Max: {total}
                  </div>
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-indigo-500" />
                  Time per question (seconds)
                </label>
                
                <div className="grid grid-cols-4 gap-2">
                  {timePresets.map(t => (
                    <button
                      key={t}
                      onClick={() => setTimePerQuestion(t)}
                      className={`px-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                        timePerQuestion === t 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                          : 'border-gray-100 text-gray-500 hover:border-indigo-200'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Custom time..."
                    value={timePerQuestion}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setTimePerQuestion(Math.max(5, val));
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-bold transition-all"
                  />
                </div>
              </div>

              {/* Feedback Option */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  Feedback Mode
                </label>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setShowImmediateFeedback(false)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-between ${
                      !showImmediateFeedback 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                        : 'border-gray-100 text-gray-500 hover:border-indigo-200'
                    }`}
                  >
                    <span>Results at the end</span>
                    {!showImmediateFeedback && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowImmediateFeedback(true)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-between ${
                      showImmediateFeedback 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                        : 'border-gray-100 text-gray-500 hover:border-indigo-200'
                    }`}
                  >
                    <span>Show answer immediately</span>
                    {showImmediateFeedback && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-sm text-indigo-700 leading-relaxed">
                  <span className="font-bold">Note:</span> Total time will be <span className="font-bold">{(count === 0 ? total : count) * timePerQuestion}s</span>.
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Exam
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuizSetupModal;
