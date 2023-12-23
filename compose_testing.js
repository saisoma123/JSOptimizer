function complexFunctionA(x) {
  return Array.from({ length: x }, (_, i) => i);
}

function complexFunctionB(arr) {
  return arr.filter(num => num % 3 === 0);
}

function complexFunctionC(arr) {
  return arr.reduce((acc, num) => acc + num, 0); // Sums up the array
}

// Original nested function calls
function originalNestedCalls(data) {
  return complexFunctionC(complexFunctionB(complexFunctionA(data)));
}

// Transformed function call using composeMultiple
function composeMultiple(...funcs) {
  return function (data) {
    return funcs.reduceRight((acc, currFunc) => currFunc(acc), data);
  };
}

const transformedNestedCalls = composeMultiple(complexFunctionC, complexFunctionB, complexFunctionA);

// Benchmarking function
function benchmark(func, testData, iterations = 1000) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    func(testData);
  }

  const end = performance.now();
  return end - start;
}

// Generate test data
const testData = 1000; // This is the initial value to be passed to the functions

const originalTime = benchmark(originalNestedCalls, testData);
const transformedTime = benchmark(transformedNestedCalls, testData);

console.log(`Original Nested Calls: ${originalTime} ms`);
console.log(`Transformed Calls with composeMultiple: ${transformedTime} ms`);
