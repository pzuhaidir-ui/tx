export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Question {
  id: string;
  categoryId: string;
  questionText: string;
  answerBody: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
}

export interface UserSubmission {
  id: string;
  userEmail: string;
  questionText: string;
  status: 'pending' | 'answered' | 'rejected';
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}
