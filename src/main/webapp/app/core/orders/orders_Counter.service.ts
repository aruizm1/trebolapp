import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs';

import { CSRFService } from '../auth/csrf.service';
import { WindowRef } from './window.service';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';
import { OrderItem } from 'app/shared/model/order-item.model';
import { OrderItemService } from 'app/entities/order-item';

@Injectable({
    providedIn: 'root'
})
export class OrdersCounterService {
    stompClient = null;
    subscriber = null;
    subscriberReduce = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerReduce: Observable<any>;
    listenerObserverReduce: Observer<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;
    constructor(
        private router: Router,
        private $window: WindowRef,
        // tslint:disable-next-line: no-unused-variable
        private csrfService: CSRFService
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
        this.listenerReduce = this.createListenerReduce();
    }

    connect() {
        if (this.connectedPromise === null) {
            this.connection = this.createConnection();
        }
        // building absolute path so that websocket doesn't fail when deploying with a context path
        const loc = this.$window.nativeWindow.location;
        let url;
        url = '//' + loc.host + loc.pathname + 'websocket/orders';
        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);
        const headers = {};
        headers['X-XSRF-TOKEN'] = this.csrfService.getCSRF('XSRF-TOKEN');
        this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            this.connectedPromise = null;
            if (!this.alreadyConnectedOnce) {
                this.subscription = this.router.events.subscribe(event => {});
                this.alreadyConnectedOnce = true;
            }
        });
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.alreadyConnectedOnce = false;
    }

    receive() {
        return this.listener;
    }

    receiveReduce() {
        return this.listenerReduce;
    }

    subscribe() {
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe(
                '/topic/order_counter', // Este es para escuchar cualquier cambio
                data => {
                    this.listenerObserver.next(JSON.parse(data.body));
                }
            );
        });
    }

    subscribeReduceCounter() {
        this.connection.then(() => {
            this.subscriberReduce = this.stompClient.subscribe(
                '/topic/order_counter_reduce', // Este es para escuchar cualquier cambio
                data => {
                    this.listenerObserverReduce.next(JSON.parse(data.body));
                }
            );
        });
    }
    unsubscribe() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();

        if (this.subscriberReduce !== null) {
            this.subscriberReduce.unsubscribe();
        }
        this.listenerReduce = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }
    private createListenerReduce(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserverReduce = observer;
        });
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => (this.connectedPromise = resolve));
    }
}
