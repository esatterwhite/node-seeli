import seeli from 'seeli';

const command = new seeli.Command({name: 'typed-esm'});
const cli = new seeli.Seeli();
const names: string[] = seeli.list;

cli.use(command);
seeli.use(command);
seeli.colorize(names.join(','), 'red');
