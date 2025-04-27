import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private transcriptSubject = new BehaviorSubject<string>('');
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private words: string[] = [];
  private spokenWords: Set<number> = new Set();
  private lastWordIndex: number = -1;
  private audioDuration: number = 0;

  transcript$ = this.transcriptSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();

  updateTranscript(transcript: string): void {
    this.transcriptSubject.next(transcript);
    this.words = transcript.split(/\s+/);
    this.spokenWords.clear();
    this.lastWordIndex = -1;
  }

  setAudioDuration(duration: number): void {
    this.audioDuration = duration;
  }

  updateCurrentTime(time: number): void {
    this.currentTimeSubject.next(time);
    
    const totalWords = this.words.length;
    if (totalWords > 0 && this.audioDuration > 0) {
      // Calculate the exact word index based on the current time and total duration
      const progress = time / this.audioDuration; // 0 to 1
      const newWordIndex = Math.min(
        Math.floor(progress * totalWords),
        totalWords - 1
      );
      
      // Mark all words up to the current index as spoken
      if (newWordIndex > this.lastWordIndex) {
        for (let i = this.lastWordIndex + 1; i <= newWordIndex; i++) {
          this.spokenWords.add(i);
        }
        this.lastWordIndex = newWordIndex;
      }
    }
  }

  getCurrentWord(): number {
    return this.lastWordIndex;
  }

  isWordSpoken(position: number): boolean {
    return this.spokenWords.has(position);
  }

  resetSpokenWords(): void {
    this.spokenWords.clear();
    this.lastWordIndex = -1;
  }
}