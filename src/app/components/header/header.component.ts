import { Component } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [GeminiService]
})
export class HeaderComponent {
  isRecording: boolean = false;
  isPaused: boolean = false;
  showModal: boolean = false;
  showFindReplaceModal: boolean = false;
  isTranscribing: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  recordingTime: string = '00:00';
  private timerInterval: any;
  private audioBlob: Blob | null = null;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  
  // Find and Replace properties
  findText: string = '';
  replaceText: string = '';
  textNotFound: boolean = false;
  foundTextIndices: { start: number; length: number }[] = [];
  currentHighlightIndex: number = -1;
  isReplaceMode: boolean = false;
  matchCase: boolean = true;
  wholeWord: boolean = false;
  matchSentence: boolean = false;

  // Toast properties
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any;

  constructor(
    private geminiService: GeminiService,
    private transcriptionService: TranscriptionService
  ) {}

  async toggleRecording() {
    if (!this.isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.startRecording(stream);
        this.showModal = true;
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Please allow microphone access to record audio.');
      }
    } else {
      this.stopRecording();
    }
  }

  togglePause() {
    if (this.mediaRecorder) {
      if (this.isPaused) {
        this.mediaRecorder.resume();
        this.startTimer();
      } else {
        this.mediaRecorder.pause();
        this.stopTimer();
      }
      this.isPaused = !this.isPaused;
    }
  }

  startTimer() {
    this.startTime = Date.now() - this.elapsedTime;
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      const minutes = Math.floor(this.elapsedTime / 60000);
      const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
      this.recordingTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startRecording(stream: MediaStream) {
    this.isRecording = true;
    this.isPaused = false;
    this.audioChunks = [];
    this.recordingTime = '00:00';
    this.elapsedTime = 0;
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      // Stop all tracks in the stream
      stream.getTracks().forEach(track => track.stop());
      this.stopTimer();
    };

    this.mediaRecorder.start();
    this.startTimer();
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      this.isPaused = false;
      this.mediaRecorder.stop();
      this.stopTimer();
    }
  }

  transcribeRecording() {
    // First stop the recording if it's still active
    if (this.isRecording) {
      this.stopRecording();
    }

    this.isTranscribing = true;

    // Wait a short moment for the recording to fully stop and the blob to be created
    setTimeout(() => {
      if (this.audioBlob) {
        const audioFile = new File([this.audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        this.geminiService.transcribeAudioInline(audioFile, 'auto-AI').subscribe({
          next: (response: any) => {
            let transcript = 'No transcript available.';
            if (response && response.candidates && response.candidates.length > 0) {
              transcript = response.candidates[0].content.parts[0].text || transcript;
            }
            this.transcriptionService.updateTranscript(transcript);
            this.isTranscribing = false;
            this.closeModal();
          },
          error: (err) => {
            console.error('Error during transcription:', err);
            this.transcriptionService.updateTranscript('Transcription failed. Please try again.');
            this.isTranscribing = false;
            this.closeModal();
          }
        });
      } else {
        this.isTranscribing = false;
        this.closeModal();
      }
    }, 100);
  }

  closeModal() {
    this.stopRecording();
    this.showModal = false;
    this.audioBlob = null;
    this.elapsedTime = 0;
  }

  openFindReplaceModal() {
    this.showFindReplaceModal = true;
    this.isReplaceMode = false;
    this.replaceText = '';
    this.textNotFound = false;
    this.foundTextIndices = [];
    this.currentHighlightIndex = -1;
    this.matchCase = true;

    if (this.findText && this.findText.trim()) {
      this.findTextInTranscript(false);
    }
  }

  closeFindReplaceModal() {
    this.showFindReplaceModal = false;
    this.replaceText = '';
    this.textNotFound = false;
  }

  clearHighlighting() {
    this.foundTextIndices = [];
    this.currentHighlightIndex = -1;
    this.transcriptionService.clearHighlightedText();
  }

  toggleReplaceMode() {
    this.isReplaceMode = !this.isReplaceMode;
  }

  showSuccessToast(message: string) {
    this.showToast = true;
    this.toastMessage = message;
    this.toastType = 'success';
    this.resetToastTimeout();
  }

  showErrorToast(message: string) {
    this.showToast = true;
    this.toastMessage = message;
    this.toastType = 'error';
    this.resetToastTimeout();
  }

  hideToast() {
    this.showToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  private resetToastTimeout() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  findTextInTranscript(closeModal: boolean = false) {
    // Reset state
    this.textNotFound = false;
    this.foundTextIndices = [];
    this.currentHighlightIndex = -1;
    this.transcriptionService.clearHighlightedText();

    // Validate input
    if (!this.findText || !this.findText.trim()) {
      this.textNotFound = true;
      if (closeModal) {
        this.showErrorToast('Please enter text to search');
      }
      return;
    }

    let currentTranscript = '';
    this.transcriptionService.transcript$.subscribe(transcript => {
      currentTranscript = transcript;
    }).unsubscribe();

    if (!currentTranscript) {
      this.textNotFound = true;
      if (closeModal) {
        this.showErrorToast('No transcript available');
      }
      return;
    }

    // Build regex pattern based on options
    let pattern = this.findText.trim();
    
    // Escape special regex characters
    pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    if (this.matchSentence) {
      // Match the exact sentence with optional whitespace
      pattern = `\\s*${pattern}\\s*`;
    } else if (this.wholeWord) {
      // Only match if it's a complete word
      pattern = `\\b${pattern}\\b`;
    }
    
    if (!this.matchCase) {
      pattern = `(?i)${pattern}`;
    }
    
    try {
      const regex = new RegExp(pattern, 'g');
      let match;
      this.foundTextIndices = [];
      
      while ((match = regex.exec(currentTranscript)) !== null) {
        // Store the exact match position and length
        this.foundTextIndices.push({
          start: match.index,
          length: match[0].length
        });
      }
      
      if (this.foundTextIndices.length === 0) {
        this.textNotFound = true;
        if (closeModal) {
          this.showErrorToast('No matches found');
        }
      } else {
        this.textNotFound = false;
        this.currentHighlightIndex = 0;
        this.highlightAllMatches();
        if (closeModal) {
          this.showSuccessToast(`Found ${this.foundTextIndices.length} matches`);
        }
        // Only close modal if explicitly requested
        if (closeModal) {
          this.closeFindReplaceModal();
        }
      }
    } catch (error) {
      console.error('Error in regex pattern:', error);
      this.textNotFound = true;
      if (closeModal) {
        this.showErrorToast('Invalid search pattern');
      }
    }
  }

  highlightAllMatches() {
    let currentTranscript = '';
    this.transcriptionService.transcript$.subscribe(transcript => {
      currentTranscript = transcript;
    }).unsubscribe();
    
    if (this.foundTextIndices.length > 0) {
      // Highlight each match individually
      this.foundTextIndices.forEach(match => {
        this.transcriptionService.setHighlightedText(
          this.findText,
          match.start,
          match.start + match.length
        );
      });
    } else if (this.textNotFound) {
      // If no matches found, highlight the entire text
      this.transcriptionService.setHighlightedText('', 0, currentTranscript.length);
    }
  }

  highlightCurrentMatch() {
    let currentTranscript = '';
    this.transcriptionService.transcript$.subscribe(transcript => {
      currentTranscript = transcript;
    }).unsubscribe();
    
    if (this.foundTextIndices.length > 0 && this.currentHighlightIndex >= 0) {
      const match = this.foundTextIndices[this.currentHighlightIndex];
      this.transcriptionService.setHighlightedText(
        this.findText,
        match.start,
        match.start + match.length
      );
    } else if (this.textNotFound) {
      // If no matches found, highlight the entire text
      this.transcriptionService.setHighlightedText('', 0, currentTranscript.length);
    }
  }

  findNext() {
    if (this.foundTextIndices.length > 0) {
      this.currentHighlightIndex = (this.currentHighlightIndex + 1) % this.foundTextIndices.length;
      this.highlightCurrentMatch();
    }
  }

  findPrevious() {
    if (this.foundTextIndices.length > 0) {
      this.currentHighlightIndex = (this.currentHighlightIndex - 1 + this.foundTextIndices.length) % this.foundTextIndices.length;
      this.highlightCurrentMatch();
    }
  }

  replaceCurrent() {
    if (this.findText && this.replaceText) {
      let currentTranscript = '';
      this.transcriptionService.transcript$.subscribe(transcript => {
        currentTranscript = transcript;
      }).unsubscribe();
      
      // Build regex pattern based on options
      let pattern = this.findText.trim();
      
      // Escape special regex characters
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (this.matchSentence) {
        // Match the exact sentence with optional whitespace
        pattern = `\\s*${pattern}\\s*`;
      } else if (this.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      
      if (!this.matchCase) {
        pattern = `(?i)${pattern}`;
      }
      
      try {
        const regex = new RegExp(pattern, 'g');
        const newTranscript = currentTranscript.replace(regex, this.replaceText);
        
        this.transcriptionService.updateTranscript(newTranscript);
        this.transcriptionService.clearHighlightedText();
        this.foundTextIndices = [];
        this.currentHighlightIndex = -1;
        this.textNotFound = true;
        
        this.showSuccessToast('All occurrences replaced successfully');
        this.closeFindReplaceModal();
      } catch (error) {
        console.error('Error in regex pattern:', error);
        this.showErrorToast('Invalid replace pattern');
      }
    }
  }

  onFindTextChange() {
    // Reset state when text changes
    this.textNotFound = false;
    this.foundTextIndices = [];
    this.currentHighlightIndex = -1;
    this.transcriptionService.clearHighlightedText();

    // Only search if there's text
    if (this.findText && this.findText.trim()) {
      this.findTextInTranscript(false); // Don't show toast or close modal on text change
    }
  }

  ngOnDestroy() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}