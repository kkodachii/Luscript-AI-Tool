import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private GEMINI_API_KEY = 'AIzaSyBIaly87RD4LviGrnhPCG9TGBbDLmnte68'; // Replace with your actual API key
  private GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(private http: HttpClient) {}

  transcribeAudioInline(file: File, languageCode: string): Observable<any> {
    const reader = new FileReader();

    return new Observable((observer) => {
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString().split(',')[1]; // Extract base64 data

        if (!base64Data) {
          observer.error('Failed to read file');
          return;
        }

        // Define the prompt based on the selected language
        let languagePrompt = '';
        switch (languageCode) {
          case 'auto-AI':
            languagePrompt = 'Generate a transcript of the speech. show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly.';
            break;
          case 'en-US':
            languagePrompt = 'Generate a transcript of the speech in English.show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly.';
            break;
          case 'tl-PH':
            languagePrompt = 'Generate a transcript of the speech in Tagalog. show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly.';
            break;
          case 'taglish':
            languagePrompt = 'Generate a transcript of the speech in Taglish (a mix of Tagalog and English). show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly.';
            break;
          default:
            languagePrompt = 'Generate a transcript of the speech. show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly.';
        }

        // Ensure the mimeType is set correctly for audio files
        const mimeType = file.type.startsWith('video/') ? 'audio/wav' : file.type;

        const payload = {
          contents: [
            {
              parts: [
                { text: languagePrompt },
                {
                  inlineData: {
                    mimeType: mimeType, // Use the correct mimeType
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        };

        console.log('Request Payload:', JSON.stringify(payload, null, 2)); // Log the payload

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });

        // Send the base64 audio data to Gemini API
        this.http
          .post(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, payload, { headers })
          .subscribe({
            next: (response: any) => observer.next(response),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
      };

      reader.onerror = (error) => {
        observer.error('File reading failed');
      };

      reader.readAsDataURL(file); // Read the file as base64
    });
  }
}