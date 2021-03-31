//FizzBuzz.test.ts
/// <reference types="jest" />
function fizzBuzz(n: number): string {
  let output = "";
  for (let i = 1; i <= n; i++) {
    if (i % 5 && i % 3) {
      output += i + ' ';
    }
    if (i % 3 === 0) {
      output += 'Fizz ';
    }
    if (i % 5 === 0) {
      output += 'Buzz ';
    }
  }
  return output;
}

// import {fizzBuzz} from "./fizzBuzz";
test("FizzBuzz test", () =>{
  expect(fizzBuzz(2)).toBe("1 2 ");
  expect(fizzBuzz(3)).toBe("1 2 Fizz ");
});

export {};
