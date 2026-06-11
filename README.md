# Aetheria E-Commerce Platform

Aetheria is a premium, modern, glassmorphic client-side e-commerce storefront prototype built using **React, TypeScript, Vite, and Tailwind CSS**. It replicates standard production-level workflows (search auto-suggestions, wishlist drawer, review feeds, coupon discount engines, Stripe payment validations, and order timeline trackers) using persistent client-side state.

---

## 🚀 Key Features

* **Global Search & Debounced suggestions:** As the user types in the header search input, a debounced suggestions panel displays matching product thumbnails, names, categories, and prices.
* **Wishlist Drawer Panel:** Accessible directly from the User dropdown menu. Logged-in users can bookmark items to buy later, add them to the cart directly from the wishlist drawer, or navigate to product details.
* **Catalog Sorting & Filters:** Browse products by categories or search keywords, and sort them dynamically by Featured, Price (Low to High / High to Low), or Star Rating.
* **Interactive Image Details Gallery:** Click through product thumbnails in the details view to update the main display picture with styling highlights.
* **Interactive Review & Star Distribution:** Displays 5-star to 1-star distribution ratios and verified reviewer feeds. Users can submit reviews which instantly update the ratings distribution chart and average rating score.
* **Low Stock Warnings:** Displays alerts on pages and drawers when a product's stock is 5 or fewer.
* **Coupon Discount Engine:** Enter promo codes `AETHER20` (20% Off) or `WELCOME10` (10% Off) during checkout to dynamically recalculate subtotals, savings, and final totals.
* **Stripe Payment Emulator:** Displays card validation status, network brand detection (Visa/Mastercard), and emulates loading delays and card declines (for cards ending in `4444`).
* **Collapsible Order Histories & Timelines:** Order history dashboard on the user account profile page displaying a tracking timeline matching delivery status dynamically based on order age:
  * **Processing:** < 1 minute old
  * **Shipped / In Transit:** < 3 minutes old
  * **Delivered:** ≥ 3 minutes old
* **Newsletter Subscription Footer:** Sign up to receive the `WELCOME10` discount code.
* **Offline Alert Banner:** Warns users in real time with a floating banner card when internet connection is lost.

---

## 🛠️ Technology Stack

* **Core UI:** React 19, Vite, TypeScript, Tailwind CSS
* **Routing:** React Router v7
* **State Management:** Zustand (with local storage persistence middleware)
* **Server Caching:** TanStack React Query v5
* **HTTP Client:** Axios (with auth token request interceptors and token refresh error interceptors)
* **Validation:** Zod schemas
* **Testing:** Vitest & React Testing Library

---

## 🏃 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation
1. Clone the project and navigate to the project directory:
   ```bash
   cd demo
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm run dev
```

### Running Tests
Execute the unit test suites:
```bash
npx vitest run
```

### Building for Production
Compile static assets:
```bash
npm run build
```
The compiled files will reside inside the `dist/` directory, ready to be hosted on any static site provider.
