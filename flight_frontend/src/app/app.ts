/**
 * app.ts is the root component of the Angular application.
 * It serves as the main entry point for the app's UI, containing the router outlet for rendering different pages and common components like the navbar and footer.
 * This component is responsible for providing a consistent layout across all pages of the application.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {}