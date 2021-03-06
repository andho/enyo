(function (enyo) {
	
	//*@public
	/**
		This contains the map from autobinding API properties
		to their actual bindings API equivalent.
	*/
	var remapped = {
		bindFrom: "from",
		bindTo: "to",
		bindTransform: "transform",
		bindOneWay: "oneWay",
		bindTwoWay: "twoWay",
		bindAutoSync: "autoSync",
		bindDebug: "debug"
	};
	
	//*@public
	/**
		This contains the default properties applied to
		new bindings generated by the autobindings setup, these
		properties fill in gaps where new values are not
		supplied but do not override specified values.
	*/
	var defaults = {
		to: ".content",
		transform: null,
		oneWay: true,
		twoWay: false,
		autoSync: false,
		debug: false
	};
	
	//*@protected
	var _setup_auto_bindings = function () {
		if (!this._supports_autobindings) return;
		if (!this.controller || !(this.controller instanceof enyo.Controller)) return;
		var $bindings = this.get("_auto_bindings");
		var controls = this.get("_bindable_controls");
		var idx = 0;
		var len = controls.length;
		var controller = this.controller;
		var control;
		var props;
		if ($bindings && $bindings.length) this.clearBindings($bindings);
		for (; idx < len; ++idx) {
			control = controls[idx];
			props = this._bind_properties(control);
			this._auto_binding(props, {source: controller, target: control});
		}
	};
	
	//*@public
	/**
		The _enyo.AutoBindingSupport_ mixin provides the ability to
		define bindings from child components relative to their _owner_.
		In a component declaration (object literal hash for components)
		simple use the available auto bindings API and a binding will
		be created accordingly.
	*/
	enyo.createMixin({
	
		// ...........................
		// PUBLIC PROPERTIES
		
		//*@public
		name: "enyo.AutoBindingSupport",
	
		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		_supports_autobindings: true,
	
		// ...........................
		// COMPUTED PROPERTIES
	
		//*@protected
		_bindable_controls: enyo.computed(function (control) {
			var bindable = [];
			var control = control || this;
			var controls = control.controls || [];
			var idx = 0;
			var len = controls.length;
			for (; idx < len; ++idx) {
				bindable = bindable.concat(this._bindable_controls(controls[idx]));
			}
			if ("bindFrom" in control) bindable.push(control);
			return bindable;
		}, {cached: true}),
	
		//*@protected
		_binding_defaults: enyo.computed(function () {
			var ctor = this.get("_binding_constructor");
			var keys = enyo.keys(defaults);
			if (enyo.Binding !== ctor) {
				return enyo.mixin(enyo.clone(defaults),
					enyo.only(keys, ctor.prototype, true));
			} else return enyo.clone(defaults);
		}, {cached: true}),
		
		//*@protected
		_auto_bindings: enyo.computed(function () {
			return enyo.filter(this.bindings || [], function (bind) {
				return bind && bind._auto_binding_id;
			});
		}),
	
		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		_auto_binding: function () {
			var bind = this.binding.apply(this, arguments);
			bind._auto_binding_id = enyo.uid("_auto_binding");
		},
		
		//*@protected
		_bind_properties: function (control) {
			var props = this.get("_binding_defaults");
			return enyo.mixin(enyo.clone(props), enyo.remap(remapped, control));
		},
	
		// ...........................
		// OBSERVERS

		//*@protected
		_controller_changed: enyo.observer(function () {
			// we are intentionally overriding controller supports implementation
			// of this observer so we can call this.inherited, this observer
			// removed the previous observer
			this.inherited(arguments);
			// now that the controller should be set (if possible) we go ahead
			// and setup any auto bindings
			_setup_auto_bindings.call(this);
		}, "controller")

	});
	
}(enyo));
