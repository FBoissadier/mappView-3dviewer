define(['widgets/brease/FileManager/Test/UnitTest/mSpecUnitFileManager', 
    'widgets/brease/FileManager/Test/UnitTest/cSpecUnitFileManager', 
    'widgets/brease/common/libs/Test/TestUtils',
    'widgets/brease/common/libs/Test/Jasmine-moduleTest'], 
function (mSpecUnit, cSpecUnit, wfTestUtils) {    

    'use strict';

    var widgetName = 'FileManager',
        libPath = 'widgets.brease.';

    describe(wfTestUtils.specPath(widgetName, libPath), function () {
        m.describe(true, 'Unit test', mSpecUnit.suite, [cSpecUnit]);
    });
});
