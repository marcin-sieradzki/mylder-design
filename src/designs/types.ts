// What a design is. A design is one folder in designs/: a design.ts that describes it with
// defineDesign, and one React component per screen in its screens/ folder, built on Perron. The
// studio reads the descriptions; the canvas page renders the screens.

/** The frame a screen is drawn for. */
export type Device = 'phone' | 'desktop'

/** The size of each device's frame, in CSS px. */
export const DEVICE_SIZE: Record<Device, { width: number; height: number }> = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
}

export interface Screen {
  /** The file name in screens/ without .tsx, such as `desktop` or `phone-scrubbing` */
  id: string
  /** What the board calls the screen, in sentence case, such as `Desktop, scrubbing` */
  name: string
  device: Device
  /** One sentence on what this screen shows or decides */
  note?: string
}

/** A variant the generator made and the maintainer did not keep, shown for the record. */
export interface Exploration extends Screen {
  /** Why it was set aside, in one sentence */
  verdict: string
}

/** One option of a tweak. */
export interface TweakOption {
  value: string
  label: string
}

/**
 * A knob a visitor can turn in draft mode. A tweak sets one attribute on every screen's root
 * element (`<html>`), `data-tweak-<id>`, to the chosen option's value; the screen's CSS reads it.
 */
export interface Tweak {
  id: string
  label: string
  options: readonly TweakOption[]
  /** The value the saved design uses */
  defaultValue: string
}

export interface Design {
  /** The folder name in designs/, in kebab case */
  id: string
  /** The feature's name, such as `Rush hour replay` */
  title: string
  /** One sentence on what the feature does for a rider */
  summary: string
  /** The brief the design was generated from, as the maintainer wrote it */
  brief: string
  /** The day it was generated, as YYYY-MM-DD */
  date: string
  /** The screens the maintainer kept, in the board's order */
  screens: readonly Screen[]
  /** Variants set aside along the way */
  explorations?: readonly Exploration[]
  tweaks?: readonly Tweak[]
}

/** Describes a design; it only types the object, so a design.ts reads as data. */
export const defineDesign = (design: Design): Design => design
