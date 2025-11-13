define(["brease"], function({core:{designer:{BaseWidget:{ClassInfo:s}}}}, e) {const classInfo={meta:{className:"widgets.3dviewer.ThreejsViewer",parents:["*"],children:[],inheritance:["widgets.3dviewer.ThreejsViewer","brease.core.BaseWidget"],creator:"304d7ca4172970fc3aa5dbc694517cce",eventBindingApi:function (w) {
function a(e, f) { w.addServerEventListener(e, f); }
function c(...args) { const [{ action: a }] = args.slice(-1); return w[a](...args); }
return {
click: f => a('Click', f),
disabledClick: f => a('DisabledClick', f),
enableChanged: f => a('EnableChanged', f),
focusIn: f => a('FocusIn', f),
focusOut: f => a('FocusOut', f),
sceneLoaded: f => a('SceneLoaded', f),
transformDone: f => a('TransformDone', f),
visibleChanged: f => a('VisibleChanged', f),
focus: function () { c({ origin: 'action', action: 'focus' }); },
getSceneLoaded: function () { return c({ origin: 'action', action: 'getSceneLoaded' }); },
getTransform: function () { return c({ origin: 'action', action: 'getTransform' }); },
playScene: function () { c({ origin: 'action', action: 'playScene' }); },
playScript: function (a1) { c(a1,{ origin: 'action', action: 'playScript' }); },
setEnable: function (a1) { c(a1,{ origin: 'action', action: 'setEnable' }); w._ebFVC({enable: 'getEnable'}, false);},
setStyle: function (a1) { c(a1,{ origin: 'action', action: 'setStyle' }); w._ebFVC({style: 'getStyle'}, false);},
setTransform: function (a1) { c(a1,{ origin: 'action', action: 'setTransform' }); w._ebFVC({transform: 'getTransform'}, false);},
setVisible: function (a1) { c(a1,{ origin: 'action', action: 'setVisible' }); w._ebFVC({visible: 'getVisible'}, false);},
showTooltip: function () { c({ origin: 'action', action: 'showTooltip' }); },
stopScene: function () { c({ origin: 'action', action: 'stopScene' }); },
stopScript: function (a1) { c(a1,{ origin: 'action', action: 'stopScript' }); }
};
},actions:{"Focus":{"method":"focus"},"GetSceneLoaded":{"method":"getSceneLoaded"},"GetTransform":{"method":"getTransform"},"PlayScene":{"method":"playScene"},"PlayScript":{"method":"playScript","parameter":{"scriptName":{"name":"scriptName","index":0,"type":"String"}}},"setAdditionalStyle":{"method":"setAdditionalStyle","parameter":{"styleName":{"name":"styleName","index":0,"type":"StyleReference"}}},"setBindAttribute":{"method":"setBindAttribute","parameter":{"path":{"name":"path","index":0,"type":"String"},"attribute":{"name":"attribute","index":1,"type":"String"},"value":{"name":"value","index":2,"type":"Object"}}},"setEditable":{"method":"setEditable","parameter":{"editable":{"name":"editable","index":0,"type":"Boolean"},"metaData":{"name":"metaData","index":1,"type":"Object"}}},"SetEnable":{"method":"setEnable","parameter":{"value":{"name":"value","index":0,"type":"Boolean"}}},"setOmitDisabledClick":{"method":"setOmitDisabledClick"},"setParentCoWiId":{"method":"setParentCoWiId","parameter":{"value":{"name":"value","index":0,"type":"String"}}},"setParentEnableState":{"method":"setParentEnableState"},"setParentVisibleState":{"method":"setParentVisibleState"},"setSceneLoaded":{"method":"setSceneLoaded","parameter":{"value":{"name":"value","index":0,"type":"Boolean"}}},"SetStyle":{"method":"setStyle","parameter":{"value":{"name":"value","index":0,"type":"StyleReference"}}},"setTabIndex":{"method":"setTabIndex","parameter":{"value":{"name":"value","index":0,"type":"Number"}}},"SetTransform":{"method":"setTransform","parameter":{"value":{"name":"value","index":0,"type":"String"}}},"SetVisible":{"method":"setVisible","parameter":{"value":{"name":"value","index":0,"type":"Boolean"}}},"ShowTooltip":{"method":"showTooltip"},"StopScene":{"method":"stopScene"},"StopScript":{"method":"stopScript","parameter":{"scriptName":{"name":"scriptName","index":0,"type":"String"}}}},properties:{}}};if(s.classExtension) {classInfo.classExtension = s.classExtension;}if(e) {classInfo.classExtension = e;}return classInfo;});
