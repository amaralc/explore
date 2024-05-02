export class AssetAlreadyExistsError extends Error {
  constructor() {
    super('Asset already exists');
  }
}
