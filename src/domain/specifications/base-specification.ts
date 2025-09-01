// domain/specifications/base-specification.ts
export interface OrderBy<T> {
    field: keyof T;
    direction: 'asc' | 'desc';
  }
  
  export interface PaginationOptions {
    skip?: number;
    take?: number;
    page?: number;
    limit?: number;
  }
  
  export class BaseSpecification<T> {
    public criteria: Partial<T>[] = [];
    public includes: string[] = [];
    public orderBy: OrderBy<T>[] = [];
    public pagination?: PaginationOptions;
    public search?: {
      fields: (keyof T)[];
      term: string;
    };
  
    constructor() {}
  
    // Fluent API for building specifications
    where(criteria: Partial<T>): this {
      this.criteria.push(criteria);
      return this;
    }
  
    include(relations: string[]): this {
      this.includes.push(...relations);
      return this;
    }
  
    orderByField(field: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
      this.orderBy.push({ field, direction });
      return this;
    }
  
    paginate(options: PaginationOptions): this {
      this.pagination = options;
      return this;
    }
  
    searchIn(fields: (keyof T)[], term: string): this {
      this.search = { fields, term };
      return this;
    }
  }