import test     from 'ava';
import * as lib from '../../dist/es';
const { util } = lib.default;
const { camelize } = util.default;

test('camelize', t => {
  t.is(camelize(""),                           "");
  t.is(camelize("word"),                       "word");
  t.is(camelize("Word"),                       "word");
  t.is(camelize("WORD"),                       "word");
  t.is(camelize("word-with-dash"),             "wordWithDash");
  t.is(camelize("word_with_underscore"),       "wordWithUnderscore");
  t.is(camelize("word--with--double--dash"),   "wordWithDoubleDash");
  t.is(camelize("word_WITH_mixed_CASE"),       "wordWithMixedCase");
  t.is(camelize("alreadyCamelizedString"),     "alreadyCamelizedString");
});
