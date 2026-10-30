import { defineDesign } from '../../src/designs/types.ts'

export const design = defineDesign({
  id: 'mylder-today',
  title: 'Mylder today',
  summary:
    "Mylder's map screen as it ships today: every bus, S-tog, Metro and train on the map, and how sure the map is about each of them.",
  brief: `Draw Mylder's map screen as it is today, as the reference design every later design learns from. It is not a new feature, so it has no directions and no explorations. Mirror the app's composition (its src/screens/) with Perron, on fixed sample data from the morning rush at 08:14: a desktop with the city sheet on City pulse, the same with a vehicle open, a phone with the sheet at its peek, and a phone with a stop open.

Decisions:
- The city sheet and the detail panels are Perron's Sheet and DetailPanel in Mylder, which open in a portal and slide in. A still screen composes the same panels in place instead: Surface with DetailHeader, its close button and the body, and Tabs in the sheet. On a desktop they are glass; on a phone they are opaque bottom sheets, as Perron's Sheet draws them, so text never sits on the moving map.
- The language switch is Mylder's: a small outline link to the other language, "Dansk", beside About.
- The figures agree as the app's do: the trips in each data state add up to 1 312 in service, and each mode's meter counts its Live and Ageing trips over its trips underway. The Metro's meter is "—", since every Metro trip is Timetable only.
- Rejseplanen's disruption messages stay in Danish, captioned "From Rejseplanen, in Danish", with no line badges, as Mylder shows them.
- The Vehicles list shows a few of its rows, sorted by line; its search and sort controls are left out.
- The vehicle panel has no highlight on the map: the backdrop is an illustration, not the app's map.`,
  date: '2026-10-30',
  screens: [
    {
      id: 'desktop',
      name: 'Desktop',
      device: 'desktop',
      note: 'The map with the top bar, the city sheet on City pulse, and the legend and controls at its foot.',
    },
    {
      id: 'desktop-vehicle',
      name: 'Desktop, vehicle open',
      device: 'desktop',
      note: 'S-tog line C to Klampenborg open in the vehicle panel: its state, facts and next stops.',
    },
    {
      id: 'phone',
      name: 'Phone',
      device: 'phone',
      note: 'The small top bar and the city sheet as a bottom sheet at its peek.',
    },
    {
      id: 'phone-stop',
      name: 'Phone, stop open',
      device: 'phone',
      note: "Nørreport's departures in a bottom sheet, across every data state, with the Metro's intervals and a cancelled train.",
    },
  ],
  tweaks: [
    {
      id: 'sheet-side',
      label: 'Sheet side',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    },
    {
      id: 'veil',
      label: 'Map veil',
      options: [
        { value: 'none', label: 'None' },
        { value: 'soft', label: 'Soft' },
      ],
      defaultValue: 'none',
    },
    {
      id: 'density',
      label: 'Density',
      options: [
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'compact', label: 'Compact' },
      ],
      defaultValue: 'comfortable',
    },
  ],
})
