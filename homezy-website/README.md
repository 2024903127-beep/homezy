# Homezy - Consumer Web Portal & Web App

A production-ready consumer web application and brand website for **Homezy** (inspired by Urban Company, Blinkit, and Amazon).

Built with Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons, and integrated with the Homezy Backend API.

---

## Key Features

1. **Brand Website & Landing Page (`/`)**:
   - Modern hero section with city selector and instant search.
   - Quick service category grid (AC & Appliances, Deep Cleaning, Electrician, Plumber, Carpentry, Salon).
   - Trending high-demand services with instant pricing and booking shortcuts.
   - Transparent trust markers, verified stats band, and real customer reviews.

2. **Full Services Catalog & Doorstep Booking (`/services`)**:
   - 50+ standardized doorstep services with category tabs and real-time search.
   - Express 60-minute doorstep booking modal with pro assignment.
   - Supports URL query parameters (`?category=...`, `?service=...`) for deep linking from home or promotions.
   - Payment method toggle: **Cash on Delivery (Pay After Service)** or **Online Payment (UPI/Card)**.
   - Real-time address auto-fill and quick selection from saved addresses.

3. **Customer Web App & Auth (`/login`, `AuthModal`)**:
   - Phone + OTP authentication matching Urban Company & Blinkit mobile web flows.
   - Shared authentication state (`authContext`) persistent across sessions with JWT tokens.
   - Synchronized with the same backend database used by the Homezy mobile apps.

4. **Live Booking History & Order Tracking (`/bookings`)**:
   - Live order tracking with status badges (`Pro Assigned & On The Way`, `Completed`, `Cancelled`).
   - Assigned partner card with name, 4.9 star rating badge, and direct call button.
   - Tax invoice download trigger (`/bookings/:id/invoice`).
   - One-click booking cancellation with confirmation modal.

5. **Customer Profile & Address Book (`/profile`)**:
   - Manage user profile details (Name, Mobile, Email).
   - Add, view, and delete saved addresses (Home, Office, Other) with default tags.

6. **Informational & Partner Pages**:
   - **About Homezy (`/about`)**: Company vision, 30-day rework warranty, and quality standards.
   - **Partner Recruitment (`/join-us`)**: Onboarding portal for technicians earning Rs 40,000 - Rs 75,000/month.
   - **Careers (`/careers`)**: Job listings with simple resume application form.
   - **Support & FAQs (`/support`)**: Help center with collapsible accordion FAQs and instant assistance.
   - **Contact Us (`/contact`)**: Headquarters contact information and message submission.
   - **Legal Compliance**: Privacy Policy (`/privacy-policy`), Terms of Service (`/terms`), and Disclaimer (`/disclaimer`).

---

## Running Locally

```bash
cd D:\Homezy\homezy-website
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Connection

Configured in `src/lib/api.ts`:
- Points to Homezy backend API at `http://localhost:4000/api` (configurable via `NEXT_PUBLIC_API_URL`).
- Includes automatic resilient fallbacks with local caching so all booking, authentication, and browsing flows operate seamlessly in offline/demo mode as well.
