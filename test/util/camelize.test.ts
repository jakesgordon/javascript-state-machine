//camelize.test.ts
/// <reference types="jest" />
import camelize from '../../src/util/camelize';

test('camelize', () => {
  expect(camelize("")).toBe("");
  expect(camelize("word")).toBe("word");
  expect(camelize("Word")).toBe("word");
  expect(camelize("WORD")).toBe("word");
  expect(camelize("word-with-dash")).toBe("wordWithDash");
  expect(camelize("word_with_underscore")).toBe("wordWithUnderscore");
  expect(camelize("word--with--double--dash")).toBe("wordWithDoubleDash");
  expect(camelize("word_WITH_mixed_CASE")).toBe("wordWithMixedCase");
  expect(camelize("alreadyCamelizedString")).toBe("alreadyCamelizedString");
});

export {};