import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

const NavigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'ti ti-dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'bookings',
    title: 'Driver',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'driverBookings',
        title: 'Add Booking',
        type: 'item',
        classes: 'nav-item',
        url: '/driverBookings',
        icon: 'ti ti-file',
        breadcrumbs: true
      },
      {
        id: 'addDrivers',
        title: 'Add Drivers Booking',
        type: 'item',
        url: '/addDrivers',
        classes: 'nav-item',
        icon: 'ti ti-user',
        breadcrumbs: true
      },
      {
        id: 'addTaxiBooking',
        title: 'Add Taxi Booking',
        type: 'item',
        url: '/addTaxiBooking',
        classes: 'nav-item',
        icon: 'ti ti-user',
        breadcrumbs: true
      },
      {
        id: 'applyDriverLeave',
        title: 'Apply Leave',
        type: 'item',
        classes: 'nav-item',
        url: '/applyDriverLeave',
        icon: 'ti ti-calendar',
        breadcrumbs: true
      },
      {
        id: 'listDriverLeave',
        title: 'List Leave',
        type: 'item',
        classes: 'nav-item',
        url: '/listDriverLeave',
        icon: 'ti ti-calendar',
        breadcrumbs: true
      },
      {
        id: 'listDriverDetails',
        title: 'List Driver',
        type: 'item',
        classes: 'nav-item',
        url: '/listDriverDetails',
        icon: 'ti ti-calendar',
        breadcrumbs: true
      }
      // {
      //   id: 'color',
      //   title: 'Colors',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/color',
      //   icon: 'ti ti-brush'
      // }
    ]
  },
  {
    id: 'trip',
    title: 'Trip',
    type: 'group',
    icon: 'icon-car',
    children: [
      {
        id: 'todayTrips',
        title: 'Today`s Trips',
        type: 'item',
        classes: 'nav-item',
        url: '/driverBookingList',
        icon: 'ti ti-plane-departure',
        breadcrumbs: true
      },
      {
        id: 'runningTrips',
        title: 'Running Trips',
        type: 'item',
        classes: 'nav-item',
        url: '/runningTrip',
        icon: 'ti ti-plane',
        breadcrumbs: true
      },
      {
        id: 'tomorrowTrips',
        title: 'Tomorrow`s Trips',
        type: 'item',
        classes: 'nav-item',
        url: '/upcomingTrip',
        icon: 'ti ti-plane-departure',
        breadcrumbs: true
      },
      {
        id: 'closedTrips',
        title: 'Closed Trips',
        type: 'item',
        classes: 'nav-item',
        url: '/closedTrip',
        icon: 'ti ti-plane-arrival',
        breadcrumbs: true
      },
      {
        id: 'cancelledTrips',
        title: 'Cancelled Trips',
        type: 'item',
        classes: 'nav-item',
        url: '/cancelledTrips',
        icon: 'ti ti-plane-arrival',
        breadcrumbs: true
      }
    ]
  },
  {
    id: 'vehicle',
    title: 'Vehicle',
    type: 'group',
    icon: 'icon-car',
    children: [
      {
        id: 'add-vehicle',
        title: 'Add Vehicle',
        type: 'item',
        classes: 'nav-item',
        url: '/addVehicle',
        icon: 'ti ti-car',
        breadcrumbs: true
      },
      {
        id: 'list-vehicle',
        title: 'List Vehicle',
        type: 'item',
        classes: 'nav-item',
        url: '/listVehicle',
        icon: 'ti ti-car',
        breadcrumbs: true
      },
      {
        id: 'list-customers',
        title: 'List Customers',
        type: 'item',
        classes: 'nav-item',
        url: '/listCustomers',
        icon: 'ti ti-car',
        breadcrumbs: true
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
