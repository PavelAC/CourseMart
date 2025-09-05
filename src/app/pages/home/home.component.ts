import { AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
    this.createParticles();
    this.setupScrollAnimations();
  }

private createParticles() {
  const container = document.getElementById('particles');
  console.log('Container found:', container);
  
  if (!container) {
    console.error('Particles container not found!');
    return;
  }

  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation delay and duration
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    container.appendChild(particle);
  }
  
  console.log(`Created ${particleCount} particles`);
  console.log('First particle:', container.firstElementChild);
}

  private setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    const cards = document.querySelectorAll('.stat-card, .feature-card, .course-card');
    cards.forEach(card => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(30px)';
      (card as HTMLElement).style.transition = 'all 0.6s ease';
      observer.observe(card);
    });
  }
}
