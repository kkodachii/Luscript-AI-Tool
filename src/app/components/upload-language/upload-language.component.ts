import { Component, ViewChild } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-language',
  templateUrl: './upload-language.component.html',
  styleUrls: ['./upload-language.component.css'],
  standalone: true,
  providers: [GeminiService],
  imports:[CommonModule]
})
export class UploadLanguageComponent {
  selectedFile: File | null = null; // Stores the uploaded file
  selectedLanguage: string = 'auto-AI'; // Default language
  isLoading: boolean = false;

  constructor(private geminiService: GeminiService, private transcriptionService: TranscriptionService) {}

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Programmatically trigger the file input
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]; // Update the selected file
    } else {
      this.selectedFile = null; // Reset to null if no file is selected
    }
  }

  transcribe(): void {
    if (!this.selectedFile) {
      alert('Please select an audio or video file.');
      return;
    }

    this.isLoading = true;
    this.geminiService.transcribeAudioInline(this.selectedFile, this.selectedLanguage).subscribe({
      next: (response: any) => {
        console.log('Full API Response:', response);

        // Extract the transcript from the response
        let transcript = 'No transcript available.';
        if (response && response.candidates && response.candidates.length > 0) {
          transcript = response.candidates[0].content.parts[0].text || transcript;
        }

        // Update the transcript in the shared service
        this.transcriptionService.updateTranscript(transcript);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error during transcription:', err);
        this.transcriptionService.updateTranscript('Transcription failed. Please try again.');
        this.isLoading = false;
      },
    });
  }

  onButtonClick(): void {
    if (this.selectedFile) {
      // If a file is selected, start transcription
      this.transcribe();
    } else {
      // Otherwise, trigger file input
      this.triggerFileInput();
    }
  }

  deleteFile(): void {
    this.selectedFile = null; // Reset the selected file
  
    // Reset the file input's value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the file input
    }
  }
}