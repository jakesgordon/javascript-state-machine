
/*
 | dot prefix string will be appended to all dot output
 */
const PFXSTR = '\
  graph  [ fontcolor="dimgray", fontname="Helvetica", splines="spline" ];\n\
  node  [ color="dimgray", fontcolor="dimgray", fontname="Helvetica", fontsize="13" ];\n\
  edge  [ fontcolor="dimgray", fontname="Arial", fontsize="10" ];\
';

/*
| dot default pfx object will always be appended to dot output object
*/
const PFXOBJ = { dotPrefix: {
graph: { fontcolor: 'dimgray',
         fontname: 'Helvetica',
         splines: 'spline' },
node: { color: 'dimgray',
        fontsize: 13,
        fontcolor: 'dimgray',
        fontname: 'Helvetica' },
edge: { fontcolor: 'dimgray', fontsize: 10, fontname: 'Arial' }
}};

module.exports = { PFXSTR, PFXOBJ }