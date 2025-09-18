import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { BackgroundAnimationsComponent } from "./components/background-animations.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, BackgroundAnimationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'course-mart';
}
