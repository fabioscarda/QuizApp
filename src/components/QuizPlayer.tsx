import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, Timer, Trophy, RotateCcw, Home, X, Pause, Play } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(timePerQuestion > 0 ? quiz.questions.length * timePerQuestion : 0);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lockedQuestions, setLockedQuestions] = useState<Record<number, boolean>>({});

  // 1. Shuffled option structure once per playing session to avoid re-shuffling on state updates
  const shuffledQuestions = useMemo(() => {
    return quiz.questions.map(q => {
      const indexedOptions = q.options.map((opt, oIdx) => ({ text: opt, originalIdx: oIdx }));
      // Randomized options
      const shuffled = [...indexedOptions].sort(() => Math.random() - 0.5);
      const correctIdx = shuffled.findIndex(item => item.originalIdx === q.correctAnswer);
      return {
        ...q,
        options: shuffled.map(item => item.text),
        correctAnswer: correctIdx
      };
    });
  }, [quiz]);

  useEffect(() => {
    if (isFinished || timePerQuestion === 0 || isPaused) return;
    
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
  }, [isFinished, timePerQuestion, isPaused]);

  // Handle option selection
  const handleSelect = (optionIndex: number) => {
    // If feedback on and already answered, or if question is already locked, prevent selection
    if ((showImmediateFeedback && hasAnsweredCurrent) || lockedQuestions[currentIndex]) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);

    if (showImmediateFeedback) {
      setHasAnsweredCurrent(true);
    }
  };

  // Secure locked state when transitioning (going back/forward locks answered ones forever!)
  const transitionTo = (nextIdx: number) => {
    if (answers[currentIndex] !== -1) {
      setLockedQuestions(prev => ({ ...prev, [currentIndex]: true }));
    }
    setCurrentIndex(nextIdx);
    setHasAnsweredCurrent(answers[nextIdx] !== -1);
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      transitionTo(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const score = answers.reduce((acc, curr, idx) => {
      return acc + (curr === shuffledQuestions[idx].correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      quizId: quiz.id,
      score,
      totalQuestions: shuffledQuestions.length,
      answers,
      timestamp: Date.now()
    };

    setIsFinished(true);
    onComplete(result);
  };

  const currentQuestion = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  // Live counters for correct/incorrect answers
  const correctCount = answers.reduce((acc, curr, idx) => {
    if (curr === -1) return acc;
    return acc + (curr === shuffledQuestions[idx].correctAnswer ? 1 : 0);
  }, 0);
  const incorrectCount = answers.reduce((acc, curr, idx) => {
    if (curr === -1) return acc;
    return acc + (curr !== shuffledQuestions[idx].correctAnswer ? 1 : 0);
  }, 0);

  const handleJumpToQuestion = (index: number) => {
    transitionTo(index);
  };

  if (isFinished) {
    const score = answers.reduce((acc, curr, idx) => acc + (curr === shuffledQuestions[idx].correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((score / shuffledQuestions.length) * 100);

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

        <h2 className="text-4xl font-black text-gray-900 mb-2">Quiz Completato!</h2>
        <p className="text-gray-500 mb-12">Hai risposto correttamente a {score} domande su {shuffledQuestions.length}.</p>

        {/* Counters summary */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 font-bold">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            <span>Risposte Corrette: {correctCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-2xl border border-red-100 font-bold">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            <span>Risposte Errate: {incorrectCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-12">
          {shuffledQuestions.map((q, idx) => (
            <div key={q.id} className={`p-4 rounded-xl border text-left flex gap-4 ${answers[idx] === q.correctAnswer ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${answers[idx] === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {idx + 1}
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">{q.text}</p>
                <p className="text-sm text-gray-600">
                  La tua risposta: <span className="font-semibold">{answers[idx] === -1 ? 'Saltata' : q.options[answers[idx]]}</span>
                </p>
                {answers[idx] !== q.correctAnswer && (
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    Risposta corretta: {q.options[q.correctAnswer]}
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
              setLockedQuestions({});
              setHasAnsweredCurrent(false);
              setIsPaused(false);
              setTimeLeft(timePerQuestion > 0 ? quiz.questions.length * timePerQuestion : 0);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Riprova
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Home className="w-5 h-5" />
            Torna al Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Quiz Progress & Timer Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-xl">
            <Home className="w-6 h-6" />
          </button>
          
          {/* Pause / Play Button */}
          <button 
            onClick={() => setIsPaused(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl border border-amber-100 text-xs font-bold transition-all cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Riprendi</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausa</span>
              </>
            )}
          </button>
        </div>

        {/* Live Counters & Timer Display */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Score Counter always visible if immediate feedback, or simple tracker if not */}
          {showImmediateFeedback ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100 text-xs font-bold">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Corrette: {correctCount}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100 text-xs font-bold">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Errate: {incorrectCount}</span>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100 text-xs font-bold">
              Risposte fornite: {answers.filter(a => a !== -1).length} / {shuffledQuestions.length}
            </div>
          )}

          {timePerQuestion > 0 && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} />
              <span className={`font-mono font-bold text-xs ${timeLeft < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mini-Menu Navigation numbers representing each question */}
      <div className="flex flex-wrap gap-1.5 mb-6 justify-center bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100">
        {shuffledQuestions.map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[idx] !== -1;
          const isCorrect = isAnswered && answers[idx] === shuffledQuestions[idx].correctAnswer;
          const isLocked = lockedQuestions[idx];

          let btnClass = "border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-white";
          if (isCurrent) {
            btnClass = "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-100";
          } else if (showImmediateFeedback && isAnswered) {
            btnClass = isCorrect 
              ? "border-green-500 bg-green-50 text-green-700 font-black" 
              : "border-red-500 bg-red-50 text-red-700 font-black";
          } else if (isAnswered) {
            btnClass = "border-indigo-100 bg-indigo-50 text-indigo-600 font-bold";
          } else if (isLocked) {
            btnClass = "border-gray-200 bg-gray-50 text-gray-400";
          }

          return (
            <button
              key={idx}
              onClick={() => handleJumpToQuestion(idx)}
              className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${btnClass} hover:scale-105`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Outer wrapper to handle Pause overlay */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isPaused ? (
            <motion.div
              key="paused"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 text-center shadow-xl space-y-6 my-4"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <Pause className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Quiz in Pausa</h3>
                <p className="text-sm text-gray-500">I quesiti sono temporaneamente nascosti per evitare distrazioni. Clicca sotto per riprendere.</p>
              </div>
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-indigo-200 cursor-pointer"
              >
                Riprendi Quiz
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${currentIndex}-question`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-50"
            >
              <div className="flex justify-between items-start gap-4 mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  {currentQuestion.text}
                </h2>
                <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-black shrink-0">
                  {currentIndex + 1} / {shuffledQuestions.length}
                </div>
              </div>

              {/* Locked Notice */}
              {lockedQuestions[currentIndex] && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 font-bold mb-6">
                  Questa domanda è stata confermata. Non puoi più modificare la risposta.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  const isCorrect = idx === currentQuestion.correctAnswer;
                  const showCorrect = showImmediateFeedback && hasAnsweredCurrent && isCorrect;
                  const showIncorrect = showImmediateFeedback && hasAnsweredCurrent && isSelected && !isCorrect;
                  const isChoiceLocked = lockedQuestions[currentIndex] || (showImmediateFeedback && hasAnsweredCurrent);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isChoiceLocked}
                      className={`group relative flex items-center p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                        showCorrect
                          ? 'border-green-500 bg-green-50 ring-4 ring-green-100'
                          : showIncorrect
                          ? 'border-red-500 bg-red-50 ring-4 ring-red-100'
                          : isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                          : isChoiceLocked
                          ? 'border-gray-100 opacity-60 bg-gray-50/50 cursor-not-allowed'
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
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Toolbar */}
      {!isPaused && (
        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                transitionTo(currentIndex - 1);
              }
            }}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 font-bold text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            Precedente
          </button>

          {showImmediateFeedback ? (
            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className="flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer"
            >
              {currentIndex === shuffledQuestions.length - 1 ? 'Termina Quiz' : 'Prossima Domanda'}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : currentIndex === shuffledQuestions.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={answers[currentIndex] === -1}
              className="flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer"
            >
              Termina Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={answers[currentIndex] === -1}
              className="flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer"
            >
              Prossima Domanda
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
