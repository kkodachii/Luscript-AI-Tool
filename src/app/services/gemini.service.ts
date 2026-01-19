import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranscriptionService } from '../services/transcription.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private GEMINI_API_KEY = 'AIzaSyBIaly87RD4LviGrnhPCG9TGBbDLmnte68'; // Replace with your actual API key
  private GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent';
  private MAX_PAYLOAD_SIZE = 300 * 1024 * 1024; // 300MB in bytes

  constructor(private http: HttpClient, private transcriptionService: TranscriptionService) {}

  private async compressAudio(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
    const offlineContext = new OfflineAudioContext(
      1, // mono
      audioBuffer.sampleRate * audioBuffer.duration,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  }

  private async reduceAudioQuality(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
    // Reduce sample rate to 16kHz
    const targetSampleRate = 16000;
    const offlineContext = new OfflineAudioContext(
      1, // mono
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  }

  private async audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    const offset = 44;
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }

    let pos = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + pos, value, true);
        pos += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private async processAudioFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // First try to compress the audio
          audioBuffer = await this.compressAudio(audioBuffer);

          // If still too large, reduce quality
          const compressedBlob = await this.audioBufferToWav(audioBuffer);
          if (compressedBlob.size > this.MAX_PAYLOAD_SIZE) {
            audioBuffer = await this.reduceAudioQuality(audioBuffer);
          }

          const finalBlob = await this.audioBufferToWav(audioBuffer);
          const processedFile = new File([finalBlob], file.name, { type: 'audio/wav' });
          resolve(processedFile);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  }

  private async splitAudioIntoChunks(file: File, chunkDurationMs: number = 30 * 60 * 1000): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const chunks: File[] = [];
          const totalDuration = audioBuffer.duration * 1000;
          const numberOfChunks = Math.ceil(totalDuration / chunkDurationMs);

          for (let i = 0; i < numberOfChunks; i++) {
            const startTime = i * chunkDurationMs / 1000;
            const endTime = Math.min((i + 1) * chunkDurationMs / 1000, audioBuffer.duration);
            const chunkDuration = endTime - startTime;

            const chunkBuffer = audioContext.createBuffer(
              audioBuffer.numberOfChannels,
              audioBuffer.sampleRate * chunkDuration,
              audioBuffer.sampleRate
            );

            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
              const channelData = audioBuffer.getChannelData(channel);
              const chunkData = chunkBuffer.getChannelData(channel);
              const startSample = Math.floor(startTime * audioBuffer.sampleRate);
              const endSample = Math.floor(endTime * audioBuffer.sampleRate);
              chunkData.set(channelData.slice(startSample, endSample));
            }

            const wavBlob = await this.audioBufferToWav(chunkBuffer);
            const chunkFile = new File([wavBlob], `chunk_${i + 1}.wav`, { type: 'audio/wav' });
            chunks.push(chunkFile);
          }

          resolve(chunks);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  }

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
            languagePrompt = 'Generate a transcript of the speech. show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly. also make the format like a script base on the sentence structure. also make the punctuation and grammar correct.';
            break;
          case 'en-US':
            languagePrompt = 'Generate a transcript of the speech in English.show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly. also make the format like a script base on the sentence structure. also make the punctuation and grammar correct.';
            break;
          case 'tl-PH':
            languagePrompt = 'Generate a transcript of the speech in Tagalog. show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly. also make the format like a script base on the sentence structure. also make the punctuation and grammar correct.';
            break;
          case 'taglish':
            languagePrompt = 'Generate a transcript of the speech in Taglish (a mix of Tagalog and English). show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly. also make the format like a script base on the sentence structure. also make the punctuation and grammar correct.';
            break;
          default:
            languagePrompt = 'Generate a transcript of the speech. show only the transcript, no other text. add (Inaudible speech) when the speaker is not speaking clearly. also make the format like a script base on the sentence structure. also make the punctuation and grammar correct.';
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

  async transcribeLongAudio(file: File, languageCode: string): Promise<string> {
    try {
      // Start upload progress tracking
      this.transcriptionService.startUpload();

      // First process the audio file to reduce its size
      this.transcriptionService.updateTranscriptionProgress({
        statusMessage: 'Processing audio file...'
      });
      const processedFile = await this.processAudioFile(file);
      
      // Update upload progress to 50% after processing
      this.transcriptionService.updateUploadProgress(50);
      
      // Then split it into chunks
      this.transcriptionService.updateTranscriptionProgress({
        statusMessage: 'Splitting audio into chunks...'
      });
      const chunks = await this.splitAudioIntoChunks(processedFile);
      
      // Update upload progress to 100% after splitting
      this.transcriptionService.updateUploadProgress(100);
      
      // Start transcription progress tracking
      this.transcriptionService.startTranscription(chunks.length);
      let fullTranscript = '';

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        this.transcriptionService.updateChunkProgress(i + 1, chunks.length);
        
        const response = await this.transcribeAudioInline(chunk, languageCode).toPromise();
        if (response && response.candidates && response.candidates.length > 0) {
          const chunkTranscript = response.candidates[0].content.parts[0].text || '';
          fullTranscript += chunkTranscript + ' ';
        }
      }

      this.transcriptionService.completeTranscription();
      return fullTranscript.trim();
    } catch (error) {
      console.error('Error transcribing long audio:', error);
      this.transcriptionService.updateTranscriptionProgress({
        isProcessing: false,
        isUploading: false,
        statusMessage: 'Transcription failed. Please try again.'
      });
      throw error;
    }
  }
}