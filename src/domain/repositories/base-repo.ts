import { BaseSpecification } from "../specifications/base-specification";

// domain/repositories/base-repository.ts
export interface IBaseRepository<TEntity, TId> {
    // Specification-based queries
    findMany(spec?: BaseSpecification<TEntity>): Promise<TEntity[]>;
    findOne(spec: BaseSpecification<TEntity>): Promise<TEntity | null>;
    
    // Count and exists
    count(spec?: BaseSpecification<TEntity>): Promise<number>;
    exists(spec: BaseSpecification<TEntity>): Promise<boolean>;
    
    // CRUD operations
    create(entity: TEntity): Promise<TEntity>;
    update(entity: TEntity): Promise<TEntity>;
    delete(id: TId): Promise<void>;
    
    // Batch operations
    createMany(entities: TEntity[]): Promise<TEntity[]>;
    updateMany(entities: TEntity[]): Promise<TEntity[]>;
    deleteMany(ids: TId[]): Promise<void>;
    
    // List with pagination and filtering
    list(spec?: BaseSpecification<TEntity>): Promise<{ data: TEntity[]; total: number; totalFiltered: number }>;
  }