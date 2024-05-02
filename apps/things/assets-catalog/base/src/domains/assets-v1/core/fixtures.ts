import { randomBytes } from 'crypto';
import { AssetV1Entity, IAssetV1Dto } from './entity';

export const fakeAssetsV1: Array<IAssetV1Dto> = [
  new AssetV1Entity({
    id: randomBytes(12).toString('hex'),
    name: 'Fake Asset',
    taxonomicUnitSlug: 'fake-slug',
    tags: ['fake-slug'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).getDto(),
];

const assetById: Map<string, IAssetV1Dto> = new Map();
fakeAssetsV1.forEach((currentAsset) => {
  if (assetById.has(currentAsset.id)) {
    throw new Error(`Agent with id ${currentAsset.id} already exists`);
  }
  assetById.set(currentAsset.id, currentAsset);
});

export const fakeAssetsById = assetById;
