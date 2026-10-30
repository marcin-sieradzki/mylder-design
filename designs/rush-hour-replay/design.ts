import { defineDesign } from '../../src/designs/types.ts'

export const design = defineDesign({
  id: 'rush-hour-replay',
  title: 'Rush hour replay',
  summary:
    "Myldretid: replay this morning's rush hour, 06:00 to 10:00, on the map as Mylder recorded it, with City pulse following the clock and the busiest minute and the disruptions a press away.",
  brief: `Rush hour replay (Myldretid). Let anyone replay this morning's rush hour on the map, from 06:00 to 10:00, the way Mylder recorded it. A timeline under the map scrubs through the morning with play, pause and speed (1×, 10×, 60×); the vehicles move as they did, each keeping the data state it had at that moment. As the time moves, the City pulse figures follow: vehicles in service, the share reporting live, average delay, and the 'How sure are we?' counts per data state. Mark the busiest minute and any disruption on the timeline, and let the rider jump to them. Make it unmistakably a replay, not live: it must never look like Mylder's live map. Desktop and phone.

Decisions:
- A replay is a page, not the live map. The live map fills the window with glass floating over it; the replay frames the map like a picture, with a rounded edge, under a header of its own, with the player under the map and City pulse beside it (desktop) or below it (phone), all on the page's opaque surface. The live map's top bar is gone with its "Updated" time, its mode filters and their counts: the header says "Replay", "This morning's rush hour" and "Friday 30 October, 06:00 to 10:00, as Mylder recorded it", and leads back to the live map.
- The map carries its own "Replay" stamp with the replay's clock in its corner, so even a cropped screenshot can't pass for live. Vehicles never pulse: a pulse means a report arriving now.
- The word "Updated" never appears: the clock says the replay's time ("08:10, of 06:00 to 10:00") and City pulse's heading says the minute its figures are for ("City pulse at 08:10").
- Perron has no timeline or scrubber, so the timeline is composed: Perron's Slider (its figure hidden, the thumb heard as "08:10") laid under the morning's profile of vehicles in service, drawn in the chart tokens, with the part already played in a stronger fill. The stretches of the disruption and of the data gap are tinted in their severity colours, and a flag with the severity's icon stands over each moment, and an arrow over the busiest minute.
- Every marked moment has a button that jumps to it: "Disruption on the S-tog 07:20", "No positions from Movia 07:38" and "Busiest minute 08:10". A stretch's jump lands on its start.
- The busiest minute is the minute with the most vehicles in service, worked out from the recording: 08:10, 1 344 vehicles.
- The morning has one Rejseplanen disruption, a signal fault on B, C and H between Valby and København H, 07:20 to 07:55, shown in Rejseplanen's Danish and captioned "From Rejseplanen, in Danish", as Mylder does. It also has a gap in Mylder's own data, marked as Mylder's data card rather than a disruption: Movia's buses sent no positions 07:38 to 07:51. It shows the data states honestly over time: those buses stay Live for 2.5 min, turn Ageing, then No signal at 07:43, on the map and in the counts, until the feed comes back.
- "At this minute" under City pulse's heading shows the disruption and the data card active at the replay's minute, or "Running normally at 08:10".
- "Reporting live" is the share of vehicles in service that are Live at that minute. Average delay leaves out the Metro, as the live City pulse does.
- Play is the screen's one brand action. The replay always opens paused, at 60× (the whole morning in 4 min); 1× plays it in real time. It stops at 10:00, and Play from there starts again at 06:00.
- The figures redraw once a replay minute, the map every frame while it plays.
- The kit's CityMap gained a vehicles prop, so a screen can place every vehicle and set its state itself; without it the map draws its own gliding vehicles as before.
- The map is an illustration of 64 trips on the kit's drawing, not every one of the 1 344: more join for the rush and leave after it, and the figures come from the recording, not from the dots.`,
  date: '2026-10-30',
  screens: [
    {
      id: 'desktop',
      name: 'Desktop',
      device: 'desktop',
      note: 'Paused on the busiest minute, 08:10: the framed map, the timeline and controls under it, and City pulse at that minute beside it.',
    },
    {
      id: 'phone',
      name: 'Phone',
      device: 'phone',
      note: 'The busiest minute on a phone: the framed map, the player, and City pulse scrolling under them.',
    },
    {
      id: 'phone-disruption',
      name: 'Phone, at a disruption',
      device: 'phone',
      note: "Scrubbed to 07:46: Movia's buses have gone quiet and show No signal, and the signal fault on the S-tog is still on.",
    },
  ],
  explorations: [
    {
      id: 'direction-b',
      name: 'Direction B, over the map',
      device: 'phone',
      note: 'The map full screen under a glass header and a glass dock of the player and three figures.',
      verdict:
        "Set aside because the full-screen map under glass reads as Mylder's live map at a glance, which the brief rules out, and the dock leaves no room for the counts per data state.",
    },
    {
      id: 'direction-c',
      name: 'Direction C, the morning first',
      device: 'phone',
      note: 'A tall chart of the morning leads, with the map in a small box under the player.',
      verdict:
        'Set aside because leading with the chart shrinks the map, where the vehicles move as they did, to a box under the player, so the replay reads as a report rather than the morning on the map.',
    },
  ],
  tweaks: [
    {
      id: 'panel-side',
      label: 'City pulse side',
      options: [
        { value: 'right', label: 'Right' },
        { value: 'left', label: 'Left' },
      ],
      defaultValue: 'right',
    },
    {
      id: 'map-share',
      label: 'Map on a phone',
      options: [
        { value: 'less', label: 'Less' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'more', label: 'More' },
      ],
      defaultValue: 'balanced',
    },
    {
      id: 'profile',
      label: 'Timeline',
      options: [
        { value: 'shown', label: 'With the profile' },
        { value: 'hidden', label: 'Track only' },
      ],
      defaultValue: 'shown',
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
