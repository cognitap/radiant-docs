import { Card, CardHeader, CardTitle, Grid, type GridProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const courses = ['Algebra', 'Biology', 'Chemistry', 'Drawing', 'Economics', 'French']
export function GridExample(props: GridProps) {
  return (
    <Grid
      maxColumns={3}
      {...props}
    >
      {courses.map(course => (
        <Card key={course}>
          <CardHeader>
            <CardTitle>{course}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </Grid>
  )
}
