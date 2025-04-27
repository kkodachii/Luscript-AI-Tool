import { Component } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [GeminiService]
})
export class HeaderComponent {
  isRecording: boolean = false;
  isPaused: boolean = false;
  showModal: boolean = false;
  isTranscribing: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  recordingTime: string = '00:00';
  private timerInterval: any;
  private audioBlob: Blob | null = null;
  private startTime: number = 0;
  private elapsedTime: number = 0;

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
}