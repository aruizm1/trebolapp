import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import Swal from 'sweetalert2';
import { IProduct } from 'app/shared/model/product.model';
import { AccountService } from 'app/core';
import { ProductService } from './product.service';

@Component({
    selector: 'jhi-product',
    templateUrl: './product.component.html'
})
export class ProductComponent implements OnInit, OnDestroy {
    products: IProduct[];
    currentAccount: any;
    eventSubscriber: Subscription;
    _filterQuery = '';
    filteredProducts: IProduct[];

    private swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success ml-3',
            cancelButton: 'btn btn-danger ml-3'
        },
        buttonsStyling: false
    });

    constructor(
        protected productService: ProductService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.productService
            .query()
            .pipe(
                filter((res: HttpResponse<IProduct[]>) => res.ok),
                map((res: HttpResponse<IProduct[]>) => res.body)
            )
            .subscribe(
                (res: IProduct[]) => {
                    this.products = res;
                    this.filteredProducts = res;
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInProducts();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IProduct) {
        return item.id;
    }

    registerChangeInProducts() {
        this.eventSubscriber = this.eventManager.subscribe('productListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    deleteItem(product: IProduct) {
        this.swalWithBootstrapButtons
            .fire({
                title: 'Está seguro que desea deshabilitar el producto?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, deshabilitar!',
                cancelButtonText: 'No, cancelar!',
                reverseButtons: true
            })
            .then(result => {
                if (result.value) {
                    this.confirmDelete(product);
                }
            });
    }

    confirmDelete(product: IProduct) {
        product.disabled = true;
        this.productService.update(product).subscribe(response => {
            this.eventManager.broadcast({
                name: 'productListModification',
                content: 'Deleted an product'
            });
            this.swalWithBootstrapButtons.fire('Deshabilitado!', 'El producto ha sido deshabilitado.', 'success');
        });
    }

    enableItem(product: IProduct) {
        this.swalWithBootstrapButtons
            .fire({
                title: 'Está seguro que desea habilitar el producto?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, habilitar!',
                cancelButtonText: 'No, cancelar!',
                reverseButtons: true
            })
            .then(result => {
                if (result.value) {
                    this.confirmEnable(product);
                }
            });
    }
    confirmEnable(product: IProduct) {
        product.disabled = false;
        this.productService.update(product).subscribe(response => {
            this.eventManager.broadcast({
                name: 'productListModification',
                content: 'Deleted an offer'
            });
            this.swalWithBootstrapButtons.fire('Habilitado!', 'El producto ha sido habilitado.', 'success');
        });
    }

    get filterQuery(): string {
        return this._filterQuery;
    }

    set filterQuery(value: string) {
        this._filterQuery = value;
        this.filteredProducts = this.filterQuery ? this.doFilter(this.filterQuery) : this.products;
    }

    doFilter(filterBy: string): IProduct[] {
        filterBy = filterBy.toLocaleLowerCase();
        return this.products.filter((subCategory: IProduct) => subCategory.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
    }
}
