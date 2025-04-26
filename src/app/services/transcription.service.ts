import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionService {
  // Create a BehaviorSubject to manage the transcript state
  private transcriptSubject = new BehaviorSubject<string>('');
  // Expose the transcript as an observable
  transcript$ = this.transcriptSubject.asObservable();

  // Method to update the transcript
  updateTranscript(transcript: string): void {
    this.transcriptSubject.next(transcript);
  }
}