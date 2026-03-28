/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component } from 'react';
import { 
  Search, 
  HelpCircle, 
  ChevronRight, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  LayoutDashboard, 
  LogOut, 
  LogIn,
  User as UserIcon,
  ShieldCheck,
  FileText,
  Building2,
  Receipt,
  CalendarDays,
  ArrowLeft,
  Send,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Question, UserSubmission, UserProfile } from './types';

// --- Mock User Type ---
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              {error?.message || "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- Local Storage Helpers ---
const STORAGE_KEYS = {
  CATEGORIES: 'taxhelp_categories',
  QUESTIONS: 'taxhelp_questions',
  SUBMISSIONS: 'taxhelp_submissions',
  USER: 'taxhelp_user'
};

const getLocalData = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects
    return JSON.parse(data, (key, value) => {
      if (key === 'createdAt' && typeof value === 'string') return new Date(value);
      return value;
    });
  } catch (e) {
    return defaultValue;
  }
};

const setLocalData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Main Application ---
export default function App() {
  const [user, setUser] = useState<MockUser | null>(getLocalData(STORAGE_KEYS.USER, null));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>(getLocalData(STORAGE_KEYS.CATEGORIES, []));
  const [questions, setQuestions] = useState<Question[]>(getLocalData(STORAGE_KEYS.QUESTIONS, []));
  const [submissions, setSubmissions] = useState<UserSubmission[]>(getLocalData(STORAGE_KEYS.SUBMISSIONS, []));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'category' | 'question' | 'ask' | 'admin' | 'status'>('home');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // --- Sync Profile ---
  useEffect(() => {
    if (user) {
      setUserProfile({
        uid: user.uid,
        email: user.email,
        role: user.email === 'pzuhaidir@gmail.com' ? 'admin' : 'user'
      });
      setLocalData(STORAGE_KEYS.USER, user);
    } else {
      setUserProfile(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // --- Sync Data ---
  useEffect(() => {
    setLocalData(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    setLocalData(STORAGE_KEYS.QUESTIONS, questions);
  }, [questions]);

  useEffect(() => {
    setLocalData(STORAGE_KEYS.SUBMISSIONS, submissions);
  }, [submissions]);

  // --- Auth Actions ---
  const handleLogin = () => {
    const mockUser: MockUser = {
      uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
      email: 'pzuhaidir@gmail.com', // Default to admin for demo purposes
      displayName: 'Demo User',
      photoURL: 'https://picsum.photos/seed/user/200'
    };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  // --- Search Logic ---
  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return [];
    return questions.filter(q => 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answerBody.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, questions]);

  // --- Components ---
  const Header = () => (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => { setView('home'); setSearchQuery(''); setSelectedCategory(null); }}
        >
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">TaxHelp</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setView('admin')}
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
              )}
              <button 
                onClick={() => setView('status')}
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">My Requests</span>
              </button>
              <div className="h-8 w-px bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const SearchSection = () => (
    <div className="bg-blue-600 py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">How can we help you today?</h1>
        <p className="text-blue-100 mb-8 text-lg">Search our official tax FAQ or submit a new question.</p>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search for tax topics, deadlines, or deductions..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-2xl focus:ring-4 focus:ring-blue-500/20 outline-none text-lg transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-left z-40">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.slice(0, 5).map(q => (
                  <div 
                    key={q.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                    onClick={() => { setActiveQuestion(q); setView('question'); setSearchQuery(''); }}
                  >
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{q.questionText}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{q.answerBody}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No results found for "{searchQuery}"</p>
                  <button 
                    onClick={() => setView('ask')}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Ask a new question instead?
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {categories.map(cat => (
          <motion.div 
            key={cat.id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => { setSelectedCategory(cat.id); setView('category'); }}
          >
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              {/* Dynamic Icon Rendering */}
              {cat.icon === 'User' && <UserIcon className="w-6 h-6 text-blue-600 group-hover:text-white" />}
              {cat.icon === 'Building2' && <Building2 className="w-6 h-6 text-blue-600 group-hover:text-white" />}
              {cat.icon === 'Receipt' && <Receipt className="w-6 h-6 text-blue-600 group-hover:text-white" />}
              {cat.icon === 'CalendarDays' && <CalendarDays className="w-6 h-6 text-blue-600 group-hover:text-white" />}
              {!['User', 'Building2', 'Receipt', 'CalendarDays'].includes(cat.icon) && <FileText className="w-6 h-6 text-blue-600 group-hover:text-white" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
            <p className="text-sm text-gray-500">
              {questions.filter(q => q.categoryId === cat.id).length} Articles
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-white mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-400 text-lg max-w-xl">
            Submit your question to our tax experts. We'll review it and provide an official answer that helps everyone.
          </p>
        </div>
        <button 
          onClick={() => setView('ask')}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-blue-600/20"
        >
          <PlusCircle className="w-6 h-6" />
          Ask a Question
        </button>
      </div>
    </div>
  );

  const CategoryView = () => {
    const category = categories.find(c => c.id === selectedCategory);
    const categoryQuestions = questions.filter(q => q.categoryId === selectedCategory);

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to categories
        </button>
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-xl text-white">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
            <p className="text-gray-500">{categoryQuestions.length} official answers available</p>
          </div>
        </div>

        <div className="space-y-4">
          {categoryQuestions.map(q => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              onClick={() => { setActiveQuestion(q); setView('question'); }}
            >
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {q.questionText}
                </h3>
                <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed">
                  {q.answerBody}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const QuestionView = () => {
    if (!activeQuestion) return null;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button 
          onClick={() => setView('category')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        
        <article className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-widest mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Official Answer
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {activeQuestion.questionText}
            </h1>
            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
              {activeQuestion.answerBody}
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Last updated: {activeQuestion.createdAt.toLocaleDateString()}</span>
            <div className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              <span>{activeQuestion.viewCount} views</span>
            </div>
          </div>
        </article>

        <div className="mt-12 text-center p-8 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-blue-900 font-medium mb-4">Was this answer helpful?</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Yes</button>
            <button className="bg-white text-gray-600 px-6 py-2 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 transition-all">No</button>
          </div>
        </div>
      </div>
    );
  };

  const AskView = () => {
    const [email, setEmail] = useState(user?.email || '');
    const [question, setQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !question) return;

      setIsSubmitting(true);
      try {
        const newSubmission: UserSubmission = {
          id: 'sub-' + Math.random().toString(36).substr(2, 9),
          userEmail: email,
          questionText: question,
          status: 'pending',
          createdAt: new Date()
        };
        setSubmissions(prev => [newSubmission, ...prev]);
        setSuccess(true);
      } catch (error) {
        console.error("Submission failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (success) {
      return (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Question Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your contribution. Our tax officers will review your question and provide an official answer soon.
          </p>
          <button 
            onClick={() => setView('home')}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-500 mb-8">Can't find an answer? Submit your inquiry and we'll help you out.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Your Email</label>
              <input 
                type="email"
                required
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Your Question</label>
              <textarea 
                required
                rows={4}
                placeholder="What would you like to know about tax?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Please do not include sensitive personal data (SSN, Bank Details).
              </p>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Question
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const StatusView = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Submitted Questions</h1>
      
      {!user ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl text-center">
          <UserIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to track your requests</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to see the status of your submitted questions.</p>
          <button onClick={handleLogin} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Sign In with Google</button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl text-center">
          <HelpCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No questions submitted yet</h2>
          <p className="text-gray-500 mb-6">When you ask a question, it will appear here with its current status.</p>
          <button onClick={() => setView('ask')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Ask a Question</button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{sub.createdAt.toLocaleDateString()}</p>
                <h3 className="text-lg font-semibold text-gray-900">{sub.questionText}</h3>
              </div>
              <div className="flex items-center gap-2">
                {sub.status === 'pending' && (
                  <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-amber-100">
                    <Clock className="w-4 h-4" /> Pending Review
                  </span>
                )}
                {sub.status === 'answered' && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-green-100">
                    <CheckCircle2 className="w-4 h-4" /> Answered
                  </span>
                )}
                {sub.status === 'rejected' && (
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-red-100">
                    <XCircle className="w-4 h-4" /> Rejected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AdminView = () => {
    const [editingSub, setEditingSub] = useState<UserSubmission | null>(null);
    const [answer, setAnswer] = useState('');
    const [catId, setCatId] = useState('');

    const handleApprove = async () => {
      if (!editingSub || !answer || !catId) return;
      try {
        // 1. Create official question
        const newQuestion: Question = {
          id: 'q-' + Math.random().toString(36).substr(2, 9),
          categoryId: catId,
          questionText: editingSub.questionText,
          answerBody: answer,
          isPublished: true,
          viewCount: 0,
          createdAt: new Date()
        };
        setQuestions(prev => [newQuestion, ...prev]);

        // 2. Update submission status
        setSubmissions(prev => prev.map(s => s.id === editingSub.id ? { ...s, status: 'answered' } : s));
        
        setEditingSub(null);
        setAnswer('');
      } catch (error) {
        console.error("Approval failed:", error);
      }
    };

    const handleReject = async (id: string) => {
      try {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
      } catch (error) {
        console.error("Rejection failed:", error);
      }
    };

    if (userProfile?.role !== 'admin') {
      return (
        <div className="max-w-md mx-auto py-24 text-center">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-8">You do not have administrative privileges to view this page.</p>
          <button onClick={() => setView('home')} className="bg-gray-900 text-white px-8 py-2 rounded-xl">Back Home</button>
        </div>
      );
    }

    const handleSeedData = async () => {
      try {
        const cats: Category[] = [
          { id: 'cat-1', name: 'Individual Tax', icon: 'User' },
          { id: 'cat-2', name: 'Corporate Tax', icon: 'Building2' },
          { id: 'cat-3', name: 'VAT / GST', icon: 'Receipt' },
          { id: 'cat-4', name: 'Deadlines', icon: 'CalendarDays' }
        ];

        const sampleQuestions: Question[] = [
          {
            id: 'q-1',
            categoryId: 'cat-1',
            questionText: 'What are the common deductions for individuals?',
            answerBody: 'Common deductions include mortgage interest, state and local taxes, charitable contributions, and medical expenses exceeding a certain percentage of your AGI.',
            isPublished: true,
            viewCount: 120,
            createdAt: new Date()
          },
          {
            id: 'q-2',
            categoryId: 'cat-2',
            questionText: 'When is the corporate tax filing deadline?',
            answerBody: 'For most C-Corporations, the deadline is the 15th day of the 4th month following the close of the tax year (April 15th for calendar year corporations).',
            isPublished: true,
            viewCount: 85,
            createdAt: new Date()
          }
        ];

        setCategories(cats);
        setQuestions(sampleQuestions);
        alert('Data seeded successfully!');
      } catch (error) {
        console.error("Seeding failed:", error);
      }
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
            <p className="text-gray-500">Review and answer user-submitted questions</p>
          </div>
          <div className="flex gap-4 items-center">
            {categories.length === 0 && (
              <button 
                onClick={handleSeedData}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-all"
              >
                Seed Initial Data
              </button>
            )}
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{submissions.filter(s => s.status === 'pending').length}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {submissions.filter(s => s.status === 'pending').map(sub => (
              <div key={sub.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">{sub.userEmail}</p>
                    <h3 className="text-lg font-bold text-gray-900">{sub.questionText}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{sub.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setEditingSub(sub); setAnswer(''); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                  >
                    Answer & Publish
                  </button>
                  <button 
                    onClick={() => handleReject(sub.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {submissions.filter(s => s.status === 'pending').length === 0 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">All caught up! No pending submissions.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <AnimatePresence>
              {editingSub ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-3xl border border-blue-100 shadow-2xl sticky top-24"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Response Editor</h2>
                    <button onClick={() => setEditingSub(null)} className="text-gray-400 hover:text-gray-600">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6 italic">" {editingSub.questionText} "</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                      <select 
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        value={catId}
                        onChange={(e) => setCatId(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Official Answer</label>
                      <textarea 
                        rows={8}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 resize-none"
                        placeholder="Write the official response here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={handleApprove}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      Approve & Publish
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Select a submission from the queue to start editing the official response.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Header />
        
        <main>
          {view === 'home' && (
            <>
              <SearchSection />
              <HomeView />
            </>
          )}
          {view === 'category' && <CategoryView />}
          {view === 'question' && <QuestionView />}
          {view === 'ask' && <AskView />}
          {view === 'status' && <StatusView />}
          {view === 'admin' && <AdminView />}
        </main>

        <footer className="bg-white border-t border-gray-100 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-gray-900 p-1.5 rounded-md">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">TaxHelp</span>
            </div>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
              Disclaimer: This FAQ provides general information and is not formal legal or tax advice. Please consult with a professional for your specific situation.
            </p>
            <div className="flex justify-center gap-8 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a>
            </div>
            <p className="mt-12 text-xs text-gray-300">© 2026 TaxHelp Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
