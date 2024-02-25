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
        loadComponent: () => import('./demo/default/default.component')
      },
      {
        path: 'driverBookings',
        loadComponent: () => import('./demo/elements/typography/typography.component')
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component')
      },
      {
        path: 'addDrivers',
        loadComponent: () => import('./demo/sample-page/sample-page.component')
      },
      {
        path: 'driverBookingList',
        loadComponent: () => import('./demo/elements/driver-booking-list/driver-booking-list.component')
      },
      {
        path: 'applyDriverLeave',
        loadComponent: () => import('./demo/apply-driver-leave/apply-driver-leave.component')
      },
      {
        path: 'listDriverLeave',
        loadComponent: () => import('./demo/list-driver-leave/list-driver-leave.component')
      },
      {
        path: 'addVehicle',
        loadComponent: () => import('./demo/vehicles/add-vehicle/add-vehicle.component')
      },
      {
        path: 'listVehicle',
        loadComponent: () => import('./demo/vehicles/list-vehicle/list-vehicle.component')
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
