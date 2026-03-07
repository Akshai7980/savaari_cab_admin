import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationItemInterface } from '../../navigation';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent {
  @Input() item!: NavigationItemInterface;

  closeOtherMenu(event: MouseEvent): void {
    const ele = event.target as HTMLElement;
    if (ele) {
      const menu = ele.closest('.coded-inner-navbar');
      if (menu) {
        const triggers = menu.querySelectorAll('.coded-trigger');
        triggers.forEach(t => t.classList.remove('coded-trigger', 'active'));
      }

      const parent = ele.parentElement;
      if (parent) {
        parent.classList.add('active');
        const hasMenu = parent.closest('.coded-hasmenu');
        if (hasMenu) {
          hasMenu.classList.add('coded-trigger', 'active');
        }
      }
    }

    const navbar = document.querySelector('app-navigation.coded-navbar');
    if (navbar?.classList.contains('mob-open')) {
      navbar.classList.remove('mob-open');
    }
  }
}
