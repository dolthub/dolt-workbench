import {
  CursorPage,
  CursorSink,
  CursorSource,
  IDLE_TTL_MS,
  MAX_BUFFERED_BYTES,
  SqlCursorStore,
} from ".";

// The cursor schedules through the timers module; route it through the
// globals so jest's fake timers control it.
jest.mock("timers", () => {
  return {
    setTimeout: (...a: Parameters<typeof globalThis.setTimeout>) =>
      globalThis.setTimeout(...a),
    clearTimeout: (t: Parameters<typeof globalThis.clearTimeout>[0]) =>
      globalThis.clearTimeout(t),
  };
});

type FakeSource = CursorSource & {
  produced: number;
  abandoned: boolean;
};

type FakeOptions = {
  mustFinish?: boolean;
  writesNothing?: boolean;
  payload?: string;
  warnings?: string[];
  // Rows start only once this resolves, leaving the first page in flight.
  gate?: Promise<void>;
  // Raised in place of any rows.
  error?: { e: Error; notStarted: boolean };
};

// Produces rows 0, 1, 2, ... synchronously while resumed, like the SQLite
// source, until `total` rows.
function fakeSource(total = Infinity, opts: FakeOptions = {}): FakeSource {
  let sink: CursorSink | undefined;
  let paused = true;
  let open = !opts.gate;
  void opts.gate?.then(() => {
    open = true;
    if (!paused) source.resume();
  });
  // A function so the loop re-reads it after the sink pauses the source.
  const isPaused = () => paused;
  const source: FakeSource = {
    produced: 0,
    abandoned: false,
    writesNothing: opts.writesNothing ?? !!opts.mustFinish,
    completeBeforeFirstPage: !!opts.mustFinish,
    start(s) {
      sink = s;
      s.rowSet();
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
      if (!sink || !open) return;
      if (opts.error) {
        sink.error(opts.error.e, opts.error.notStarted);
        return;
      }
      while (!isPaused() && source.produced < total) {
        sink.row({ n: source.produced, payload: opts.payload ?? "" });
        source.produced += 1;
      }
      if (source.produced >= total) sink.end();
    },
    async finish() {
      return opts.warnings ?? [];
    },
    abandon() {
      source.abandoned = true;
      paused = true;
    },
    classify(sets) {
      const s = sets[0] as (typeof sets)[number] | undefined;
      return {
        rows: s && "rows" in s ? s.rows : [],
        isMutation: false,
        executionMessage: "",
      };
    },
  };
  return source;
}

const PAGE = 10;

describe("SqlCursorStore", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("reads only one page ahead of what it has served", async () => {
    const store = new SqlCursorStore();
    const src = fakeSource();
    await store.page("q", 0, PAGE, async () => src);
    expect(src.produced).toBe(PAGE + 1);
    for (let offset = PAGE; offset <= 5 * PAGE; offset += PAGE) {
      const page = await store.page("q", offset, PAGE, async () => src);
      expect(page?.rows[0]).toEqual({ n: offset, payload: "" });
      expect(src.produced).toBe(offset + PAGE + 1);
    }
    store.closeAll();
  });

  it("closes the open cursor when another query starts", async () => {
    const store = new SqlCursorStore();
    const first = fakeSource();
    await store.page("a", 0, PAGE, async () => first);
    await store.page("b", 0, PAGE, async () => fakeSource());
    expect(first.abandoned).toBe(true);
    expect(await store.page("a", PAGE, PAGE, async () => first)).toBe(
      undefined,
    );
    store.closeAll();
  });

  it("closes a cursor left idle", async () => {
    jest.useFakeTimers();
    const store = new SqlCursorStore();
    const src = fakeSource();
    await store.page("q", 0, PAGE, async () => src);
    jest.advanceTimersByTime(IDLE_TTL_MS - 1);
    expect(src.abandoned).toBe(false);
    await store.page("q", PAGE, PAGE, async () => src);
    jest.advanceTimersByTime(IDLE_TTL_MS - 1);
    expect(src.abandoned).toBe(false);
    jest.advanceTimersByTime(1);
    expect(src.abandoned).toBe(true);
  });

  it("hands back a result too large to buffer before its first page", async () => {
    const store = new SqlCursorStore();
    const payload = "x".repeat(1024 * 1024);
    const src = fakeSource(Infinity, { mustFinish: true, payload });
    expect(await store.page("q", 0, PAGE, async () => src)).toBeUndefined();
    expect(src.abandoned).toBe(true);
    expect(src.produced * payload.length * 2).toBeGreaterThanOrEqual(
      MAX_BUFFERED_BYTES,
    );
    expect(src.produced * payload.length * 2).toBeLessThan(
      MAX_BUFFERED_BYTES + 4 * payload.length,
    );
  });

  it("serves a large result that can't be handed back, then lets it go", async () => {
    const store = new SqlCursorStore();
    const payload = "x".repeat(1024 * 1024);
    const src = fakeSource(4 * PAGE, {
      mustFinish: true,
      writesNothing: false,
      payload,
    });
    const first = await store.page("q", 0, PAGE, async () => src);
    expect(first?.rows).toHaveLength(PAGE + 1);
    expect(src.produced).toBe(4 * PAGE);
    expect(await store.page("q", PAGE, PAGE, async () => src)).toBeUndefined();
  });

  it("serves a result that finishes within the buffer limit", async () => {
    const store = new SqlCursorStore();
    const src = fakeSource(3 * PAGE, { mustFinish: true });
    const page = await store.page("q", 0, PAGE, async () => src);
    expect(page?.rows).toHaveLength(PAGE + 1);
    expect(src.abandoned).toBe(false);
    store.closeAll();
  });

  it("lets a first page that may have written finish when closed", async () => {
    const store = new SqlCursorStore();
    let openGate = () => {};
    const gate = new Promise<void>(r => {
      openGate = r;
    });
    const src = fakeSource(Infinity, { gate });
    const first = store.page("q", 0, PAGE, async () => src);
    await new Promise(r => setImmediate(r));
    store.closeAll();
    expect(src.abandoned).toBe(false);
    openGate();
    expect((await first)?.rows).toHaveLength(PAGE + 1);
    expect(src.abandoned).toBe(true);
  });

  it("hands back a first page in flight when its connection can't write", async () => {
    const store = new SqlCursorStore();
    const src = fakeSource(Infinity, {
      writesNothing: true,
      gate: new Promise(() => {}),
    });
    const first = store.page("q", 0, PAGE, async () => src);
    await new Promise(r => setImmediate(r));
    store.closeAll();
    expect(await first).toBeUndefined();
    expect(src.abandoned).toBe(true);
  });

  it("re-runs only errors raised before the statement started", async () => {
    const store = new SqlCursorStore();
    const parse = new Error("multiple statements");
    expect(
      await store.page("a", 0, PAGE, async () =>
        fakeSource(Infinity, { error: { e: parse, notStarted: true } }),
      ),
    ).toBeUndefined();
    const exec = new Error("division by zero");
    await expect(
      store.page("b", 0, PAGE, async () =>
        fakeSource(Infinity, { error: { e: exec, notStarted: false } }),
      ),
    ).rejects.toBe(exec);
  });

  it("sends a statement's warnings once", async () => {
    const store = new SqlCursorStore();
    const src = fakeSource(2 * PAGE + 5, { warnings: ["w"] });
    const pages: Array<CursorPage | undefined> = [];
    for (let offset = 0; offset <= 2 * PAGE; offset += PAGE) {
      pages.push(await store.page("q", offset, PAGE, async () => src));
    }
    expect(pages.map(p => p?.warnings)).toEqual([[], [], ["w"]]);
  });

  it("releases a cursor that reads to the end", async () => {
    const store = new SqlCursorStore();
    const src = fakeSource(PAGE + 5);
    const page = await store.page("q", 0, PAGE, async () => src);
    expect(page?.rows).toHaveLength(PAGE + 1);
    const last = await store.page("q", PAGE, PAGE, async () => src);
    expect(last?.rows).toHaveLength(5);
    store.closeAll();
    expect(src.abandoned).toBe(false);
  });
});
