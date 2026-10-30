# Mylder, for designers

What a design in this studio is designing for. The source of truth is the Mylder repository (github.com/marcin-sieradzki/mylder): its `GLOSSARY.md`, `docs/screens.md` and `docs/data-states.md`. Read those when this page is not enough.

## The product

Mylder is a live map of Copenhagen's buses, S-tog, metro and trains, honest about how fresh each position is. Its data comes from Rejseplanen, the Danish journey planner, and it shows planes over Kastrup from an open ADS-B feed. It is in English and Danish, light and dark, on phones and desktops. Its interface is ink, glass and neutral surfaces over the map; colour belongs to the map and its vehicles.

## The screens today

- **Top bar**: the Mylder brand, "Updated 08:14:05" (the one time on the page, with seconds), a filter chip per mode with a count (Bus 812, Metro 38, S-tog 96, Train 41, Light rail 22, Planes 12), the language switch EN and DA, and About.
- **The moving map**: every vehicle a dot coloured by its line or mode and drawn in the shape of its data state, over the line paths and stops. Zoom, reset and pause controls, a scale bar, and a legend of the state glyphs.
- **City sheet**, a side sheet on desktop and a bottom sheet with a peek on a phone, with three tabs:
  - **City pulse**: "1 046 of 1 312 in service", reported this minute, average delay, a reporting meter per mode with its authority or operator, the day's "Vehicles in service today" chart, and "How sure are we?" with a count per data state.
  - **Vehicles**: the list of every vehicle with Line, Destination, Position (its data state) and Delay; search and sort. It is also the map's text alternative.
  - **Disruptions**: Mylder's own data cards first, then Rejseplanen's messages in their own Danish words, marked "From Rejseplanen, in Danish", each with Show on map. "Running normally" when there are none.
- **Vehicle panel**: line badge, "to Destination", "S-tog · DSB", a sentence for its data state, Delay, Last seen and Next stop, "Between Nørreport and Kongens Nytorv", the next stops as a timeline with delays, Follow and Show whole line.
- **Stop panel**: line badges and the departures of the next 30 min, each with a countdown, the timetabled time struck through when it differs, platform, delay and data state. Metro rows say "every 3 min". Cancelled rows stay, struck.
- **Aircraft panel**: callsign, type, altitude and speed ("A20N · 3 350 m · 593 km/h"), its data state. No route or origin: the feed has none.
- **Page notices**: Disconnected, Paused, and "Simulated data".

## Data states

Every vehicle is in one of five, and a design uses these words and glyphs exactly:

| Data state     | Glyph                 | Label                     |
| -------------- | --------------------- | ------------------------- |
| Live           | Solid dot             | "Reported 20 s ago"       |
| Ageing         | Faint dot, outlined   | "Last seen 3 min ago"     |
| Estimated      | Hollow dot            | "Estimated from schedule" |
| Timetable only | Dashed hollow dot     | "Timetable only"          |
| No signal      | Grey dot with a slash | "No signal since 10:42"   |

Every Metro trip is Timetable only: the Metro sends no positions. A figure the data can't back shows "—" and says why. Perron draws the glyphs: `VehicleDot`, `VehicleDotLegend`, `DataStateKey` and `ReportStrip`.

## Words

Use these and avoid the words after them.

- **Mode**: Bus, Metro, S-tog, Train, Light rail. Not "transport type".
- **Line**: a public name such as 5C, 1A, M2, A or Re. Not "route".
- **Interval**: "every 3 min" for the Metro. Not "headway" or "frequency".
- **Stop**: Nørreport, København H. Not "station". **Platform**: one spot in a stop, such as bus stand B.
- **Operator** runs trips (DSB, Arriva, Metro Service); **Authority** orders and brands them (Movia).
- **Trip**: one run of a line on one service day. **Vehicle**: a trip as the map draws it. Not "journey".
- **Departure**: a call as a stop's list shows it. **Delay**: expected minus scheduled, in minutes, negative when early.
- **Cancelled trip**, **Extra trip**, **Waiting** (at the first stop before it leaves).
- **Disruption**: Rejseplanen's message. Not "alert". **Data card**: Mylder's own card about a gap in its data.
- **Planes** in the interface, never "flights".
- Never "real-time", "stale", "status" or "freshness" for a data state.

## Real places and lines to design with

- Metro M1, M2 (Vanløse to Vestamager and Lufthavnen), M3 Cityringen, M4 (Orientkaj to København Syd).
- S-tog lines A, B, Bx, C, E, F, H. Regional and Øresund trains Re, Ø.
- Buses 1A, 2A, 5C, 6A, 9A, 150S, 250S, 350S; harbour buses 991, 992, 993.
- Stops: Nørreport, København H, Kongens Nytorv, Østerport, Christianshavn, Vesterport, Nordhavn, Ørestad, Lufthavnen, Valby, Flintholm, Hellerup.
- Operators and authorities: DSB, Metro Service, Movia (authority), Arriva, Keolis.

## On the roadmap

Harbour ships from AIS, car traffic flow, a replay of a past rush hour, a full-screen kiosk mode, and more cities.
