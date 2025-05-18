import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patch-note',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPatchNote" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-2 sm:mx-4 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div class="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Latest Updates</h2>
          </div>
          <button (click)="closePatchNote()" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 sm:space-y-6">
          <p class="text-base sm:text-lg text-gray-600">Welcome to our latest version! Here are the recent updates:</p>
          
          <!-- Major Updates -->
          <div class="bg-blue-50 rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div class="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 class="text-base sm:text-lg font-semibold text-blue-700">Major Updates</h3>
            </div>
            <ul class="space-y-2 sm:space-y-3">
              <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm sm:text-base text-gray-700">Removed time limit for audio files - process audio of any length</span>
              </li>
              <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm sm:text-base text-gray-700">Improved transcription accuracy with sentence-by-sentence processing</span>
              </li>
            </ul>
          </div>

          <!-- Minor Updates -->
          <div class="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div class="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 class="text-base sm:text-lg font-semibold text-gray-700">Minor Updates</h3>
            </div>
            <ul class="space-y-2 sm:space-y-3">
              <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm sm:text-base text-gray-700">Added patch notes system to keep you informed about updates</span>
              </li>
              <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm sm:text-base text-gray-700">Implemented progress modal to show real-time transcription status</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-6 sm:mt-8 flex justify-end">
          <button 
            (click)="closePatchNote()"
            class="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium text-sm sm:text-base"
          >
            <span>Got it!</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PatchNoteComponent implements OnInit {
  showPatchNote = false;

  ngOnInit() {
    // Check if user has already seen the patch note
    const hasSeenPatchNote = localStorage.getItem('hasSeenPatchNote');
    if (!hasSeenPatchNote) {
      this.showPatchNote = true;
    }
  }

  closePatchNote() {
    this.showPatchNote = false;
    // Save to local storage that user has seen the patch note
    localStorage.setItem('hasSeenPatchNote', 'true');
  }
} 