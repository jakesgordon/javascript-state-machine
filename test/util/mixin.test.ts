//mixin.test.ts
/// <reference types="jest" />
import mixin from '../../src/util/mixin';

//-------------------------------------------------------------------------------------------------

test('mixin', () => {

  const a = { first: 'Jake',  key: 'a' },
    b = { last: 'Gordon', key: 'b' };

  expect(mixin({}, a)).toEqual({ first: 'Jake',   key: 'a' });
  expect(mixin({}, b)).toEqual({ last:  'Gordon', key: 'b' });
  expect(mixin({}, a, b)).toEqual({ first: 'Jake', last: 'Gordon', key: 'b' });
  expect(mixin({}, b, a)).toEqual({ first: 'Jake', last: 'Gordon', key: 'a' });

});

//-------------------------------------------------------------------------------------------------

test('mixin only mixes in owned properties', () => {

  const MyClass = function(this, name) { this.name = name }

  MyClass.prototype = {
    answer: 42
  }

  const a = new MyClass('a'),
    b = new MyClass('b');

  expect(a.name).toBe('a');
  expect(a.answer).toBe( 42);
  expect(b.name).toBe( 'b');
  expect(b.answer).toBe( 42);

  expect(Object.prototype.hasOwnProperty.call(a, 'name')).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(a, 'answer')).toBe(false);
  expect(Object.prototype.hasOwnProperty.call(b, 'name')).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(b, 'answer')).toBe(false);

  expect(mixin({}, a)).toEqual({ name: 'a' });
  expect(mixin({}, b)).toEqual({ name: 'b' });
  expect(mixin({}, a, b)).toEqual({ name: 'b' });
  expect(mixin({}, b, a)).toEqual({ name: 'a' });

  b.answer = 99;

  expect(a.name).toBe('a');
  expect(a.answer).toBe( 42);
  expect(b.name).toBe( 'b');
  expect(b.answer).toBe( 99);

  expect(Object.prototype.hasOwnProperty.call(a, 'name')).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(a, 'answer')).toBe(false);
  expect(Object.prototype.hasOwnProperty.call(b, 'name')).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(b, 'answer')).toBe(true);

  expect(mixin({}, a)).toEqual({ name: 'a' });
  expect(mixin({}, b)).toEqual({ name: 'b', answer: 99 });
  expect(mixin({}, a, b)).toEqual({ name: 'b', answer: 99 });
  expect(mixin({}, b, a)).toEqual({ name: 'a', answer: 99 });

});

export {};