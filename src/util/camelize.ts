/**
 * camelize takes in a label and camelizes the words and removes all the _ and - characters.
 * @param label
 * @returns string The camelized string
 */
function camelize(label: string): string {
  if (label.length === 0) {
    return label;
  }

  const words: string[] = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  let result = words[0].toLowerCase();
  words.slice(1).forEach((word, el) => {
    result += word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  })

  return result;
}

/**
 * prepended adds a string before the label and camelize the whole string as a whole
 * @param prepend
 * @param label
 */
camelize.prepended = function(prepend: string, label: string): string {
  label = camelize(label);
  return prepend + label[0].toUpperCase() + label.substring(1);
}

export default camelize;