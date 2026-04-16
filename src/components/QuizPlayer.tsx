import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, Timer, Trophy, RotateCcw, Home, X } from 'lucide-react';
import { Quiz, QuizResult } from '../types';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
  timePerQuestion?: number;
  showImmediateFeedback?: boolean;
}

export default function QuizPlayer({ 
  quiz, 
  onComplete, 
  onExit, 
  timePerQuestion = 30,
  showImmediateFeedback = false
}: QuizPlayerProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.questions.length * timePerQuestion);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);

  useEffect(() => {
    if (isFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const handleSelect = (optionIndex: number) => {
    if (showImmediateFeedback && hasAnsweredCurrent) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);

    if (showImmediateFeedback) {
      setHasAnsweredCurrent(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setHasAnsweredCurrent(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const score = answers.reduce((acc, curr, idx) => {
      return acc + (curr === quiz.questions[idx].correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      quizId: quiz.id,
      score,
      totalQuestions: quiz.questions.length,
      answers,
      timestamp: Date.now()
    };

    setIsFinished(true);
    onComplete(result);
  };

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  if (isFinished) {
    const score = answers.reduce((acc, curr, idx) => acc + (curr === quiz.questions[idx].correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12 px-6"
      >
        <div className="mb-8 relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200"
          >
            <Trophy className="w-16 h-16" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-gray-100 font-bold text-indigo-600"
          >
            {percentage}%
          </motion.div>
        </div>

        <h2 className="text-4xl font-black text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-gray-500 mb-12">You scored {score} out of {quiz.questions.length} questions correctly.</p>

        <div className="grid grid-cols-1 gap-4 mb-12">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className={`p-4 rounded-xl border text-left flex gap-4 ${answers[idx] === q.correctAnswer ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${answers[idx] === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {idx + 1}
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">{q.text}</p>
                <p className="text-sm text-gray-600">
                  Your answer: <span className="font-semibold">{answers[idx] === -1 ? 'Skipped' : q.options[answers[idx]]}</span>
                </p>
                {answers[idx] !== q.correctAnswer && (
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    Correct: {q.options[q.correctAnswer]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setAnswers(new Array(quiz.questions.length).fill(-1));
              setIsFinished(false);
              setTimeLeft(quiz.questions.length * timePerQuestion);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Home className="w-5 h-5" />
            Back to Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="text-gray-400 hover:text-gray-600 transition-colors">
          <Home className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <Timer className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} />
          <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-gray-700'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="text-sm font-bold text-gray-400">
          Question {currentIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full mb-12 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-indigo-600"
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-50"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-12 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentIndex] === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              const showCorrect = showImmediateFeedback && hasAnsweredCurrent && isCorrect;
              const showIncorrect = showImmediateFeedback && hasAnsweredCurrent && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showImmediateFeedback && hasAnsweredCurrent}
                  className={`group relative flex items-center p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 ring-4 ring-green-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 ring-4 ring-red-50'
                      : isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 transition-colors ${
                    showCorrect 
                      ? 'bg-green-500 text-white' 
                      : showIncorrect 
                      ? 'bg-red-500 text-white'
                      : isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-lg font-bold ${
                    showCorrect ? 'text-green-900' : showIncorrect ? 'text-red-900' : isSelected ? 'text-indigo-900' : 'text-gray-700'
                  }`}>
                    {option}
                  </span>
                  {isSelected && !showImmediateFeedback && (
                    <CheckCircle2 className="absolute right-6 w-6 h-6 text-indigo-600" />
                  )}
                  {showCorrect && (
                    <CheckCircle2 className="absolute right-6 w-6 h-6 text-green-600" />
                  )}
                  {showIncorrect && (
                    <X className="absolute right-6 w-6 h-6 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-12 flex justify-between items-center">
        <button
          onClick={() => {
            setCurrentIndex(prev => Math.max(0, prev - 1));
            setHasAnsweredCurrent(false);
          }}
          disabled={currentIndex === 0 || (showImmediateFeedback && hasAnsweredCurrent)}
          className="flex items-center gap-2 px-6 py-3 font-bold text-gray-400 hover:text-indigo-600 disabled:opacity-0 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {showImmediateFeedback ? (
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : currentIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={answers[currentIndex] === -1}
            className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            Finish Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            disabled={answers[currentIndex] === -1}
            className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            Next Question
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
