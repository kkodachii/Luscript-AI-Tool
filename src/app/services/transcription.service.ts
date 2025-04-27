import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private transcriptSubject = new BehaviorSubject<string>('');
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private highlightedTextSubject = new BehaviorSubject<{text: string, startIndex: number, endIndex: number}>({ text: '', startIndex: 0, endIndex: 0 });
  private words: string[] = [];
  private spokenWords: Set<number> = new Set();
  private lastWordIndex: number = -1;
  private audioDuration: number = 0;
  private wordPositions: number[] = [];
  private currentAudioPosition: number = 0;

  transcript$ = this.transcriptSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();
  highlightedText$ = this.highlightedTextSubject.asObservable();

  updateTranscript(transcript: string): void {
    this.transcriptSubject.next(transcript);
    // Split by spaces and punctuation but keep them in the array
    this.words = transcript.split(/(\s+|[.,!?;:])/);
    this.spokenWords.clear();
    this.lastWordIndex = -1;
    this.wordPositions = [];
    
    // Initialize word positions
    let currentPosition = 0;
    this.wordPositions = this.words.map(word => {
      const position = currentPosition;
      currentPosition += word.length;
      return position;
    });
  }

  setAudioDuration(duration: number): void {
    this.audioDuration = duration;
  }

  updateCurrentTime(time: number): void {
    this.currentTimeSubject.next(time);
    this.currentAudioPosition = time;
    
    const totalWords = this.words.length;
    if (totalWords > 0) {
      // Find the word that should be highlighted based on audio position
      const newWordIndex = this.findWordIndexAtPosition(time);
      
      // Mark all words up to the current index as spoken
      if (newWordIndex > this.lastWordIndex) {
        for (let i = this.lastWordIndex + 1; i <= newWordIndex; i++) {
          this.spokenWords.add(i);
        }
        this.lastWordIndex = newWordIndex;
      }
    }
  }

  private findWordIndexAtPosition(time: number): number {
    // Simple linear mapping of time to word position
    const totalWords = this.words.length;
    if (totalWords === 0) return -1;

    // Calculate words per second based on total duration
    const wordsPerSecond = totalWords / this.audioDuration;
    
    // Calculate the expected word index based on time
    const expectedIndex = Math.floor(time * wordsPerSecond);
    
    // Ensure the index is within bounds
    return Math.min(Math.max(0, expectedIndex), totalWords - 1);
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

  setHighlightedText(text: string, startIndex: number, endIndex: number): void {
    this.highlightedTextSubject.next({ text, startIndex, endIndex });
  }

  clearHighlightedText(): void {
    this.highlightedTextSubject.next({ text: '', startIndex: 0, endIndex: 0 });
  }
}