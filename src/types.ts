export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'professor' | 'student';
  phone?: string;
  isVerified?: boolean;
  name?: string;
}

export interface Classroom {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  features: string[];
  status: 'available' | 'maintenance' | 'occupied';
}

export interface Assignment {
  id: string;
  classroomId: string;
  professorId: string;
  professorName?: string;
  subject: string;
  studentCount: number;
  startTime: string;
  endTime: string;
  date: string;
  nextClass?: {
    professor: string;
    subject: string;
    time: string;
  };
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  type?: 'oferta' | 'anuncio';
}

export interface Invitation {
  token: string;
  email: string;
  phone?: string;
  used: boolean;
  expiresAt: string;
  role: 'admin' | 'professor' | 'student';
}
