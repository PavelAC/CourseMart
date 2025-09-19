import { Component } from '@angular/core';

@Component({
  selector: 'app-background-animations',
  standalone: true,
  template: `
    <div class="background-animations">
      <div class="particle particle1 animate-float"></div>
      <div class="particle particle2 animate-float" style="animation-delay: -2s;"></div>
      <div class="particle particle3 animate-float" style="animation-delay: -4s;"></div>
      <div class="particle particle4 animate-float" style="animation-delay: -3s;"></div>
      <div class="particle particle5 animate-float" style="animation-delay: -1s;"></div>
      <div class="particle particle6 animate-float" style="animation-delay: -5s;"></div>
    </div>
  `
})
export class BackgroundAnimationsComponent {}
