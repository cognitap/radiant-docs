import { Rating } from '@cognitap/radiant'

export function ShowStoreRating() {
  return (
    <Rating
      label="Average store rating"
      value={4}
      readOnly
    />
  )
}
