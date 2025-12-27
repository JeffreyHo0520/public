
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stop-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rustGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#F87171" />
          <stop offset="100%" stop-color="#DC2626" />
        </linearGradient>
      </defs>
       <circle 
        cx="24" 
        cy="24" 
        r="22" 
        stroke="#475569" 
        stroke-width="2"
      />
      <rect x="15" y="15" width="18" height="18" rx="2" fill="url(#rustGradient)" />
    </svg>
  `,
})
export class StopIconComponent {}
