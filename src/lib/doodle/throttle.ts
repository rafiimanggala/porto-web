// Leading-plus-trailing throttle: calls run at most once per `ms`, and the
// latest argument that arrived during the quiet window still runs at its end.
// Clock and timers are injectable so the rate limit can be tested.

export type Throttle<A> = {
  readonly call: (arg: A) => void;
  readonly cancel: () => void;
};

export type Timers = {
  readonly now: () => number;
  readonly setTimer: (fn: () => void, ms: number) => unknown;
  readonly clearTimer: (id: unknown) => void;
};

const REAL_TIMERS: Timers = {
  now: () => performance.now(),
  setTimer: (fn, ms) => setTimeout(fn, ms),
  clearTimer: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
};

export function createThrottle<A>(
  fn: (arg: A) => void,
  ms: number,
  timers: Timers = REAL_TIMERS
): Throttle<A> {
  let last = -Infinity;
  let pending: { readonly arg: A } | null = null;
  let timer: unknown = null;

  const run = (arg: A) => {
    last = timers.now();
    fn(arg);
  };

  const flushPending = () => {
    timer = null;
    if (pending === null) return;
    const { arg } = pending;
    pending = null;
    run(arg);
  };

  return {
    call: (arg) => {
      const wait = last + ms - timers.now();
      if (wait <= 0 && timer === null) {
        run(arg);
        return;
      }
      pending = { arg };
      if (timer === null) timer = timers.setTimer(flushPending, Math.max(0, wait));
    },
    cancel: () => {
      if (timer !== null) timers.clearTimer(timer);
      timer = null;
      pending = null;
    },
  };
}
