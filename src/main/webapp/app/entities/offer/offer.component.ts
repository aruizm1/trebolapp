import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IOffer } from 'app/shared/model/offer.model';
import { AccountService } from 'app/core';
import { OfferService } from './offer.service';
import Swal from 'sweetalert2';
@Component({
    selector: 'jhi-offer',
    templateUrl: './offer.component.html'
})
export class OfferComponent implements OnInit, OnDestroy {
    offers: IOffer[];
    currentAccount: any;
    eventSubscriber: Subscription;
    _filterQuery = '';
    filteredOffers: IOffer[];
    private swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success ml-3',
            cancelButton: 'btn btn-danger ml-3'
        },
        buttonsStyling: false
    });
    constructor(
        protected offerService: OfferService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.offerService
            .query()
            .pipe(
                filter((res: HttpResponse<IOffer[]>) => res.ok),
                map((res: HttpResponse<IOffer[]>) => res.body)
            )
            .subscribe(
                (res: IOffer[]) => {
                    this.offers = res;
                    this.filteredOffers = res;
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInOffers();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IOffer) {
        return item.id;
    }

    registerChangeInOffers() {
        this.eventSubscriber = this.eventManager.subscribe('offerListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    get filterQuery(): string {
        return this._filterQuery;
    }

    set filterQuery(value: string) {
        this._filterQuery = value;
        this.filteredOffers = this.filterQuery ? this.doFilter(this.filterQuery) : this.offers;
    }

    doFilter(filterBy: string): IOffer[] {
        filterBy = filterBy.toLocaleLowerCase();
        return this.offers.filter((offer: IOffer) => offer.description.toLocaleLowerCase().indexOf(filterBy) !== -1);
    }

    deleteItem(id: number) {
        this.swalWithBootstrapButtons
            .fire({
                title: 'Está seguro que desea eliminar la oferta?',
                text: 'Si continúa, no podrá revertir el cambio',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, eliminar!',
                cancelButtonText: 'No, cancelar!',
                reverseButtons: true
            })
            .then(result => {
                if (result.value) {
                    this.confirmDelete(id);
                }
            });
    }
    confirmDelete(id: number) {
        this.offerService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'offerListModification',
                content: 'Deleted an offer'
            });
            this.swalWithBootstrapButtons.fire('Eliminada!', 'La oferta ha sido eliminada.', 'success');
        });
    }
}
