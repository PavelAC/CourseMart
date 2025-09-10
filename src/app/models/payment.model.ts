export interface Payment {
  id?: string;
  userId: string; // Foreign key to users
  courseId: string; // Foreign key to courses
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  paymentMethod?: string; // e.g., "credit_card", "paypal"
  transactionId?: string;
}
