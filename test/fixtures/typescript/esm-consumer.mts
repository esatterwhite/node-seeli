import seeli, {Command, Seeli, list} from 'seeli';

const command = new Command({name: 'typed-esm'});
const cli = new Seeli();
const names: string[] = list;

cli.use(command);
seeli.use(command);
seeli.colorize(names.join(','), 'red');
