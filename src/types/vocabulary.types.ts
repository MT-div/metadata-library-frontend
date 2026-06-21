// src/types/schema.types.ts
export interface VocabularyResponse {
  id: number;
  prefix: string;
  namespaceUri: string;
  label: string;
}

export interface CreateVocabularyCommand {
  prefix: string;
  namespaceUri: string;
  label: string;
}
