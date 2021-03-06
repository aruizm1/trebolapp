import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IDeliveryMap } from 'app/shared/model/delivery-map.model';

type EntityResponseType = HttpResponse<IDeliveryMap>;
type EntityArrayResponseType = HttpResponse<IDeliveryMap[]>;

@Injectable({ providedIn: 'root' })
export class DeliveryMapService {
    // Este estado permitira saber al componente padre si la entrega ya finalizo o esta en proceso
    state = 0;
    LantLng: google.maps.LatLng[];
    isInitDelivery = false;
    @Output() stateEmitter: EventEmitter<number> = new EventEmitter();
    @Output() changeCoordinates: EventEmitter<google.maps.LatLng[]> = new EventEmitter();
    @Output() initDeliveryEmitter: EventEmitter<boolean> = new EventEmitter();
    public resourceUrl = SERVER_API_URL + 'api/delivery-maps';

    constructor(protected http: HttpClient) {}

    enterCoordinates(pLantLng: google.maps.LatLng[]) {
        this.changeState();
        this.LantLng = pLantLng;
        this.changeCoordinates.emit(this.LantLng);
    }

    initDelivery() {
        this.isInitDelivery = true;
        this.state = this.state + 1;
        this.initDeliveryEmitter.emit(this.isInitDelivery);
    }

    changeState() {
        if (this.state === 2) {
            this.state = 0;
        }
        this.stateEmitter.emit(this.state);
    }

    create(deliveryMap: IDeliveryMap): Observable<EntityResponseType> {
        return this.http.post<IDeliveryMap>(this.resourceUrl, deliveryMap, { observe: 'response' });
    }

    update(deliveryMap: IDeliveryMap): Observable<EntityResponseType> {
        return this.http.put<IDeliveryMap>(this.resourceUrl, deliveryMap, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IDeliveryMap>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IDeliveryMap[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}
