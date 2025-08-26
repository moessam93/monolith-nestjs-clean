export class PaginationMetaDto {
  page: number;
  limit: number;
  totalItems: number;
  totalFiltered: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  constructor(page: number, limit: number, totalItems: number, totalFiltered: number) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalFiltered = totalFiltered;
    this.totalPages = Math.ceil(totalFiltered / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}
