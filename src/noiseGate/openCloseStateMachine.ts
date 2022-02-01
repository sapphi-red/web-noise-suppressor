import { convertDbToRms } from "../utils/rms"

const States = {
  CLOSED: 0,
  OPEN: 1,
  CLOSING: 2
} as const
type States = typeof States[keyof typeof States]

export const createOpenCloseStateMachine = ({
  openThreshold,
  closeThreshold,
  hold
}: {
  openThreshold: number
  closeThreshold: number
  hold: number
}) => {
  const rmsOpenThreshold = convertDbToRms(openThreshold)
  const rmsCloseThreshold = convertDbToRms(closeThreshold)

  let state: States = States.CLOSED
  let held = 0

  const next = (rms: number) => {
    switch (state) {
      case States.CLOSED:
        if (rms > rmsOpenThreshold) {
          state = States.OPEN
        }
        break
      case States.OPEN:
        if (rms < rmsCloseThreshold) {
          state = States.CLOSING
          held = 0
        }
        break
      case States.CLOSING:
        if (rms > rmsCloseThreshold) {
          state = States.OPEN
        } else if (held > hold) {
          state = States.CLOSED
        } else {
          held++
        }
        break
      default:
        const exhaustiveCheck: never = state
        console.error(`Unknown state: ${exhaustiveCheck}`)
    }
  }
  const isOpen = () =>
    state === States.OPEN || state === States.CLOSING

  return { next, isOpen }
}
