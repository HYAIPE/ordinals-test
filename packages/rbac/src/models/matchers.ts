export interface MatcherDefinition<T> {
  matcher: (item: T) => boolean;
  describe: (item: T, matcher: Matcher<T>) => string;
}

export interface Matcher<T> {
  (item: T): boolean;
  describe: (item: T) => string;
}

export function createMatcher<T>({
  matcher,
  describe,
}: MatcherDefinition<T>): Matcher<T> {
  const m = (item: T) => matcher(item);
  m.describe = (item: T): string => {
    if (typeof describe !== "function") {
      return m.toString();
    }
    return describe(item, m);
  };
  return m;
}

export function and<T>(...matchers: Matcher<T>[]): Matcher<T> {
  return createMatcher({
    matcher(value) {
      return matchers.every((m) => m(value));
    },
    describe(value) {
      return `(${matchers.map((m) => m.describe(value)).join(" AND ")})`;
    },
  });
}

export function or<T>(...matchers: Matcher<T>[]): Matcher<T> {
  return createMatcher({
    matcher(value) {
      return matchers.some((m) => m(value));
    },
    describe(value) {
      return `(${matchers.map((m) => m.describe(value)).join(" OR ")})`;
    },
  });
}

export function not<T>(matcher: Matcher<T>): Matcher<T> {
  return createMatcher({
    matcher(value) {
      return !matcher(value);
    },
    describe(value) {
      return `!(${matcher.describe(value)})`;
    },
  });
}

export function eq<T>(source: T): Matcher<T> {
  return createMatcher({
    matcher(value) {
      return source === value;
    },
    describe(value) {
      return `${source} === ${value}`;
    },
  });
}

export function oneOf<T>(matcher: Matcher<T>): Matcher<T[]> {
  return createMatcher({
    matcher(values) {
      return values.some((v) => matcher(v));
    },
    describe(values) {
      return `(${values.map((v) => matcher.describe(v)).join(" OR ")})`;
    },
  });
}

export function allOf<T>(matcher: Matcher<T>): Matcher<T[]> {
  return createMatcher({
    matcher(values) {
      return values.every((v) => matcher(v));
    },
    describe(values) {
      return `(${values.map((v) => matcher.describe(v)).join(" AND ")})`;
    },
  });
}
