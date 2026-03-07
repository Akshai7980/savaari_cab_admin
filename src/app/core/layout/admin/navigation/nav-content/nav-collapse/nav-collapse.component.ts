import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationItemInterface } from '../../navigation';
import { animate, style, transition, trigger } from '@angular/animations';
import { SharedModule } from 'src/app/shared/shared.module';

import { NavItemComponent } from '../nav-item/nav-item.component';
import { NavGroupComponent } from '../nav-group/nav-group.component';

@Component({
  selector: 'app-nav-collapse',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, NavItemComponent, NavGroupComponent, forwardRef(() => NavCollapseComponent)],
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', display: 'block' }),
        animate('250ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(-100%)' }))])
    ])
  ]
})
export class NavCollapseComponent {
  @Input() item!: NavigationItemInterface;

  windowWidth = window.innerWidth;

  navCollapse(e: MouseEvent): void {
    const parent = (e.target as HTMLElement).parentElement;
    if (!parent) return;

    const menu = parent.closest('.coded-inner-navbar');
    if (menu) {
      const allMenus = menu.querySelectorAll('.coded-hasmenu');
      allMenus.forEach((m) => {
        if (m !== parent) {
          m.classList.remove('coded-trigger');
        }
      });
    }

    let current: HTMLElement | null = parent;
    while (current && current.classList.contains('coded-hasmenu')) {
      current.classList.add('coded-trigger');
      const grandParent = current.parentElement?.parentElement;
      current = grandParent && grandParent.classList.contains('coded-hasmenu') ? grandParent : null;
    }

    parent.classList.toggle('coded-trigger');
  }
}
