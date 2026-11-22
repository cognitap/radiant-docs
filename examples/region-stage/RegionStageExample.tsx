'use client'
import { useState } from 'react'
import {
  RegionStage,
  RegionStageControls,
  RegionStagePin,
  RegionStageRegion,
  RegionStageViewport,
  type SeriesNumber
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const zoomLabels = {
  zoomInLabel: 'Zoom in',
  zoomOutLabel: 'Zoom out',
  zoomResetLabel: 'Reset view'
}
const rooms: { label: string; d: string; x: number; y: number; series?: SeriesNumber }[] = [
  { label: 'Lobby', d: 'M10 10h140v100H10z', x: 80, y: 60, series: 1 },
  { label: 'Kitchen', d: 'M160 10h110v100H160z', x: 215, y: 60, series: 2 },
  { label: 'Studio', d: 'M280 10h110v220H280z', x: 335, y: 120, series: 3 },
  { label: 'Meeting room', d: 'M10 120h140v110H10z', x: 80, y: 175 },
  { label: 'Storage', d: 'M160 120h110v110H160z', x: 215, y: 175, series: 6 }
]
/** Visible names drawn over the shapes; the regions carry the accessible names. */
function Names({ items }: { items: { label: string; x: number; y: number }[] }) {
  return (
    <g
      aria-hidden
      pointerEvents="none"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="13"
      fill="currentColor"
      stroke="var(--rad-color-surface)"
      strokeWidth="3"
      paintOrder="stroke"
    >
      {items.map(item => (
        <text
          key={item.label}
          x={item.x}
          y={item.y}
        >
          {item.label}
        </text>
      ))}
    </g>
  )
}
export function PickRoom() {
  const [room, setRoom] = useState<string | null>('Kitchen')
  return (
    <div style={{ display: 'grid', gap: '0.75rem', width: '30rem', maxWidth: '100%' }}>
      <RegionStage
        aria-label="Second floor"
        aria-describedby="floor-plan-keys"
        value={room}
        onValueChange={setRoom}
      >
        <RegionStageControls {...zoomLabels} />
        <RegionStageViewport viewBox="0 0 400 240">
          {rooms.map(item => (
            <RegionStageRegion
              key={item.label}
              value={item.label}
              aria-label={item.label}
              series={item.series}
              d={item.d}
            />
          ))}
          <Names items={rooms} />
        </RegionStageViewport>
      </RegionStage>
      <p
        id="floor-plan-keys"
        style={{ margin: 0, fontSize: '0.8125rem' }}
      >
        Arrow keys move between rooms, Enter selects, plus and minus zoom, zero resets, and Shift
        with an arrow key pans.
      </p>
      <output>Room: {room ?? 'none'}</output>
    </div>
  )
}
const zones: { label: string; d: string; x: number; y: number; series: SeriesNumber }[] = [
  { label: 'North yard', d: 'M20 20h260v90H20z', x: 150, y: 45, series: 5 },
  { label: 'Loading docks', d: 'M290 20h190v90H290z', x: 385, y: 40, series: 2 },
  { label: 'Cold storage', d: 'M20 120h180v160H20z', x: 110, y: 145, series: 1 },
  { label: 'Racks', d: 'M210 120h270v160H210z', x: 345, y: 145, series: 3 }
]
export function WatchSiteMap() {
  const [watched, setWatched] = useState(['Loading docks'])
  return (
    <div style={{ display: 'grid', gap: '0.75rem', width: '34rem', maxWidth: '100%' }}>
      <RegionStage
        aria-label="Warehouse site"
        type="multiple"
        value={watched}
        onValueChange={setWatched}
      >
        <RegionStageControls {...zoomLabels} />
        <RegionStageViewport viewBox="0 0 500 300">
          {zones.map(zone => (
            <RegionStageRegion
              key={zone.label}
              value={zone.label}
              aria-label={zone.label}
              series={zone.series}
              d={zone.d}
            />
          ))}
          <Names items={zones} />
          <RegionStagePin
            x={385}
            y={65}
            aria-label="Dock 3 delay"
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Dock 3 delay</p>
            <p style={{ margin: 0 }}>Truck 40 minutes late.</p>
          </RegionStagePin>
          <RegionStagePin
            x={110}
            y={200}
            aria-label="Freezer alarm"
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Freezer alarm</p>
            <p style={{ margin: 0 }}>Unit B is at −12 °C.</p>
          </RegionStagePin>
          <RegionStagePin
            x={345}
            y={200}
            aria-label="Forklift charging point"
          />
        </RegionStageViewport>
      </RegionStage>
      <output>Watching: {watched.length ? watched.join(', ') : 'none'}</output>
    </div>
  )
}
