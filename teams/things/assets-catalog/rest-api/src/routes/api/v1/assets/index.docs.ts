import { PathItemObject } from 'openapi3-ts/oas30';
import { postAssetV1Schema } from './post.docs';

export const assetsV1ControllerSchema: PathItemObject = {
  description: 'Manage AssetsV1 resources',
  post: postAssetV1Schema,
};
