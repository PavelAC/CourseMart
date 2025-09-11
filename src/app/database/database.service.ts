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
import { Course } from "../models/course.model";
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
    const userData: Omit<UserProfile, 'enrolledCourses' | 'createdCourses' | 'bio' | 'website' | 'photoURL'> = {
      uid,
      email,
      displayName,
      role,
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

  updateUserProfile(uid: string, updates: Partial<UserProfile>): Observable<void> {
    const userRef = doc(db, `users/${uid}`);
    return from(updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    })).pipe(
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }

  // ----------------------------
  // COURSE CRUD
  // ----------------------------

   getCourses(): Observable<Course[]> {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data["createdAt"] as Timestamp).toDate()
          } as Course;
        });
      }),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to get courses'));
      })
    );
  }

  getPublishedCourses(): Observable<Course[]> {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('status', '==', 'published'));
    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data["createdAt"] as Timestamp).toDate()
          } as Course;
        });
      }),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to get published courses'));
      })
    );
  }

  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('instructorId', '==', instructorId));
    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data["createdAt"] as Timestamp).toDate()
          } as Course;
        });
      }),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to get instructor courses'));
      })
    );
  }

  getCoursesByCategory(categoryId: string): Observable<Course[]> {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef,
      where('categoryId', '==', categoryId),
      where('status', '==', 'published')
    );
    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data["createdAt"] as Timestamp).toDate()
          } as Course;
        });
      }),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to get category courses'));
      })
    );
  }

  getCourse(courseId: string): Observable<Course | null> {
    const courseRef = doc(db, `courses/${courseId}`);
    return from(getDoc(courseRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return { id: docSnap.id, ...data, createdAt: (data["createdAt"] as Timestamp).toDate() } as Course;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to get course'));
      })
    );
  }

  addCourse(course: Omit<Course, 'id'>): Observable<string> {
    const coursesRef = collection(db, 'courses');
    const courseData = {
      ...course,
      createdAt: Timestamp.fromDate(new Date())
    };
    return from(addDoc(coursesRef, courseData)).pipe(
      map((docRef) => docRef.id),
      tap((courseId) => console.log('Course added with ID:', courseId)),
      catchError((error) => {
        console.error('Firestore Error:', error);
        return throwError(() => new Error('Failed to add course'));
      })
    );
  }
}
