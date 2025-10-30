/**
 * Mock Supabase Client for Testing
 *
 * This mock simulates Supabase database operations for unit tests.
 * It provides chainable methods matching the Supabase API.
 */

export interface MockSupabaseResponse<T = any> {
  data: T | T[] | null;
  error: Error | null;
  count?: number | null;
}

export class MockSupabaseQueryBuilder<T = any> {
  private mockData: T | T[] | null = null;
  private mockError: Error | null = null;
  private mockCount: number | null = null;
  private filterConditions: Array<{ column: string; operator: string; value: any }> = [];
  private pendingOperation: { type: 'insert' | 'update' | 'delete'; data?: any } | null = null;

  constructor(
    private tableName: string,
    private mockDatabase: Map<string, any[]>
  ) {}

  // SELECT operations
  select(_columns = '*'): this {
    return this;
  }

  // FILTERING
  eq(column: string, value: any): this {
    this.filterConditions.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any): this {
    this.filterConditions.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any): this {
    this.filterConditions.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any): this {
    this.filterConditions.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any): this {
    this.filterConditions.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any): this {
    this.filterConditions.push({ column, operator: 'lte', value });
    return this;
  }

  // ORDERING
  order(_column: string, _options?: { ascending?: boolean }): this {
    return this;
  }

  // PAGINATION
  range(from: number, to: number): this {
    const tableData = this.mockDatabase.get(this.tableName) || [];
    const filtered = this.applyFilters(tableData);
    this.mockData = filtered.slice(from, to + 1) as any;
    this.mockCount = filtered.length;
    return this;
  }

  // COUNT
  count(_options?: { count: 'exact' | 'planned' | 'estimated' }): this {
    return this;
  }

  // SINGLE RECORD
  single(): this {
    // If mockData is already set (e.g., from insert/update), keep it as single
    if (this.mockData !== null) {
      // If it's an array, take the first element
      if (Array.isArray(this.mockData)) {
        this.mockData = this.mockData[0] || null;
      }
      // Already a single record, keep as is
      return this;
    }

    const tableData = this.mockDatabase.get(this.tableName) || [];
    const filtered = this.applyFilters(tableData);
    this.mockData = filtered[0] || null;
    if (filtered.length === 0) {
      this.mockError = new Error('No rows found');
    }
    return this;
  }

  // MAYBE SINGLE
  maybeSingle(): this {
    const tableData = this.mockDatabase.get(this.tableName) || [];
    const filtered = this.applyFilters(tableData);
    this.mockData = filtered[0] || null;
    return this;
  }

  // INSERT
  insert(data: Partial<T> | Partial<T>[]): this {
    // Mark the insert operation as pending, don't execute yet
    this.pendingOperation = { type: 'insert', data };
    return this;
  }

  // UPDATE
  update(data: Partial<T>): this {
    // Mark the update operation as pending, don't execute yet
    this.pendingOperation = { type: 'update', data };
    return this;
  }

  // DELETE
  delete(): this {
    // Mark the delete operation as pending, don't execute yet
    this.pendingOperation = { type: 'delete' };
    return this;
  }

  // Apply filters to data
  private applyFilters(data: any[]): any[] {
    return data.filter(record => {
      return this.filterConditions.every(({ column, operator, value }) => {
        const recordValue = record[column];
        switch (operator) {
          case 'eq':
            return recordValue === value;
          case 'neq':
            return recordValue !== value;
          case 'gt':
            return recordValue > value;
          case 'gte':
            return recordValue >= value;
          case 'lt':
            return recordValue < value;
          case 'lte':
            return recordValue <= value;
          default:
            return true;
        }
      });
    });
  }

  // Execute query (terminal operation) - Make it thenable/awaitable
  then<TResult1 = MockSupabaseResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: MockSupabaseResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    // CRITICAL: Execute any pending operation NOW (after all filters have been added)
    if (this.pendingOperation) {
      this.executePendingOperation();
    }

    // If mockData hasn't been set yet, populate it from the database
    if (this.mockData === null) {
      const tableData = this.mockDatabase.get(this.tableName) || [];
      if (this.filterConditions.length > 0) {
        const filtered = this.applyFilters(tableData);
        this.mockData = filtered as any;
        this.mockCount = filtered.length;
      } else {
        // No filters, return all data
        this.mockData = tableData as any;
        this.mockCount = tableData.length;
      }
    }

    const response: MockSupabaseResponse<T> = {
      data: this.mockData,
      error: this.mockError,
      count: this.mockCount,
    };

    return Promise.resolve(response).then(onfulfilled, onrejected);
  }

  // Execute the pending operation after all filters have been added
  private executePendingOperation(): void {
    if (!this.pendingOperation) return;

    const { type, data } = this.pendingOperation;

    if (type === 'insert') {
      const tableData = this.mockDatabase.get(this.tableName) || [];
      const records = Array.isArray(data) ? data : [data];

      const newRecords = records.map((record, index) => ({
        id: tableData.length + index + 1,
        ...record,
        created_at: new Date().toISOString(),
      }));

      tableData.push(...newRecords);
      this.mockDatabase.set(this.tableName, tableData);
      this.mockData = (Array.isArray(data) ? newRecords : newRecords[0]) as T;
    }

    if (type === 'update') {
      const tableData = this.mockDatabase.get(this.tableName) || [];
      const filtered = this.applyFilters(tableData);

      if (filtered.length === 0) {
        this.mockError = new Error('No rows found to update');
        this.mockData = null;
        return;
      }

      const updated = filtered.map(record => ({ ...record, ...data }));

      const allData = this.mockDatabase.get(this.tableName) || [];
      updated.forEach(updatedRecord => {
        const index = allData.findIndex((r: any) => r.id === (updatedRecord as any).id);
        if (index !== -1) {
          allData[index] = updatedRecord;
        }
      });
      this.mockDatabase.set(this.tableName, allData);
      this.mockData = (updated.length === 1 ? updated[0] : updated) as T;
    }

    if (type === 'delete') {
      const tableData = this.mockDatabase.get(this.tableName) || [];
      const filtered = this.applyFilters(tableData);

      if (filtered.length === 0) {
        this.mockError = new Error('No rows found to delete');
        this.mockData = null;
        return;
      }

      const allData = this.mockDatabase.get(this.tableName) || [];
      const idsToDelete = new Set(filtered.map((r: any) => r.id));
      const remaining = allData.filter((r: any) => !idsToDelete.has(r.id));
      this.mockDatabase.set(this.tableName, remaining);
      this.mockData = null;
    }

    this.pendingOperation = null;
  }
}

export class MockSupabaseClient {
  private mockDatabase: Map<string, any[]> = new Map();

  constructor(initialData?: Record<string, any[]>) {
    if (initialData) {
      Object.entries(initialData).forEach(([table, data]) => {
        // Deep clone the data to avoid shared state between tests
        this.mockDatabase.set(table, JSON.parse(JSON.stringify(data)));
      });
    }
  }

  from<T = any>(table: string): MockSupabaseQueryBuilder<T> {
    return new MockSupabaseQueryBuilder<T>(table, this.mockDatabase);
  }

  // Helper methods for test setup
  setMockData(table: string, data: any[]): void {
    this.mockDatabase.set(table, data);
  }

  getMockData(table: string): any[] {
    return this.mockDatabase.get(table) || [];
  }

  clearMockData(): void {
    this.mockDatabase.clear();
  }
}

// Factory function for creating mock Supabase clients
export function createMockSupabaseClient(initialData?: Record<string, any[]>): MockSupabaseClient {
  return new MockSupabaseClient(initialData);
}

// Mock module for @supabase/supabase-js
export const mockCreateClient = jest.fn(() => createMockSupabaseClient());
