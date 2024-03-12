import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

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
        loadComponent: () => import('./dashboard/dashboard.component')
      },
      {
        path: 'driverBookings',
        loadComponent: () => import('./pages/drivers/add-driver-booking/add-driver-booking.component')
      },
      // {
      //   path: 'color',
      //   loadComponent: () => import('./demo/elements/element-color/element-color.component')
      // },
      {
        path: 'addDrivers',
        loadComponent: () => import('./pages/drivers/add-driver-details/add-driver-details.component')
      },
      {
        path: 'driverBookingList',
        loadComponent: () => import('./pages/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'applyDriverLeave',
        loadComponent: () => import('./pages/drivers/apply-driver-leave/apply-driver-leave.component')
      },
      {
        path: 'listDriverLeave',
        loadComponent: () => import('./pages/drivers/list-driver-leave/list-driver-leave.component')
      },
      {
        path: 'listDriverDetails',
        loadComponent: () => import('./pages/drivers/list-driver-details/list-driver-details.component')
      },
      {
        path: 'editDriverDetails',
        loadComponent: () => import('./pages/drivers/edit-driver-details/edit-driver-details.component')
      },
      {
        path: 'listVehicle',
        loadComponent: () => import('./pages/vehicles/list-vehicle/list-vehicle.component')
      },
      {
        path: 'editVehicle',
        loadComponent: () => import('./pages/vehicles/add-vehicle/add-vehicle.component')
      },
      {
        path: 'addVehicle',
        loadComponent: () => import('./pages/vehicles/add-vehicle/add-vehicle.component')
      },
      {
        path: 'tripDetail/:type/:id',
        loadComponent: () => import('./pages/drivers/trips/trip-detail-view/trip-detail-view.component')
      },
      {
        path: 'runningTrip',
        loadComponent: () => import('./pages/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'upcomingTrip',
        loadComponent: () => import('./pages/drivers/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'closedTrip',
        loadComponent: () => import('./pages/drivers/driver-booking-list/driver-booking-list.component')
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
