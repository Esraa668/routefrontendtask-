import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
}

export interface Transaction {
  transactions: any;
  id: number;
  customer_id: number;
  date: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  apiUrl = `https://route-smoky.vercel.app`;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`);
  }

  getTransactions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions`);
  }

  getTransactionsByCustomerId(customerId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions?customer_id=${customerId}`
    );
  }
}
