export interface Course {
  id?: string;
  title: string;
  description: string;
  price: number;
  thumbnailURL?: string;
  instructorId: string; // Foreign key to users
  categoryId: string; // Foreign key to categories
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  status: 'draft' | 'published';
  createdAt: Date;
}
