import {
  Button,
  Compare,
  CompareItem,
  CompareItemBody,
  CompareItemFooter,
  CompareItemHeader
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const plans = [
  { name: 'Basic', price: 'Free', detail: 'One learner.' },
  { name: 'Plus', price: '€8 a month', detail: 'One learner, offline lessons and weekly reports.' },
  { name: 'Team', price: '€40 a month', detail: 'Up to ten learners.' }
]
export function CompareExample() {
  return (
    <Compare>
      {plans.map(plan => (
        <CompareItem
          key={plan.name}
          style={{
            border: '1px solid var(--rad-color-border)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}
        >
          <CompareItemHeader>
            <strong>{plan.name}</strong>
            <div>{plan.price}</div>
          </CompareItemHeader>
          <CompareItemBody>{plan.detail}</CompareItemBody>
          <CompareItemFooter>
            <Button>Choose {plan.name}</Button>
          </CompareItemFooter>
        </CompareItem>
      ))}
    </Compare>
  )
}
