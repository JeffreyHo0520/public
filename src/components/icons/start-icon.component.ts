
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-start-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="amberGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#FBBF24" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
      </defs>
      <circle 
        cx="24" 
        cy="24" 
        r="22" 
        stroke="#475569" 
        stroke-width="2" 
        stroke-dasharray="6 6" 
        class="animate-spin-slow" 
        style="transform-origin: center;" 
      />
      <path d="M33 24L19.5 31.7942L19.5 16.2058L33 24Z" fill="url(#amberGradient)" />
    </svg>
  `,
})
export class StartIconComponent {}
