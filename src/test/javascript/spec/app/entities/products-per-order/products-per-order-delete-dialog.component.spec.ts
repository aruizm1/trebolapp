/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { TrebolTestModule } from '../../../test.module';
import { ProductsPerOrderDeleteDialogComponent } from 'app/entities/products-per-order/products-per-order-delete-dialog.component';
import { ProductsPerOrderService } from 'app/entities/products-per-order/products-per-order.service';

describe('Component Tests', () => {
    describe('ProductsPerOrder Management Delete Component', () => {
        let comp: ProductsPerOrderDeleteDialogComponent;
        let fixture: ComponentFixture<ProductsPerOrderDeleteDialogComponent>;
        let service: ProductsPerOrderService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [TrebolTestModule],
                declarations: [ProductsPerOrderDeleteDialogComponent]
            })
                .overrideTemplate(ProductsPerOrderDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(ProductsPerOrderDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ProductsPerOrderService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete', inject(
                [],
                fakeAsync(() => {
                    // GIVEN
                    spyOn(service, 'delete').and.returnValue(of({}));

                    // WHEN
                    comp.confirmDelete(123);
                    tick();

                    // THEN
                    expect(service.delete).toHaveBeenCalledWith(123);
                    expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                })
            ));
        });
    });
});
