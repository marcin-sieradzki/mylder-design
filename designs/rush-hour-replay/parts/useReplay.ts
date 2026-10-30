// The replay's clock: where it is in the morning, whether it plays, and how fast. Playing moves the
// time on each animation frame by the speed, and stops at 10:00; it never starts by itself, so a
// screen always opens still, on the minute it names.
import { useEffect, useRef, useState } from 'react'
import { END, START, type Speed } from '../data.ts'

export interface Replay {
  /** Minutes after midnight, with a fraction while playing */
  time: number
  playing: boolean
  speed: Speed
  /** Play from where it is, or from 06:00 once it has reached 10:00; or pause */
  toggle: () => void
  setSpeed: (speed: Speed) => void
  /** Move to a minute, playing on from there if it was playing */
  seek: (minute: number) => void
}

export function useReplay(opening: number, openingSpeed: Speed = '60'): Replay {
  const [time, setTime] = useState(opening)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(openingSpeed)
  // the frame loop reads the time here, so a seek while playing moves it at once
  const timeRef = useRef(opening)

  useEffect(() => {
    if (!playing) return
    let last: number | undefined
    let frame = requestAnimationFrame(function tick(now) {
      const step = last === undefined ? 0 : ((now - last) / 1000) * (Number(speed) / 60)
      last = now
      const next = Math.min(END, timeRef.current + step)
      timeRef.current = next
      setTime(next)
      if (next >= END) setPlaying(false)
      else frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [playing, speed])

  const seek = (minute: number) => {
    const next = Math.min(END, Math.max(START, minute))
    timeRef.current = next
    setTime(next)
  }

  const toggle = () => {
    if (!playing && timeRef.current >= END) seek(START)
    setPlaying(!playing)
  }

  return { time, playing, speed, toggle, setSpeed, seek }
}
