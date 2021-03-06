/* tslint:disable max-line-length */
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { take, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { OfferService } from 'app/entities/offer/offer.service';
import { IOffer, Offer } from 'app/shared/model/offer.model';

describe('Service Tests', () => {
    describe('Offer Service', () => {
        let injector: TestBed;
        let service: OfferService;
        let httpMock: HttpTestingController;
        let elemDefault: IOffer;
        let currentDate: moment.Moment;
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule]
            });
            injector = getTestBed();
            service = injector.get(OfferService);
            httpMock = injector.get(HttpTestingController);
            currentDate = moment();

            elemDefault = new Offer(0, 0, 'AAAAAAA', 0, new Date(), false);
        });

        describe('Service methods', async () => {
            it('should find an element', async () => {
                const returnedFromService = Object.assign(
                    {
                        expirationDate: currentDate.format(DATE_TIME_FORMAT)
                    },
                    elemDefault
                );
                service
                    .find(123)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: elemDefault }));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should create a Offer', async () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0,
                        expirationDate: currentDate.format(DATE_TIME_FORMAT)
                    },
                    elemDefault
                );
                const expected = Object.assign(
                    {
                        expirationDate: currentDate
                    },
                    returnedFromService
                );
                service
                    .create(new Offer(null))
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should update a Offer', async () => {
                const returnedFromService = Object.assign(
                    {
                        discount: 1,
                        description: 'BBBBBB',
                        type: 1,
                        expirationDate: currentDate.format(DATE_TIME_FORMAT),
                        disabled: true
                    },
                    elemDefault
                );

                const expected = Object.assign(
                    {
                        expirationDate: currentDate
                    },
                    returnedFromService
                );
                service
                    .update(expected)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'PUT' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should return a list of Offer', async () => {
                const returnedFromService = Object.assign(
                    {
                        discount: 1,
                        description: 'BBBBBB',
                        type: 1,
                        expirationDate: currentDate.format(DATE_TIME_FORMAT),
                        disabled: true
                    },
                    elemDefault
                );
                const expected = Object.assign(
                    {
                        expirationDate: currentDate
                    },
                    returnedFromService
                );
                service
                    .query(expected)
                    .pipe(
                        take(1),
                        map(resp => resp.body)
                    )
                    .subscribe(body => expect(body).toContainEqual(expected));
                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify([returnedFromService]));
                httpMock.verify();
            });

            it('should delete a Offer', async () => {
                const rxPromise = service.delete(123).subscribe(resp => expect(resp.ok));

                const req = httpMock.expectOne({ method: 'DELETE' });
                req.flush({ status: 200 });
            });
        });

        afterEach(() => {
            httpMock.verify();
        });
    });
});
