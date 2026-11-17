'use client'
import { useState } from 'react'
import { NativeSelect, Field, Checkbox, type ThemeStyle } from '@cognitap/radiant'
import {
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  ChartDataTable,
  chartPalette,
  type ChartProps,
  type ChartDatum
} from '@cognitap/radiant/charts'
import { generateColorWall, recommendColorPalette } from '@cognitap/radiant/color'
export type ChartsTaskOptions = Pick<ChartProps, 'className' | 'style' | 'dir'>
const series = [
  { key: 'completed', label: 'Completed' },
  { key: 'scheduled', label: 'Scheduled' }
]
const weeks: ChartDatum[] = [
  { key: 'one', label: 'Round 1', values: { completed: 12, scheduled: 18 } },
  { key: 'two', label: 'Round 2', values: { completed: 18, scheduled: 24 } },
  { key: 'three', label: 'Round 3', values: { completed: 26, scheduled: 30 } },
  { key: 'four', label: 'Round 4', values: { completed: 32, scheduled: 36 } }
]
const colors = chartPalette(
  recommendColorPalette(generateColorWall({ brand: '#7c3aed' }), { working: { support: 'teal' } })
)
const generatedStyle: ThemeStyle = {
  '--rad-chart-series1': `light-dark(${colors.light.series1},${colors.dark.series1})`,
  '--rad-chart-series2': `light-dark(${colors.light.series2},${colors.dark.series2})`,
  '--rad-chart-series3': `light-dark(${colors.light.series3},${colors.dark.series3})`,
  '--rad-chart-series4': `light-dark(${colors.light.series4},${colors.dark.series4})`,
  '--rad-chart-series5': `light-dark(${colors.light.series5},${colors.dark.series5})`,
  '--rad-chart-series6': `light-dark(${colors.light.series6},${colors.dark.series6})`
}
export function ReviewRecruitment(options: ChartsTaskOptions) {
  const [project, setProject] = useState('all'),
    [palette, setPalette] = useState(false)
  const data = weeks.map(row => ({
    ...row,
    values:
      project === 'atlas'
        ? { completed: (row.values.completed ?? 0) / 2, scheduled: (row.values.scheduled ?? 0) / 2 }
        : row.values
  }))
  return (
    <section
      className="grid w-full max-w-4xl gap-4"
      aria-label="Recruitment review application"
    >
      <h2>Review study recruitment</h2>
      <Field label="Research project">
        <NativeSelect
          value={project}
          onChange={event => setProject(event.currentTarget.value)}
        >
          <option value="all">All projects</option>
          <option value="atlas">Atlas onboarding</option>
        </NativeSelect>
      </Field>
      <Checkbox
        label="Use generated chart palette"
        checked={palette}
        onChange={event => setPalette(event.currentTarget.checked)}
      />
      <BarChart
        {...options}
        label={project === 'all' ? 'Study recruitment' : 'Atlas recruitment'}
        description="Compare completed sessions with scheduled sessions in each research round."
        data={data}
        series={series}
        style={{ ...options.style, ...(palette ? generatedStyle : {}) }}
      />
      <p>
        {project === 'all'
          ? '32 completed sessions in Round 4.'
          : '16 Atlas sessions completed in Round 4.'}
      </p>
    </section>
  )
}
export function TrackStudyEnrollment(options: ChartsTaskOptions) {
  const [type, setType] = useState('area')
  const Chart = type === 'area' ? AreaChart : LineChart
  return (
    <section
      className="grid w-full max-w-4xl gap-4"
      aria-label="Enrollment review application"
    >
      <h2>Track research progress</h2>
      <Field label="Chart presentation">
        <NativeSelect
          value={type}
          onChange={event => setType(event.currentTarget.value)}
        >
          <option value="area">Area</option>
          <option value="line">Line</option>
        </NativeSelect>
      </Field>
      <Chart
        {...options}
        label="Research enrollment"
        description="Completed and scheduled sessions increase over four research rounds. Use the data table for exact counts."
        data={weeks}
        series={series}
      />
    </section>
  )
}
export function UnderstandSessionMix(options: ChartsTaskOptions) {
  const [round, setRound] = useState('latest')
  const data: ChartDatum[] = [
    { key: 'moderated', label: 'Moderated', values: { sessions: round === 'latest' ? 18 : 12 } },
    { key: 'unmoderated', label: 'Unmoderated', values: { sessions: round === 'latest' ? 12 : 6 } },
    { key: 'interviews', label: 'Interviews', values: { sessions: 6 } }
  ]
  return (
    <section
      className="grid w-full max-w-4xl gap-4"
      aria-label="Session mix application"
    >
      <h2>Plan the next research round</h2>
      <Field label="Research round">
        <NativeSelect
          value={round}
          onChange={event => setRound(event.currentTarget.value)}
        >
          <option value="latest">Latest</option>
          <option value="previous">Previous</option>
        </NativeSelect>
      </Field>
      <PieChart
        {...options}
        label="Session method mix"
        description="Compare session methods before choosing the next round's recruitment plan."
        data={data}
        series={[{ key: 'sessions', label: 'Sessions' }]}
      />
      <p>
        {round === 'latest'
          ? '36 sessions across three methods.'
          : '24 sessions across three methods.'}
      </p>
    </section>
  )
}
const minutes: ChartDatum[] = [
  { key: 'one', label: 'Round 1', values: { moderated: 42, unmoderated: 18 } },
  { key: 'two', label: 'Round 2', values: { moderated: 45, unmoderated: null } },
  { key: 'three', label: 'Round 3', values: { moderated: 38, unmoderated: 21 } },
  { key: 'four', label: 'Round 4', values: { moderated: 36, unmoderated: 24 } }
]
const methods = [
  { key: 'moderated', label: 'Moderated' },
  { key: 'unmoderated', label: 'Unmoderated' }
]
const formatMinutes = (value: number) => `${value} min`
export function ReviewSessionLength(options: ChartsTaskOptions) {
  return (
    <section
      className="grid w-full max-w-4xl gap-4"
      aria-label="Session length application"
    >
      <h2>Review session length</h2>
      <LineChart
        {...options}
        label="Average session length"
        description="Round 2 has no unmoderated sessions, so that line breaks."
        data={minutes}
        series={methods}
        formatValue={formatMinutes}
        categoryLabel="Research round"
        legendLabel="Session methods"
        tableLabel="Show exact minutes"
        parts={{ table: { className: 'w-full' } }}
      />
    </section>
  )
}
export function WaitForFirstSessions(options: ChartsTaskOptions) {
  const [pilot, setPilot] = useState(false)
  return (
    <section
      className="grid w-full max-w-4xl gap-4"
      aria-label="New study application"
    >
      <h2>Start a new study</h2>
      <Checkbox
        label="Include pilot round"
        checked={pilot}
        onChange={event => setPilot(event.currentTarget.checked)}
      />
      <BarChart
        {...options}
        label="Completed sessions"
        data={pilot ? [{ key: 'pilot', label: 'Pilot', values: { completed: 4 } }] : []}
        series={[{ key: 'completed', label: 'Completed' }]}
        emptyText="No sessions completed yet."
      />
    </section>
  )
}
export function ShareExactCounts(options: Pick<ChartsTaskOptions, 'className' | 'dir'>) {
  return (
    <section
      className="grid w-full max-w-4xl gap-4"
      aria-label="Research report application"
    >
      <h2>Research report</h2>
      <p>Session counts for the appendix, without a plot.</p>
      <ChartDataTable
        {...options}
        label="Sessions per round"
        data={weeks}
        series={series}
        categoryLabel="Research round"
        formatValue={value => `${value} sessions`}
      />
    </section>
  )
}
