const fsm = new StateMachine({
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

const FSM = StateMachine.factory({});

const f = new FSM();
f.abc(1);
