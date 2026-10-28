/** A field is one value a theme control sets, keyed by its path in the recipe or document. */
export type FieldValue = string | number | boolean | undefined
export type Fields = { readonly [field: string]: FieldValue }
export interface Changes<F extends Fields> {
  fields: F
  baseline: F
}
export interface EditorChanges<F extends Fields> {
  /** Null when only one side has a recipe, so no single value can be compared or restored. */
  changes: Changes<F> | null
  count: number
}
export function changedFields<F extends Fields>({ fields, baseline }: Changes<F>): string[] {
  return [...new Set([...Object.keys(fields), ...Object.keys(baseline)])].filter(
    field => fields[field] !== baseline[field]
  )
}
export function compareFields<F extends Fields>(
  fields: F | null,
  baseline: F | null
): EditorChanges<F> {
  if (fields === null || baseline === null)
    return { changes: null, count: Number((fields === null) !== (baseline === null)) }
  const changes = { fields, baseline }
  return { changes, count: changedFields(changes).length }
}
