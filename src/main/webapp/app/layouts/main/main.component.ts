import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd, NavigationError } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { AccountService } from 'app/core';
import { Register } from 'app/account/register/register.service';
import { LoadingService } from 'app/loading/loading.service';
import { MainService } from './main.service';

@Component({
    selector: 'jhi-main',
    templateUrl: './main.component.html'
})
export class JhiMainComponent implements OnInit {
    constructor(
        private titleService: Title,
        private router: Router,
        public accountService: AccountService,
        public registerService: Register,
        public loadingService: LoadingService,
        public mainService: MainService
    ) {}

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = routeSnapshot.data && routeSnapshot.data['pageTitle'] ? routeSnapshot.data['pageTitle'] : 'trebolApp';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
            }
            if (event instanceof NavigationError && event.error.status === 404) {
                this.router.navigate(['/404']);
            }
        });
        this.accountService.refreshUser();
        this.loadingService.stopLoading();
    }
}
