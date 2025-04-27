import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitByHighlight',
  standalone: true
})
export class SplitByHighlightPipe implements PipeTransform {
  transform(text: string, highlight: string, index: number): string[] {
    if (!text || !highlight) return [text];
    
    const parts: string[] = [];
    const regex = new RegExp(highlight, 'gi');
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index === index) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        // Add the matched text
        parts.push(match[0]);
        // Add remaining text
        if (match.index + match[0].length < text.length) {
          parts.push(text.substring(match.index + match[0].length));
        }
        return parts;
      }
    }
    
    return [text];
  }
} 