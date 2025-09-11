import { Timestamp } from "firebase/firestore";

export interface Enrollment {
  id?: string;
  userId: string; // Foreign key to users
  courseId: string; // Foreign key to courses
  enrollmentDate: Timestamp;
  completionStatus: number; // 0.0 to 1.0 (0% to 100%)
  completedLessons: string[]; // Array of lesson IDs
}
