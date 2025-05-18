import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transcription-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="text-center mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Processing Audio</h3>
          <p class="text-sm text-gray-500">{{ statusMessage }}</p>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>{{ isUploading ? 'Uploading' : 'Processing' }}</span>
            <span>{{ isUploading ? uploadProgress : progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div [class]="isUploading ? 'bg-blue-600' : 'bg-indigo-600'"
                 class="h-2 rounded-full transition-all duration-300"
                 [style.width.%]="isUploading ? uploadProgress : progress"></div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class TranscriptionProgressComponent {
  @Input() isVisible = false;
  @Input() progress = 0;
  @Input() currentChunk = 0;
  @Input() totalChunks = 0;
  @Input() statusMessage = '';
  @Input() isUploading = false;
  @Input() uploadProgress = 0;
} 