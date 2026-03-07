import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './core/layout/admin/admin.component';
import { GuestComponent } from './core/layout/guest/guest.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
      },
      {
        path: 'driverBookings',
        loadComponent: () => import('./features/drivers/add-driver-booking/add-driver-booking.component')
      },
      {
        path: 'addDrivers',
        loadComponent: () => import('./features/drivers/add-driver-details/add-driver-details.component')
      },
      {
        path: 'driverBookingList',
        loadComponent: () => import('./features/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'applyDriverLeave',
        loadComponent: () => import('./features/drivers/apply-driver-leave/apply-driver-leave.component')
      },
      {
        path: 'listDriverLeave',
        loadComponent: () => import('./features/drivers/list-driver-leave/list-driver-leave.component')
      },
      {
        path: 'listDriverDetails',
        loadComponent: () => import('./features/drivers/list-driver-details/list-driver-details.component')
      },
      {
        path: 'editDriverDetails',
        loadComponent: () => import('./features/drivers/edit-driver-details/edit-driver-details.component')
      },
      {
        path: 'listVehicle',
        loadComponent: () => import('./features/vehicles/list-vehicle/list-vehicle.component')
      },
      {
        path: 'editVehicle',
        loadComponent: () => import('./features/vehicles/add-vehicle/add-vehicle.component')
      },
      {
        path: 'addVehicle',
        loadComponent: () => import('./features/vehicles/add-vehicle/add-vehicle.component')
      },
      {
        path: 'tripDetail/:type/:id',
        loadComponent: () => import('./features/drivers/trips/trip-detail-view/trip-detail-view.component')
      },
      {
        path: 'runningTrip',
        loadComponent: () => import('./features/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'upcomingTrip',
        loadComponent: () => import('./features/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'closedTrip',
        loadComponent: () => import('./features/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'addTaxiBooking',
        loadComponent: () => import('./features/drivers/add-taxi-booking/add-taxi-booking.component')
      },
      {
        path: 'cancelledTrips',
        loadComponent: () => import('./features/drivers/list-cancelled-trip/list-cancelled-trip.component')
      },
      {
        path: 'listCustomers',
        loadComponent: () => import('./features/drivers/list-customers/list-customers.component')
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./features/auth/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
