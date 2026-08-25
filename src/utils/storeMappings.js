export const TI_PARTNER_CODES = new Set([
  414,318,432,447,431,421,348,345,337,306,319,382,417,
  445,339,356,441,440,439,428,427,426,423,422,419,415,413,404,367,364,360,
  353,352,343,338,333,327,317,316,302,326,323,434,436
])

export const C4_CODES = new Set([202,208,214,346,349,351,359,363,391])

export const BETA_CODES = new Set([2,9,28,209,214,224,227,302,333,404,427])

export function isBeta(codigo) {
  return BETA_CODES.has(Number(codigo))
}

export function hasTaxa(codigo) {
  const c = Number(codigo)
  return TI_PARTNER_CODES.has(c) || C4_CODES.has(c)
}

export function getFornecedor(codigo) {
  const c = Number(codigo)
  if (TI_PARTNER_CODES.has(c)) return 'TI Partner'
  if (C4_CODES.has(c)) return 'C4'
  return null
}
