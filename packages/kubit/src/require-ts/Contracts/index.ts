/**
 * Custom transformers extracted from the package.json file
 */
export type Transformers = {
  before?: { transform: string }[];
  after?: { transform: string }[];
  afterDeclarations?: { transform: string }[];
};
