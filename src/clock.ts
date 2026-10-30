export class SimulationClock {
  private last: number;
  private debt = 0;
  private tickMs: number;
  private onTick: () => void;

  constructor(now: number, tickMs: number, onTick: () => void) {
    if (!Number.isFinite(tickMs) || tickMs <= 0) throw Error('Invalid tick interval.');
    this.last = now; this.tickMs = tickMs; this.onTick = onTick;
  }

  pump(now: number): number {
    if (now < this.last) throw Error('Simulation requires a monotonic clock.');
    this.debt += now - this.last; this.last = now;
    let count = 0;
    while (this.debt >= this.tickMs && count < 20) {
      this.onTick(); this.debt -= this.tickMs; count++;
    }
    return count;
  }
}
