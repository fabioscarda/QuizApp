import React from 'react';
import { motion } from 'motion/react';
import { Play, Trash2, Clock, BookOpen } from 'lucide-react';
import { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quiz: Quiz) => void;
  onDelete: (id: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          <BookOpen className="w-6 h-6" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(quiz.id);
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{quiz.title}</h3>
      <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
        {quiz.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{quiz.questions.length} Questions</span>
          </div>
        </div>
        <button
          onClick={() => onStart(quiz)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all duration-300"
        >
          <Play className="w-4 h-4 fill-current" />
          Start
        </button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
