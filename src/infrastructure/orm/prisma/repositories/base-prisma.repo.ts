import { IBaseRepository } from "../../../../domain/repositories/base-repo";
import { BaseSpecification } from "../../../../domain/specifications/base-specification";
import { PrismaService } from "../../../orm/prisma/prisma.service";
// infrastructure/orm/prisma/repositories/base-prisma.repository.ts
export abstract class BasePrismaRepository<TEntity, TId, TPrismaModel> 
  implements IBaseRepository<TEntity, TId> {

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
    protected readonly mapper: {
      toDomain: (prismaEntity: TPrismaModel) => TEntity;
      toPrismaCreate: (domainEntity: TEntity) => any;
      toPrismaUpdate: (domainEntity: TEntity) => any;
    }
  ) {}

  async findMany(spec?: BaseSpecification<TEntity>): Promise<TEntity[]> {
    const query = this.buildPrismaQuery(spec);
    const prismaEntities = await this.prisma[this.modelName].findMany(query);
    return prismaEntities.map(this.mapper.toDomain);
  }

  async findOne(spec: BaseSpecification<TEntity>): Promise<TEntity | null> {
    const query = this.buildPrismaQuery(spec);
    const prismaEntity = await this.prisma[this.modelName].findFirst(query);
    return prismaEntity ? this.mapper.toDomain(prismaEntity) : null;
  }

  async count(spec?: BaseSpecification<TEntity>): Promise<number> {
    const where = this.buildWhereClause(spec);
    return this.prisma[this.modelName].count({ where });
  }

  private buildPrismaQuery(spec?: BaseSpecification<TEntity>) {
    if (!spec) return {};

    const query: any = {};

    // Build WHERE clause
    query.where = this.buildWhereClause(spec);

    // Build INCLUDE clause
    if (spec.includes.length > 0) {
      query.include = this.buildIncludeClause(spec.includes);
    }

    // Build ORDER BY clause
    if (spec.orderBy.length > 0) {
      query.orderBy = spec.orderBy.map(order => ({
        [order.field]: order.direction
      }));
    }

    // Build PAGINATION
    if (spec.pagination) {
      if (spec.pagination.skip !== undefined) {
        query.skip = spec.pagination.skip;
      }
      if (spec.pagination.take !== undefined) {
        query.take = spec.pagination.take;
      }
    }

    return query;
  }

  private buildWhereClause(spec?: BaseSpecification<TEntity>): any {
    if (!spec) return {};

    const where: any = {};

    // Apply criteria
    if (spec.criteria.length > 0) {
      // Convert multiple criteria to AND conditions
      Object.assign(where, ...spec.criteria);
    }

    // Apply search
    if (spec.search) {
      where.OR = spec.search.fields.map(field => ({
        [field]: {
          contains: spec.search!.term,
          mode: 'insensitive'
        }
      }));
    }

    return where;
  }

  async findById(id: TId, includes?: string[]): Promise<TEntity | null> {
    const query: any = { where: { id } };
    if (includes && includes.length > 0) {
      query.include = this.buildIncludeClause(includes);
    }
    const prismaEntity = await this.prisma[this.modelName].findUnique(query);
    return prismaEntity ? this.mapper.toDomain(prismaEntity) : null;
  }

  async exists(spec: BaseSpecification<TEntity>): Promise<boolean> {
    const count = await this.count(spec);
    return count > 0;
  }

  async create(entity: TEntity): Promise<TEntity> {
    const data = this.mapper.toPrismaCreate(entity);
    const created = await this.prisma[this.modelName].create({ data });
    return this.mapper.toDomain(created);
  }

  async update(entity: TEntity): Promise<TEntity> {
    const data = this.mapper.toPrismaUpdate(entity);
    const updated = await this.prisma[this.modelName].update({
      where: { id: (entity as any).id },
      data
    });
    return this.mapper.toDomain(updated);
  }

  async delete(id: TId): Promise<void> {
    await this.prisma[this.modelName].delete({ where: { id } });
  }

  async createMany(entities: TEntity[]): Promise<TEntity[]> {
    const data = entities.map(entity => this.mapper.toPrismaCreate(entity));
    await this.prisma[this.modelName].createMany({ data });
    // Note: Prisma createMany doesn't return created records, so we'd need to fetch them
    // This is a simplified implementation
    return entities;
  }

  async updateMany(entities: TEntity[]): Promise<TEntity[]> {
    const updated: TEntity[] = [];
    for (const entity of entities) {
      const result = await this.update(entity);
      updated.push(result);
    }
    return updated;
  }

  async deleteMany(ids: TId[]): Promise<void> {
    await this.prisma[this.modelName].deleteMany({ where: { id: { in: ids } } });
  }

  protected abstract buildIncludeClause(includes: string[]): any;
}