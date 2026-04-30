import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- FAQ Section -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Frequently Asked Questions</h2>
          <p class="text-muted">Everything you need to know about SkyBook</p>
        </div>
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="accordion" id="faqAccordion">
              <div class="accordion-item border-0 mb-2 rounded-3 shadow-sm overflow-hidden"
                   *ngFor="let faq of faqs; let i = index">
                <h2 class="accordion-header">
                  <button class="accordion-button fw-semibold"
                          [class.collapsed]="openFaq !== i"
                          type="button"
                          (click)="toggleFaq(i)">
                    {{ faq.q }}
                  </button>
                </h2>
                <div [class.show]="openFaq === i" class="accordion-collapse collapse">
                  <div class="accordion-body text-muted">{{ faq.a }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white pt-5 pb-3">
      <div class="container">
        <div class="row g-4 mb-4">

          <!-- Brand -->
          <div class="col-md-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-airplane-fill text-primary fs-4"></i>
              <span class="fw-bold fs-5">SkyBook</span>
            </div>
            <p class="text-white-50 small">
              Your trusted flight booking platform. Search, compare and book
              flights with top airlines worldwide.
            </p>
            <div class="d-flex gap-3 mt-3">
              <a href="#" class="text-white-50 fs-5"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="text-white-50 fs-5"><i class="bi bi-facebook"></i></a>
              <a href="#" class="text-white-50 fs-5"><i class="bi bi-instagram"></i></a>
              <a href="#" class="text-white-50 fs-5"><i class="bi bi-linkedin"></i></a>
            </div>
          </div>

          <!-- Quick links -->
          <div class="col-md-2">
            <h6 class="fw-bold mb-3">Quick Links</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><a routerLink="/home" class="text-white-50 text-decoration-none small">Home</a></li>
              <li class="mb-2"><a routerLink="/flights" class="text-white-50 text-decoration-none small">Flights</a></li>
              <li class="mb-2"><a routerLink="/my-bookings" class="text-white-50 text-decoration-none small">My Bookings</a></li>
              <li class="mb-2"><a routerLink="/register" class="text-white-50 text-decoration-none small">Register</a></li>
            </ul>
          </div>

          <!-- Airlines -->
          <div class="col-md-2">
            <h6 class="fw-bold mb-3">Airlines</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><span class="text-white-50 small">Emirates</span></li>
              <li class="mb-2"><span class="text-white-50 small">Qatar Airways</span></li>
              <li class="mb-2"><span class="text-white-50 small">British Airways</span></li>
              <li class="mb-2"><span class="text-white-50 small">Lufthansa</span></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="col-md-4">
            <h6 class="fw-bold mb-3">Contact & Support</h6>
            <ul class="list-unstyled text-white-50 small">
              <li class="mb-2"><i class="bi bi-envelope me-2"></i>support&#64;skybook.com</li>
              <li class="mb-2"><i class="bi bi-telephone me-2"></i>+44 800 123 4567</li>
              <li class="mb-2"><i class="bi bi-clock me-2"></i>24/7 Customer Support</li>
              <li class="mb-2"><i class="bi bi-geo-alt me-2"></i>London, United Kingdom</li>
            </ul>
          </div>

        </div>

        <hr class="border-secondary">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <small class="text-white-50">© 2026 SkyBook. All rights reserved.</small>
          <div class="d-flex gap-3">
            <a href="#" class="text-white-50 small text-decoration-none">Privacy Policy</a>
            <a href="#" class="text-white-50 small text-decoration-none">Terms of Service</a>
            <a href="#" class="text-white-50 small text-decoration-none">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  openFaq: number | null = null;

  faqs = [
    {
      q: 'How do I book a flight on SkyBook?',
      a: 'Browse flights on the Flights page, click on any flight to view details and pricing, then click "Book This Flight". Fill in your trip details, passenger information and confirm your booking.'
    },
    {
      q: 'Can I book for multiple passengers?',
      a: 'Yes! When booking a flight, you can select up to 9 passengers. You will be asked to provide individual passenger details including full name and passport number for each traveller.'
    },
    {
      q: 'What payment methods are accepted?',
      a: 'SkyBook accepts all major credit and debit cards. Payments are processed securely. You will see the total price breakdown before confirming your booking.'
    },
    {
      q: 'Can I cancel or modify my booking?',
      a: 'Yes, you can view and manage your bookings from the "My Bookings" page after logging in. Cancellation policies vary by airline and fare type.'
    },
    {
      q: 'Is my personal data safe?',
      a: 'Absolutely. We use industry-standard JWT authentication and optionally Google/Apple sign-in via Auth0. Your passport and personal information is encrypted and never shared with third parties.'
    },
    {
      q: 'Do you support round trips and multi-city bookings?',
      a: 'Yes! When booking, you can choose between one-way, round trip, and multi-city travel options. Round trip prices are calculated automatically.'
    }
  ];

  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }
}