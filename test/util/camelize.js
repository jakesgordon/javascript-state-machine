import test     from 'ava';
import camelize from '../../src/util/camelize';

test('camelize', t => {
  t.is(camelize(""),                           "");
  t.is(camelize("word"),                       "word");
  t.is(camelize("Word"),                       "Word");
  t.is(camelize("WORD"),                       "WORD");
  t.is(camelize("word-with-dash"),             "wordWithDash");
  t.is(camelize("word_with_underscore"),       "wordWithUnderscore");
  t.is(camelize("word--with--double--dash"),   "wordWithDoubleDash");
  t.is(camelize("word_WITH_mixed_CASE"),       "wordWITHMixedCASE");
  t.is(camelize("alreadyCamelized"),           "alreadyCamelized");
});
