'use strict';
define(['brease'], function ({ datatype: { StructuredProperty: SuperClass }, services : { logger} }) {

    /**
    * @class widgets.3dviewer.StructProp.BindAttribute
    * Defines one binding property for the scene object BindAttribute.
    * @extends brease.datatype.StructuredProperty
    * @embeddedClass
    * @virtualNote
    */

    /**
     * @cfg {Number} value=0
     * Value of the transformation attribute.
     * @bindable
     * @not_projectable
     * @iatStudioExposed
     * @iatCategory Data
     */

    /**
     * @cfg {String} componentName=''
     * Defines the name of the 3d object in the scene that is being represented.
     * @iatStudioExposed
     * @iatCategory Behaviour
     */

    /**
     * @cfg {String} attributeName=''
     * Defines the attribute name of the row, can be (posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, visible).
     * @iatStudioExposed
     * @iatCategory Behaviour
     */

    const defaultSettings = {
        value: 0,
        componentName: '',
        attributeName: ''
    };

    let BindAttribute = SuperClass.extend(function (id, options, widgetId, propName, widgetInstance) {
        this.widgetInstance = widgetInstance;
        SuperClass.call(this, id, options, widgetId, propName);
    }, defaultSettings);

    let p = BindAttribute.prototype;
    
    p.init = function () {

    };

    p.dispose = function () {
        this.el.remove();
        SuperClass.prototype.dispose.apply(this, arguments);
    };

    p.setValue = function (value) {
        this.settings.value = value;
        if (this.widgetInstance.getSceneLoaded()) {
            if (this._validationProperties()) {
                var transform = this._generateTransformImmediate();
                var targets = this.widgetInstance._controller._getTransformTargets(this.getComponentName()); // updates the available components

                targets.forEach((target) => {
                    if (transform.immediate) {
                        this.widgetInstance._controller._applyImmediateTransform(target, transform);
                    }
                });
                
            }
        }
    };

    p.getValue = function () {
        return this.settings.value;
    };

    p.getComponentName = function () {
        return this.settings.componentName;
    };

    p.getAttributeName = function () {
        return this.settings.attributeName;
    };

    p._validationProperties = function () {
        /*
        Validate componentName exist in the scene
        Validate attributeName is one of (posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, visible)
        Validate value is a number (for visible boolean)
        */
        var targets = this.widgetInstance._controller._getTransformTargets(this.getComponentName()); // updates the available components
        if (targets.length === 0) {
            logger.log(
                6010,
                brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                brease.enum.Enum.EventLoggerSeverity.ERROR,
                [],
                "Component name does not exist in the scene. WidgetId: " +
                this.getId()
            );
            return false; // componentName does not exist in the scene
        }
        const validAttributes = ['posX', 'posY', 'posZ', 'rotX', 'rotY', 'rotZ', 'scaleX', 'scaleY', 'scaleZ', 'visible'];
        if (validAttributes.indexOf(this.settings.attributeName) === -1) {
            logger.log(
                6011,
                brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                brease.enum.Enum.EventLoggerSeverity.ERROR,
                [],
                `Attribute name (${this.settings.attributeName}) is not valid. WidgetId: ` +
                this.getId()
            );
            return false;
        }
        if (this.settings.attributeName === 'visible') {
            if (typeof this.settings.value !== 'boolean') {
                logger.log(
                    6012,
                    brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                    brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                    brease.enum.Enum.EventLoggerSeverity.ERROR,
                    [],
                    `Value for 'visible' attribute must be a boolean. WidgetId: ` +
                    this.getId()
                );
                return false;
            }
        } else {
            if (isNaN(this.settings.value)) {
                logger.log(
                    6013,
                    brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                    brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                    brease.enum.Enum.EventLoggerSeverity.ERROR,
                    [],
                    `Value for attribute (${this.settings.attributeName}) must be a number. WidgetId: ` +
                    this.getId()
                );
                return false;
            }
        }
        return true;
    };

    p._generateTransformImmediate = function () {
        var transform = {};
        transform["target"] = this.getComponentName();

        switch (this.getAttributeName()) {
            case 'posX':
            case 'posY':
            case 'posZ':
                transform["position"] = {};
                transform["position"][this.getAttributeName().charAt(3).toLowerCase()] = this.getValue();
                break;

            case 'rotX':
            case 'rotY':
            case 'rotZ':
                transform["rotation"] = {};
                transform["rotation"][this.getAttributeName().charAt(3).toLowerCase()] = this.getValue();
                break;

            case 'scaleX':
            case 'scaleY':
            case 'scaleZ':
                transform["scale"] = {};
                transform["scale"][this.getAttributeName().charAt(5).toLowerCase()] = this.getValue();
                break;

            case 'visible':
                transform["visible"] = this.getValue();
                break;
        
            default:
                break;
        }
        transform["immediate"] = true;
        return transform;
    };

    return BindAttribute;
});
