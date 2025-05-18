import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface TranscriptionProgress {
  isProcessing: boolean;
  progress: number;
  currentChunk: number;
  totalChunks: number;
  statusMessage: string;
  isUploading: boolean;
  uploadProgress: number;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private transcriptSubject = new BehaviorSubject<string>('');
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private highlightedTextSubject = new BehaviorSubject<{text: string, startIndex: number, endIndex: number}>({ text: '', startIndex: 0, endIndex: 0 });
  private transcriptionProgressSubject = new BehaviorSubject<TranscriptionProgress>({
    isProcessing: false,
    progress: 0,
    currentChunk: 0,
    totalChunks: 0,
    statusMessage: 'Processing audio...',
    isUploading: false,
    uploadProgress: 0
  });

  transcript$ = this.transcriptSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();
  highlightedText$ = this.highlightedTextSubject.asObservable();
  transcriptionProgress$ = this.transcriptionProgressSubject.asObservable();

  private words: string[] = [];
  private spokenWords: Set<number> = new Set();
  private lastWordIndex: number = -1;
  private audioDuration: number = 0;
  private wordPositions: number[] = [];
  private currentAudioPosition: number = 0;
  private startTime: number = 0;
  private lastProgressUpdate: number = 0;
  private progressHistory: { time: number; progress: number }[] = [];

  updateTranscript(transcript: string): void {
    this.transcriptSubject.next(transcript);
    this.words = transcript.split(/(\s+|[.,!?;:])/);
    this.spokenWords.clear();
    this.lastWordIndex = -1;
    this.wordPositions = [];
    
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
      const newWordIndex = this.findWordIndexAtPosition(time);
      
      if (newWordIndex > this.lastWordIndex) {
        for (let i = this.lastWordIndex + 1; i <= newWordIndex; i++) {
          this.spokenWords.add(i);
        }
        this.lastWordIndex = newWordIndex;
      }
    }
  }

  private findWordIndexAtPosition(time: number): number {
    const totalWords = this.words.length;
    if (totalWords === 0) return -1;

    const wordsPerSecond = totalWords / this.audioDuration;
    const expectedIndex = Math.floor(time * wordsPerSecond);
    
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

  updateTranscriptionProgress(progress: Partial<TranscriptionProgress>): void {
    const currentProgress = this.transcriptionProgressSubject.value;
    this.transcriptionProgressSubject.next({
      ...currentProgress,
      ...progress
    });
  }

  startUpload(): void {
    this.updateTranscriptionProgress({
      isProcessing: true,
      isUploading: true,
      progress: 1,
      uploadProgress: 1,
      statusMessage: 'Uploading audio file...'
    });
  }

  updateUploadProgress(progress: number): void {
    // Ensure progress is between 1 and 100
    const normalizedProgress = Math.max(1, Math.min(100, progress));
    this.updateTranscriptionProgress({
      uploadProgress: normalizedProgress,
      statusMessage: `Uploading: ${normalizedProgress}%`
    });
  }

  startTranscription(totalChunks: number): void {
    this.startTime = Date.now();
    this.lastProgressUpdate = this.startTime;
    this.progressHistory = [];
    this.updateTranscriptionProgress({
      isUploading: false,
      progress: 1,
      currentChunk: 0,
      totalChunks,
      statusMessage: 'Starting transcription...'
    });
  }

  updateChunkProgress(currentChunk: number, totalChunks: number): void {
    // Calculate progress ensuring it starts from 1 and goes up to 100
    const progress = Math.max(1, Math.round((currentChunk / totalChunks) * 100));
    
    // Record progress history
    this.progressHistory.push({ time: Date.now(), progress });
    
    this.updateTranscriptionProgress({
      progress,
      currentChunk,
      totalChunks,
      statusMessage: `Processing chunk ${currentChunk} of ${totalChunks}...`
    });
  }

  completeTranscription(): void {
    this.updateTranscriptionProgress({
      isProcessing: false,
      isUploading: false,
      progress: 100,
      uploadProgress: 100,
      statusMessage: 'Transcription completed!'
    });
  }
}