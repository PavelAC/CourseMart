export interface Review {
  id?: string;
  userId: string; // Foreign key to users
  courseId: string; // Foreign key to courses
  rating: number;
  comment: string;
  createdAt: Date;
}
