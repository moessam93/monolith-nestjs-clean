export class BaseMapper {
  /**
   * Generic toPrisma for simple 1:1 property mapping
   * Use this for entities with straightforward property mapping
   */
  static genericToPrisma<TDomain>(
    entity: TDomain, 
    excludeFields: string[] = []
  ): any {
    const result: any = {};
    
    // Copy all enumerable properties from the entity
    for (const [key, value] of Object.entries(entity as any)) {
      if (!excludeFields.includes(key)) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Enhanced toPrisma with field processors for complex mapping
   * Use this when you need to process some fields before Prisma conversion
   */
  static genericToPrismaWithProcessors<TDomain>(
    entity: TDomain,
    excludeFields: string[] = [],
    fieldProcessors: Record<string, (value: any, entity: TDomain) => any> = {}
  ): any {
    const result: any = {};
    
    // Copy and process all enumerable properties from the entity
    for (const [key, value] of Object.entries(entity as any)) {
      if (!excludeFields.includes(key)) {
        const processor = fieldProcessors[key];
        result[key] = processor ? processor(value, entity) : value;
      }
    }
    
    return result;
  }

  /**
   * Generic toDomain for simple constructor-based entities
   * Use this for entities with straightforward constructor calls
   */
  static genericToDomain<TDomain>(
    EntityClass: new (...args: any[]) => TDomain,
    prismaEntity: any,
    fieldOrder: string[]
  ): TDomain {
    const args = fieldOrder.map(field => prismaEntity[field]);
    return new EntityClass(...args);
  }

  /**
   * Enhanced toDomain with field processors for complex mapping
   * Use this when you need to process some fields before constructor call
   */
  static genericToDomainWithProcessors<TDomain>(
    EntityClass: new (...args: any[]) => TDomain,
    prismaEntity: any,
    fieldOrder: string[],
    fieldProcessors: Record<string, (value: any, prismaEntity: any) => any> = {}
  ): TDomain {
    const args = fieldOrder.map(field => {
      const value = prismaEntity[field];
      const processor = fieldProcessors[field];
      return processor ? processor(value, prismaEntity) : value;
    });
    return new EntityClass(...args);
  }

  /**
   * Common logic for preparing entity data for creation
   * Removes id if it's falsy and handles entity-specific validation
   */
  static baseToPrismaCreate<TDomain, TPrisma>(
    entity: TDomain,
    toPrismaFn: (entity: TDomain) => TPrisma,
    validateFn?: (data: TPrisma) => void
  ): TPrisma {
    const data = toPrismaFn(entity);
    
    // Remove id for creation if it's falsy (0, undefined, null, empty string)
    if (!(data as any).id) {
      delete (data as any).id;
    }
    
    // Run entity-specific validation if provided
    if (validateFn) {
      validateFn(data);
    }
    
    return data;
  }

  /**
   * Common logic for preparing entity data for update
   * Removes id, createdAt, and updatedAt timestamps
   */
  static baseToPrismaUpdate<TDomain, TPrisma>(
    entity: TDomain,
    toPrismaFn: (entity: TDomain) => TPrisma
  ): TPrisma {
    const data = toPrismaFn(entity);
    
    // Remove fields that shouldn't be updated
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    
    return data;
  }
}
