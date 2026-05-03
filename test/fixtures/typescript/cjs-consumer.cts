import seeli = require('seeli');

const command = new seeli.Command({name: 'typed-cjs'});
const cli = new seeli.Seeli();

cli.use(command);
seeli.red('ok');
