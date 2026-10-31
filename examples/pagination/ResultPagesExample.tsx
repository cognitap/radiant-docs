import { Fragment } from 'react'
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationUnavailable,
  type PaginationLinkProps
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const href = (page: number) => `?page=${page}`
export function ResultPages({
  page,
  pageCount,
  label = 'Result pages',
  controlSize
}: {
  page: number
  pageCount: number
  label?: string
  controlSize?: PaginationLinkProps['controlSize']
}) {
  const near = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter(n => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b)
  // An ellipsis must hide at least two pages; show a lone missing page instead.
  const shown = near.flatMap((n, index) => (n - (near[index - 1] ?? n) === 2 ? [n - 1, n] : [n]))
  return (
    <Pagination aria-label={label}>
      <PaginationList>
        <PaginationItem>
          {page === 1 ? (
            <PaginationUnavailable>Previous</PaginationUnavailable>
          ) : (
            <PaginationPrevious
              href={href(page - 1)}
              controlSize={controlSize}
            />
          )}
        </PaginationItem>
        {shown.map((n, index) => (
          <Fragment key={n}>
            {n - (shown[index - 1] ?? n) > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href={href(n)}
                current={n === page}
                aria-label={`Page ${n}`}
                controlSize={controlSize}
              >
                {n}
              </PaginationLink>
            </PaginationItem>
          </Fragment>
        ))}
        <PaginationItem>
          {page === pageCount ? (
            <PaginationUnavailable>Next</PaginationUnavailable>
          ) : (
            <PaginationNext
              href={href(page + 1)}
              controlSize={controlSize}
            />
          )}
        </PaginationItem>
      </PaginationList>
    </Pagination>
  )
}
