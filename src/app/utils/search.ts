import { Prisma } from "@prisma/client";

type SearchableFields = string[];

export const buildSearchFilter = (
  searchableFields: SearchableFields,
  searchTerm: string
): any => {
  const searchConditions = searchableFields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: "insensitive",
    },
  }));

  return {
    OR: searchConditions,
  };
};
