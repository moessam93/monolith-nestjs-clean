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
  public criteria: any[] = [];
  public includes: (string | object)[] = [];
  public orderBy: OrderBy<T>[] = [];
  public pagination?: PaginationOptions;
  public search?: {
    fields: (keyof T)[];
    term: string;
  };

  constructor() {}

  // Basic where (existing)
  where(criteria: any): this {
    this.criteria.push(criteria);
    return this;
  }

  // GenericSpecifications-like fluent methods
  whereEqual(field: keyof T, value: any): this {
    return this.where({ [field]: value });
  }

  whereNotEqual(field: keyof T, value: any): this {
    return this.where({ [field]: { not: value } });
  }

  whereLessThan(field: keyof T, value: any): this {
    return this.where({ [field]: { lt: value } });
  }

  whereLessThanOrEqual(field: keyof T, value: any): this {
    return this.where({ [field]: { lte: value } });
  }

  whereGreaterThan(field: keyof T, value: any): this {
    return this.where({ [field]: { gt: value } });
  }

  whereGreaterThanOrEqual(field: keyof T, value: any): this {
    return this.where({ [field]: { gte: value } });
  }

  whereIn(field: keyof T, values: any[]): this {
    return this.where({ [field]: { in: values } });
  }

  whereNotIn(field: keyof T, values: any[]): this {
    return this.where({ [field]: { notIn: values } });
  }

  whereContains(field: keyof T, value: string): this {
    return this.where({ [field]: { contains: value, mode: 'insensitive' } });
  }

  whereStartsWith(field: keyof T, value: string): this {
    return this.where({ [field]: { startsWith: value, mode: 'insensitive' } });
  }

  whereEndsWith(field: keyof T, value: string): this {
    return this.where({ [field]: { endsWith: value, mode: 'insensitive' } });
  }

  whereExists(field: keyof T): this {
    return this.where({ [field]: { isSet: true } });
  }

  whereNotExists(field: keyof T): this {
    return this.where({ [field]: null });
  }

  // Date range helper
  whereDateRange(field: keyof T, startDate: Date, endDate: Date): this {
    return this.where({ 
      [field]: { 
        gte: startDate, 
        lte: endDate 
      } 
    });
  }

   // Enhanced include methods
   include(relations: (string | object)[]): this {
    this.includes.push(...relations);
    return this;
  }

  // Fluent API for nested includes
  includeNested(relationPath: string): this {
    this.includes.push(relationPath);
    return this;
  }

  // Object-based nested includes
  includeWith(includeObject: object): this {
    this.includes.push(includeObject);
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

  // Custom search for nested fields
  customSearch(searchConditions: any): this {
    this.criteria.push(searchConditions);
    return this;
  }
}