import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import { LayoutService } from '../../core/services/layout.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    currentUser$;
    activeDocumentId$;

    isMobileMenuOpen = false;
    isUserMenuOpen = false;

    constructor(
        private authService: AuthService,
        private layoutService: LayoutService
    ) {
        this.currentUser$ = this.authService.currentUser$;
        this.activeDocumentId$ = this.layoutService.activeDocumentId$;
    }

    logout() {
        this.authService.logout();
        this.closeMenus();
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        if (this.isMobileMenuOpen) this.isUserMenuOpen = false;
    }

    toggleUserMenu() {
        this.isUserMenuOpen = !this.isUserMenuOpen;
        if (this.isUserMenuOpen) this.isMobileMenuOpen = false;
    }

    closeMenus() {
        this.isMobileMenuOpen = false;
        this.isUserMenuOpen = false;
    }
}
