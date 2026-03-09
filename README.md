# Cab Booking Application - Admin Panel

A modern, responsive, and feature-rich administrative dashboard for a cab booking platform, built with Angular 17+ and Firebase.

## 🚀 Technologies Used

- **Framework:** Angular 17.3
- **Backend & Database:** Firebase (Authentication, Firestore)
- **UI Components:** Angular Material
- **Styling:** Bootstrap 5, SCSS, custom CSS themes (Glassmorphism, Purple aesthetic)
- **Charts:** ApexCharts / ng-apexcharts
- **Icons:** Tabler Icons

## 📁 Project Structure

This application follows a strict modular architecture to ensure scalability and maintainability.

```text
src/app/
├── core/               # Singleton services, models, guards, interceptors, and app layout
│   ├── interceptors/   # HTTP interceptors
│   ├── layout/         # Core layout components (Header, Sidebar, Container)
│   ├── models/         # TypeScript interfaces (Driver, Vehicle, Booking, TableConfig, FormConfig)
│   └── services/       # Firebase, Auth, Notification, Utility, and Data Sharing services
├── features/           # Feature modules (Lazy loaded domains)
│   ├── auth/           # Login and Authentication handling
│   ├── dashboard/      # Overview metrics, charts, and key statistics
│   ├── drivers/        # Driver management (add, edit, list, leaves, bookings)
│   └── vehicles/       # Vehicle registration and listing
└── shared/             # Reusable UI components, pipes, and directives
    ├── components/     # Dynamic tables, dynamic forms, alerts, loaders, cards
    ├── directives/     # Custom Angular directives
    └── pipes/          # Custom data formatting pipes
```

## ✨ Key Features

- **Dynamic Form Engine:** Forms are generated dynamically via JSON configurations (e.g., driver registration, bookings), ensuring consistency across all data entry points.
- **Dynamic Summary Table Engine:** List views are powered by a highly configurable, JSON-driven table component supporting pagination, sorting, search, column transformations, and custom action buttons.
- **Driver Management:** Complete lifecycle management including registration, details listing, trip bookings, and leave applications.
- **Vehicle Management:** Registration and tracking of fleet vehicles.
- **Premium UI/UX:** Features a polished, modern aesthetic with smooth micro-animations, engaging dialogs, and a responsive layout.
- **Real-time Data:** Integration with Firebase/Firestore for live data updates.

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Update the Firebase configuration in your environment files (`src/environments/environment.ts` and `src/environments/environment.prod.ts`).

4. **Run the development server:**
   ```bash
   npm run start
   # or
   ng serve
   ```
   Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🛠️ Available Scripts

- `npm run start` - Starts the development server.
- `npm run build` - Builds the application into an output directory.
- `npm run build-prod` - Builds the application for production with specific base-href configurations.
- `npm run test` - Executes the unit tests via Karma.

## 📐 Architecture Patterns

- **Standalone Components:** The application relies heavily on Angular's standalone components for better tree-shaking and reduced boilerplate.
- **Signals:** State management and reactivity are optimized using Angular Signals where applicable.
- **RxJS Interop:** Leveraging `takeUntilDestroyed` within the `inject()` context for robust memory leak prevention.
- **Control Flow:** Utilizes Angular 17+ modern block syntax (`@if`, `@for`, `@switch`) in templates.