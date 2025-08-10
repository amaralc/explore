export function getDtoFromEntity<IEntityDto>(entity: unknown) {
  const dto = {} as Record<string, unknown>;

  // @ts-ignore
  for (const key of Object.keys(entity)) {
    if (!(entity[key] instanceof Function)) {
      dto[key] = entity[key];
    }
  }

  const entityDto = dto as IEntityDto;
  return entityDto;
}
