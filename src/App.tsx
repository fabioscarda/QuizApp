/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, LayoutGrid, History, Sparkles, BrainCircuit } from 'lucide-react';
import { Quiz, QuizResult } from './types';
import { storage, ensureInitialData } from './lib/storage';
import QuizCard from './components/QuizCard';
import QuizPlayer from './components/QuizPlayer';
import UploadModal from './components/UploadModal';
import QuizSetupModal from './components/QuizSetupModal';

type View = 'home' | 'playing' | 'history';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedQuizForSetup, setSelectedQuizForSetup] = useState<Quiz | null>(null);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  useEffect(() => {
    ensureInitialData();
    refreshData();
  }, []);

  const refreshData = () => {
    setQuizzes(storage.getQuizzes());
    setResults(storage.getResults());
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuizForSetup(quiz);
    setIsSetupOpen(true);
  };

  const handleConfirmSetup = (count: number, time: number, feedback: boolean) => {
    if (!selectedQuizForSetup) return;

    setTimePerQuestion(time);
    setShowImmediateFeedback(feedback);
    let sessionQuestions = [...selectedQuizForSetup.questions];
    
    // Randomize and slice if count is less than total
    if (count < selectedQuizForSetup.questions.length) {
      sessionQuestions = sessionQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
    }

    const sessionQuiz: Quiz = {
      ...selectedQuizForSetup,
      questions: sessionQuestions
    };

    setCurrentQuiz(sessionQuiz);
    setView('playing');
    setIsSetupOpen(false);
  };

  const handleUpload = (quiz: Quiz) => {
    storage.saveQuiz(quiz);
    refreshData();
  };

  const handleDeleteQuiz = (id: string) => {
    storage.deleteQuiz(id);
    refreshData();
  };

  const handleComplete = (result: QuizResult) => {
    storage.saveResult(result);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">QuizMaster</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setView('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'home' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Library
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl shadow-indigo-200">
                <div className="relative z-10 max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold mb-6"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    Master your knowledge
                  </motion.div>
                  <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                    Challenge yourself with custom quizzes.
                  </h1>
                  <p className="text-indigo-100 text-lg mb-10 leading-relaxed opacity-90">
                    Upload your own JSON quizzes or choose from your library. 
                    Track your progress and improve your score over time.
                  </p>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="group flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    Upload New Quiz
                  </button>
                </div>
                
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                  <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
                </div>
              </div>

              {/* Quiz Grid */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900">Your Library</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    {quizzes.length} Quizzes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {quizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onStart={handleStartQuiz}
                        onDelete={handleDeleteQuiz}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {quizzes.length === 0 && (
                  <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <LayoutGrid className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No quizzes yet</h3>
                    <p className="text-gray-500 mb-8">Upload a JSON file to get started with your first quiz.</p>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                      Upload Quiz
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'playing' && currentQuiz && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <QuizPlayer
                quiz={currentQuiz}
                timePerQuestion={timePerQuestion}
                showImmediateFeedback={showImmediateFeedback}
                onComplete={handleComplete}
                onExit={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">Quiz History</h2>
                <button 
                  onClick={() => {
                    localStorage.removeItem('quizmaster_results');
                    refreshData();
                  }}
                  className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Quiz</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.slice().reverse().map((result, idx) => {
                      const quiz = quizzes.find(q => q.id === result.quizId);
                      const percentage = Math.round((result.score / result.totalQuestions) * 100);
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <span className="font-bold text-gray-900">{quiz?.title || 'Deleted Quiz'}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-indigo-600">{result.score}</span>
                              <span className="text-gray-400">/ {result.totalQuestions}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">
                              {percentage}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {results.length === 0 && (
                  <div className="py-24 text-center">
                    <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No results recorded yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      <QuizSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        quiz={selectedQuizForSetup}
        onConfirm={handleConfirmSetup}
      />
    </div>
  );
}
