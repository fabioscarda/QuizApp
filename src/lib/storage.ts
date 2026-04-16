import { Quiz, QuizResult } from '../types';

const QUIZZES_KEY = 'quizmaster_quizzes';
const RESULTS_KEY = 'quizmaster_results';

export const storage = {
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(QUIZZES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveQuiz: (quiz: Quiz) => {
    const quizzes = storage.getQuizzes();
    quizzes.push(quiz);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  },

  deleteQuiz: (id: string) => {
    const quizzes = storage.getQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(filtered));
  },

  getResults: (): QuizResult[] => {
    const data = localStorage.getItem(RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveResult: (result: QuizResult) => {
    const results = storage.getResults();
    results.push(result);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  }
};

// Initial sample quiz if none exist
export const ensureInitialData = () => {
  const quizzes = storage.getQuizzes();
  if (quizzes.length === 0) {
    const sampleQuiz: Quiz = {
      id: 'sample-1',
      title: 'General Knowledge Starter',
      description: 'A quick quiz to test your basics.',
      questions: [
        {
          id: 'q1',
          text: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2
        },
        {
          id: 'q2',
          text: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1
        },
        {
          id: 'q3',
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1
        },
        {
          id: 'q4',
          text: 'Who wrote "Romeo and Juliet"?',
          options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'],
          correctAnswer: 1
        },
        {
          id: 'q5',
          text: 'What is the largest ocean on Earth?',
          options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
          correctAnswer: 3
        },
        {
          id: 'q6',
          text: 'Which element has the chemical symbol "O"?',
          options: ['Gold', 'Silver', 'Oxygen', 'Iron'],
          correctAnswer: 2
        },
        {
          id: 'q7',
          text: 'What is the currency of Japan?',
          options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
          correctAnswer: 2
        },
        {
          id: 'q8',
          text: 'How many continents are there?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 2
        }
      ],
      createdAt: Date.now()
    };
    storage.saveQuiz(sampleQuiz);
  }
};
