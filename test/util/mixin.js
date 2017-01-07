import test from 'ava';
import mixin from '../../src/util/mixin';

//-------------------------------------------------------------------------------------------------

test('mixin', t => {

  var a = { first: 'Jake',  key: 'a' },
      b = { last: 'Gordon', key: 'b' };

  t.deepEqual(mixin({}, a),    { first: 'Jake',   key: 'a' });
  t.deepEqual(mixin({}, b),    { last:  'Gordon', key: 'b' });
  t.deepEqual(mixin({}, a, b), { first: 'Jake', last: 'Gordon', key: 'b' });
  t.deepEqual(mixin({}, b, a), { first: 'Jake', last: 'Gordon', key: 'a' });

});

//-------------------------------------------------------------------------------------------------

test('mixin only mixes in owned properties', t => {

  var MyClass = function(name) { this.name = name }

  MyClass.prototype = {
    answer: 42
  }

  var a = new MyClass('a'),
      b = new MyClass('b');

  t.is(a.name,  'a');
  t.is(a.answer, 42);
  t.is(b.name,   'b');
  t.is(b.answer, 42);

  t.is(a.hasOwnProperty('name'),   true);
  t.is(a.hasOwnProperty('answer'), false);
  t.is(b.hasOwnProperty('name'),   true);
  t.is(b.hasOwnProperty('answer'), false);

  t.deepEqual(mixin({}, a),    { name: 'a' });
  t.deepEqual(mixin({}, b),    { name: 'b' });
  t.deepEqual(mixin({}, a, b), { name: 'b' });
  t.deepEqual(mixin({}, b, a), { name: 'a' });

  b.answer = 99;

  t.is(a.name,  'a');
  t.is(a.answer, 42);
  t.is(b.name,   'b');
  t.is(b.answer, 99);

  t.is(a.hasOwnProperty('name'),   true);
  t.is(a.hasOwnProperty('answer'), false);
  t.is(b.hasOwnProperty('name'),   true);
  t.is(b.hasOwnProperty('answer'), true);

  t.deepEqual(mixin({}, a),    { name: 'a'             });
  t.deepEqual(mixin({}, b),    { name: 'b', answer: 99 });
  t.deepEqual(mixin({}, a, b), { name: 'b', answer: 99 });
  t.deepEqual(mixin({}, b, a), { name: 'a', answer: 99 });

});

//-------------------------------------------------------------------------------------------------
