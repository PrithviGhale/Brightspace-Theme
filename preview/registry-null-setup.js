// Local fixture only: emulate the missing registry in an isolated content-script world.
globalThis.fixtureRegistry = customElements;
Object.defineProperty(globalThis, 'customElements', {value:null,configurable:true});
