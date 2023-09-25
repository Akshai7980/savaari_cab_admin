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
        id: 'addDrivers',
        title: 'Add Drivers',
        type: 'item',
        url: '/addDrivers',
        classes: 'nav-item',
        icon: 'ti ti-user'
      },
      {
        id: 'driverBookings',
        title: 'Add Booking',
        type: 'item',
        classes: 'nav-item',
        url: '/driverBookings',
        icon: 'ti ti-file'
      },
      {
        id: 'todayTrips',
        title: 'Today`s Trips',
        type: 'item',
        classes: 'nav-item',
        url: '/driverBookingList',
        icon: 'ti ti-calendar'
      },
      // {
      //   id: 'tomorrowTrips',
      //   title: 'Tomorrow`s Trips',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/driverBookingList',
      //   icon: 'ti ti-calendar'
      // }
      // {
      //   id: 'color',
      //   title: 'Colors',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/color',
      //   icon: 'ti ti-brush'
      // }
    ]
  }
  // {
  //   id: 'other',
  //   title: 'Other',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'addDrivers',
  //       title: 'Add Drivers',
  //       type: 'item',
  //       url: '/addDrivers',
  //       classes: 'nav-item',
  //       icon: 'ti ti-brand-chrome'
  //     }
  //   ]
  // }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
