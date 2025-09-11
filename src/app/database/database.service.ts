import { Injectable } from "@angular/core";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  runTransaction,
  Timestamp
} from "firebase/firestore";
import { catchError, from, map, Observable, tap, throwError } from "rxjs";
import { db } from "../../environments/environments";

// Import all models
import { UserProfile } from "../models/user.model";
// import { Course } from "../models/course.model";
// import { Lesson } from "../models/lesson.model";
// import { Category } from "../models/category.model";
// import { Enrollment } from "../models/enrollment.model";
// import { Review } from "../models/review.model";
// import { Payment } from "../models/payment.model";

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  // ----------------------------
  // USER CRUD
  // ----------------------------

  getUserProfile(uid: string): Observable<UserProfile | null> {
    const userRef = doc(db, `users/${uid}`);
    return from(getDoc(userRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to get user profile'));
      })
    );
  }

    saveUserProfile(uid: string, email: string, displayName: string, role: 'student' | 'instructor' = 'student'): Observable<void> {
    const userRef = doc(db, `users/${uid}`);
    const userData: Omit<UserProfile, 'enrolledCourses' | 'createdCourses' | 'bio' | 'website'> = {
      uid,
      email,
      displayName,
      role,
      photoURL: undefined,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    return from(setDoc(userRef, userData)).pipe(
      tap(() => console.log('User profile saved successfully!')),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to save user profile'));
      })
    );
  }
}
