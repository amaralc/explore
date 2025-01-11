export class DuplicatedTaxonomicUnitV1NameError extends Error { }

export class DuplicatedTaxonomicUnitIdError extends Error { }

export class UniqueTaxonomicUnitV1NameAndVersionError extends Error { }

export class TaxonomicUnitV1NotFoundError extends Error { }

export class ParentTaxonomicUnitNotFoundError extends Error { }

export class InvalidTaxonomicUnitV1InputDtoError extends Error { }

export class MetadataDoesNotMatchMetadataSchemaError extends Error { }

export class ChildMetadataSchemaIsNotBackwardsCompatibleWithParentMetadataSchemaError extends Error { }
