import { Component, OnInit } from '@angular/core';
import { DataService, Customer, Transaction } from '../data-service.service';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  styleUrls: ['./customer-table.component.scss'],
})
export class CustomerTableComponent implements OnInit {
  customers: Customer[] = [];
  transactions: Transaction[] = [];
  customerTransactions: { [customerId: number]: Transaction[] } = {};
  totalAmounts: { [key: number]: number } = {};
  filteredCustomers: Customer[] = [];
  customerNameFilter = '';
  filterAmount: number | null = null;

  selectedCustomerId: number | null = null;
  chart: Chart = new Chart({
    chart: {
      type: 'line',
    },
    title: {
      text: 'Select a Customer to View Transactions',
    },
    credits: {
      enabled: false,
    },
    series: [],
  });

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadTransactions();
  }

  loadCustomers(): void {
    this.dataService.getCustomers().subscribe((customers) => {
      this.customers = customers;
      this.applyFilters(); // Apply initial filters
    });
  }

  loadTransactions(): void {
    this.dataService.getTransactions().subscribe((transactions) => {
      this.transactions = transactions;
      this.groupTransactionsByCustomer();
      this.calculateTotalAmounts();
      this.applyFilters(); // Reapply filters after loading transactions
    });
  }

  groupTransactionsByCustomer(): void {
    this.customerTransactions = {};
    this.transactions.forEach((transaction) => {
      if (!this.customerTransactions[transaction.customer_id]) {
        this.customerTransactions[transaction.customer_id] = [];
      }
      this.customerTransactions[transaction.customer_id].push(transaction);
    });
  }

  calculateTotalAmounts(): void {
    this.totalAmounts = {};
    Object.keys(this.customerTransactions).forEach((customerId) => {
      const transactions = this.customerTransactions[parseInt(customerId, 10)];
      this.totalAmounts[parseInt(customerId, 10)] = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter((customer) =>
      customer.name
        .toLowerCase()
        .includes(this.customerNameFilter.toLowerCase())
    );

    if (this.filterAmount !== null) {
      this.filteredCustomers = this.filteredCustomers.filter((customer) =>
        this.customerTransactions[customer.id]?.some(
          (transaction) => transaction.amount === this.filterAmount
        )
      );
    }
  }

  select(customerId: number): void {
    this.selectedCustomerId = customerId;
    this.updateChart();
  }

  aggregateTransactionsByDate(
    transactions: Transaction[]
  ): { date: string; total: number }[] {
    const dateMap: { [date: string]: number } = {};

    transactions.forEach((transaction) => {
      const date = transaction.date;
      if (!dateMap[date]) {
        dateMap[date] = 0;
      }
      dateMap[date] += transaction.amount;
    });

    return Object.keys(dateMap).map((date) => ({
      date,
      total: dateMap[date],
    }));
  }

  updateChart(): void {
    if (this.selectedCustomerId !== null) {
      const transactions = this.customerTransactions[this.selectedCustomerId];
      const aggregatedData = this.aggregateTransactionsByDate(transactions);
      const dates = aggregatedData.map((data) => data.date);
      const totals = aggregatedData.map((data) => data.total);

      this.chart = new Chart({
        chart: {
          type: 'line',
        },
        title: {
          text: `Customer ${this.selectedCustomerId} Transactions`,
        },
        credits: {
          enabled: false,
        },
        xAxis: {
          categories: dates,
          title: {
            text: 'Date',
          },
        },
        yAxis: {
          title: {
            text: 'Total Amount',
          },
        },
        series: [
          {
            name: 'Total Transaction Amount',
            type: 'line',
            data: totals,
          } as any,
        ],
      });
    }
  }
}
