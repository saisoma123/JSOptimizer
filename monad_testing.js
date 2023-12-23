class Maybe {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  bind(fn) {
    if (this.value == null) {
      return Maybe.of(null);
    } else {
      try {
        return Maybe.of(fn(this.value));
      } catch (e) {
        return Maybe.of(null);
      }
    }
  }

  getValue() {
    return this.value;
  }
}

function expensiveOperation1(obj) {
  for (let i = 0; i < 100000; i++) { }
  return obj && obj.step1 ? obj.step1() : null;
}

function expensiveOperation2(obj) {
  for (let i = 0; i < 100000; i++) { }
  return obj && obj.step2 ? obj.step2() : null;
}

function expensiveOperation3(obj) {
  for (let i = 0; i < 100000; i++) { }
  return obj && obj.step3 ? obj.step3() : null;
}

function traditionalChaining(obj) {
  let result = expensiveOperation1(obj);
  if (result === null) return null;
  result = expensiveOperation2(result);
  if (result === null) return null;
  return expensiveOperation3(result);
}

function monadicChaining(obj) {
  return Maybe.of(obj)
    .bind(expensiveOperation1)
    .bind(expensiveOperation2)
    .bind(expensiveOperation3)
    .getValue();
}

function benchmark(func, testObj, iterations = 1000) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    func(testObj);
  }

  const end = performance.now();
  return end - start;
}

const testObj = { step1: () => null };

const traditionalTime = benchmark(traditionalChaining, testObj);
const monadicTime = benchmark(monadicChaining, testObj);

console.log(`Traditional Chaining: ${traditionalTime} ms`);
console.log(`Monadic Chaining: ${monadicTime} ms`);
