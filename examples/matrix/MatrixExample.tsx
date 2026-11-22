'use client'
import { useState } from 'react'
import {
  Matrix,
  MatrixCell,
  MatrixColumnHeader,
  MatrixCorner,
  MatrixMarker,
  MatrixRegion,
  MatrixRow,
  MatrixRowHeader,
  type MatrixCellState,
  type SeriesNumber
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const rows = ['A', 'B', 'C', 'D']
const seats = [1, 2, 3, 4, 5, 6, 7, 8]
const taken = new Set(['A3', 'A4', 'C6', 'D1'])
export function PickSeats() {
  const [chosen, setChosen] = useState(['B4'])
  return (
    <div style={{ display: 'grid', gap: '0.75rem', width: '36rem', maxWidth: '100%' }}>
      <Matrix
        aria-label="Seats"
        type="multiple"
        columns={seats.length}
        value={chosen}
        onValueChange={setChosen}
      >
        <MatrixRow>
          <MatrixCorner />
          {seats.map(seat => (
            <MatrixColumnHeader key={seat}>{seat}</MatrixColumnHeader>
          ))}
        </MatrixRow>
        {rows.map(row => (
          <MatrixRow key={row}>
            <MatrixRowHeader>Row {row}</MatrixRowHeader>
            {seats.map(seat => {
              const id = `${row}${seat}`
              return (
                <MatrixCell
                  key={id}
                  value={id}
                  disabled={taken.has(id)}
                >
                  {id}
                </MatrixCell>
              )
            })}
          </MatrixRow>
        ))}
        <MatrixRegion
          row={1}
          column={1}
          rowSpan={2}
          columnSpan={2}
          label="Quiet"
          series={3}
        />
      </Matrix>
      <output>Seats: {chosen.length ? chosen.join(', ') : 'none'}</output>
    </div>
  )
}
const hours = ['9', '10', '11', '12', '13', '14']
type Slot = null | { label: string; state?: MatrixCellState; series?: SeriesNumber }
const rooms: { name: string; slots: Slot[] }[] = [
  {
    name: 'Atlas',
    slots: [
      { label: 'Standup', series: 1 },
      { label: 'Standup', series: 1 },
      null,
      null,
      { label: 'Review', series: 2 },
      null
    ]
  },
  {
    name: 'Birch',
    slots: [
      null,
      { label: 'Interview', series: 3, state: 'active' },
      { label: 'Interview', series: 3 },
      null,
      null,
      null
    ]
  },
  {
    name: 'Cove',
    slots: [
      { label: 'Closed', state: 'muted' },
      { label: 'Closed', state: 'muted' },
      null,
      { label: 'Requested', state: 'highlighted' },
      null,
      null
    ]
  }
]
export function ShowRoomBookings() {
  return (
    <div style={{ width: '36rem', maxWidth: '100%' }}>
      <Matrix
        aria-label="Room bookings"
        columns={hours.length}
      >
        <MatrixRow>
          <MatrixCorner>Room</MatrixCorner>
          {hours.map(hour => (
            <MatrixColumnHeader key={hour}>{hour}:00</MatrixColumnHeader>
          ))}
        </MatrixRow>
        {rooms.map(room => (
          <MatrixRow key={room.name}>
            <MatrixRowHeader>{room.name}</MatrixRowHeader>
            {room.slots.map((slot, index) => (
              <MatrixCell
                key={index}
                state={slot?.state}
                series={slot?.series}
                altText={slot ? undefined : 'Free'}
              >
                {slot?.label}
              </MatrixCell>
            ))}
          </MatrixRow>
        ))}
        <MatrixRegion
          row={1}
          column={5}
          rowSpan={3}
          columnSpan={2}
          label="Cleaning"
        />
      </Matrix>
    </div>
  )
}
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const deploys: Record<string, number[]> = {
  Web: [3, 1, 0, 4, 2],
  API: [1, 0, 2, 5, 0],
  Billing: [0, 0, 1, 0, 1]
}
export function MarkDeploys() {
  return (
    <div style={{ width: '30rem', maxWidth: '100%' }}>
      <Matrix
        aria-label="Deploys per day"
        columns={days.length}
      >
        <MatrixRow>
          <MatrixCorner />
          {days.map(day => (
            <MatrixColumnHeader key={day}>{day}</MatrixColumnHeader>
          ))}
        </MatrixRow>
        {Object.entries(deploys).map(([service, counts]) => (
          <MatrixRow key={service}>
            <MatrixRowHeader>{service}</MatrixRowHeader>
            {counts.map((count, day) => (
              <MatrixCell
                key={day}
                series={count >= 4 ? 2 : undefined}
                altText={count === 1 ? '1 deploy' : `${count || 'No'} deploys`}
              >
                <MatrixMarker variant={count ? 'solid' : 'outline'}>{count || ''}</MatrixMarker>
              </MatrixCell>
            ))}
          </MatrixRow>
        ))}
      </Matrix>
    </div>
  )
}
