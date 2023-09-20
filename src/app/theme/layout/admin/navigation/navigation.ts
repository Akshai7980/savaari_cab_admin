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
    title: 'Bookings',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'driverBookings',
        title: 'Add Driver Bookings',
        type: 'item',
        classes: 'nav-item',
        url: '/driverBookings',
        icon: 'ti ti-typography'
      },
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
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'addDrivers',
        title: 'Add Drivers',
        type: 'item',
        url: '/addDrivers',
        classes: 'nav-item',
        icon: 'ti ti-brand-chrome'
      }
    ]
  },
  {
    id: 'list',
    title: 'List',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'driverBookingList',
        title: 'Driver Booking List',
        type: 'item',
        classes: 'nav-item',
        url: '/driverBookingList',
        icon: 'ti ti-typography'
      }
    ]
  },
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
