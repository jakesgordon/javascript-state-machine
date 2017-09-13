import * as StateMachine from './state-machine';

var fsm = new StateMachine({
	transitions: [
		{ name: 'melt', from: 'solid', to: 'liquid' },
		{ name: 'freeze', from: 'liquid', to: 'solid' },
		{ name: 'vaporize', from: 'liquid', to: 'gas' },
		{ name: 'condense', from: 'gas', to: 'liquid' }
	],
	methods: {
		onMelt: function () { console.log('I melted') },
		onFreeze: function () { console.log('I froze') },
		onVaporize: function () { console.log('I vaporized') },
		onCondense: function () { console.log('I condensed') }
	}
});

var Matter = StateMachine.factory({     //  <-- the factory is constructed here
	init: 'solid',
	transitions: [
		{ name: 'melt', from: 'solid', to: 'liquid' },
		{ name: 'freeze', from: 'liquid', to: 'solid' },
		{ name: 'vaporize', from: 'liquid', to: 'gas' },
		{ name: 'condense', from: 'gas', to: 'liquid' }
	]
});

var a = new Matter(),    //  <-- instances are constructed here
	b = new Matter(),
	c = new Matter();

function Person(name) {
	this.name = name;
	this._fsm(); //  <-- IMPORTANT
}

Person.prototype = {
	speak: function () {
		console.log('my name is ' + this.name + ' and I am ' + this.state);
	}
}

StateMachine.factory(Person, {
	init: 'idle',
	transitions: [
		{ name: 'sleep', from: 'idle', to: 'sleeping' },
		{ name: 'wake', from: 'sleeping', to: 'idle' }
	]
});

var amy = new Person('amy'),
	bob = new Person('bob');

bob.sleep();

amy.state;   // 'idle'
bob.state;   // 'sleeping'

amy.speak(); // 'my name is amy and I am idle'
bob.speak(); // 'my name is bob and I am sleeping'