import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Split,
  SplitMain,
  SplitSecondary,
  type SplitProps
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export function SplitExample(props: SplitProps) {
  return (
    <Split {...props}>
      <SplitMain>
        <Card>
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
          </CardHeader>
          <CardContent>Day one: ride from the station to the lake.</CardContent>
        </Card>
      </SplitMain>
      <SplitSecondary>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>Three days, 140 km.</CardContent>
        </Card>
      </SplitSecondary>
    </Split>
  )
}
