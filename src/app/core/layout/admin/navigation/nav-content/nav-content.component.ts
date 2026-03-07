import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationItem, NavigationItemInterface } from '../navigation';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';

@Component({
  selector: 'app-nav-content',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, NavItemComponent, NavCollapseComponent, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  @Output() NavCollapsedMob = new EventEmitter();

  navigation: NavigationItemInterface[];
  windowWidth: number;

  constructor(
    public nav: NavigationItem,
    private readonly location: Location,
    private readonly locationStrategy: LocationStrategy
  ) {
    this.navigation = this.nav.get();
    this.windowWidth = window.innerWidth;
  }

  ngOnInit(): void {
    if (this.windowWidth < 1025) {
      const el = document.querySelector('.coded-navbar') as HTMLElement;
      if (el) {
        el.classList.add('menuposition-static');
      }
    }
  }

  navMob(): void {
    if (this.windowWidth < 1025) {
      const nav = document.querySelector('app-navigation.coded-navbar');
      if (nav && nav.classList.contains('mob-open')) {
        this.NavCollapsedMob.emit();
      }
    }
  }

  fireOutClick(): void {
    let currentUrl = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      currentUrl = baseHref + this.location.path();
    }
    const link = `a.nav-link[ href="${currentUrl}" ]`;
    const upEle = document.querySelector(link);
    if (upEle?.parentElement) {
      const menu = upEle.closest('.coded-inner-navbar');
      if (menu) {
        const activeItem = menu.querySelector('li.active');
        if (activeItem) {
          activeItem.classList.remove('active');
        }
        upEle.parentElement.classList.add('active');
      }
    }

    if (this.windowWidth < 1025) {
      const nav = document.querySelector('app-navigation.coded-navbar');
      if (nav && nav.classList.contains('mob-open')) {
        this.NavCollapsedMob.emit();
      }
    }
  }
}
