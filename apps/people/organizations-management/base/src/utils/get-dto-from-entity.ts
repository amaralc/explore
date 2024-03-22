export function getDtoFromEntity<IEntityDto, IEntity>(entity: IEntity) {
  const dto = {} as IEntityDto;
  for (const key of Object.keys(entity) as Array<keyof IEntityDto>) {
    if (!(this[key] instanceof Function)) {
      dto[key] = this[key];
    }
  }
  return dto;
}
