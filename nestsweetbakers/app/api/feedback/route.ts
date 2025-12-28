import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const docRef = await addDoc(collection(db, 'feedback'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}
