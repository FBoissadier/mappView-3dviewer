define(function () {

    'use strict';

    var specList = {
        widgetNames: {
            defaultWidget: 'FESVirt_FileManager'
        },
        functions: {
            run: true,
            instantiate: {
                run: true,
                createsingleton: {
                    run: true
                },
                usesingleton: {
                    run: true
                }
            },
            createWidget: {
                run: true,
                createsingleton: {
                    run: true,
                    expect: {
                        mpLink: 'FileManagement'
                    }
                },
                usesingleton: {
                    run: true
                }
            },
            init: {
                run: true,
                expect: {
                    isError: false,
                    isConnected: false,
                    errorMessage: '',
                    promises: {},
                    classAdded: 'breaseFileManager',
                    chunkSize: 100 * 1024
                }
            },
            browse: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test',
                    flags: ''
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Browse',
                    params: {
                        Path: 'C:\\DEV\\Test',
                        Flags: ''
                    }
                }
            },
            load: {
                run: true,
                small: {
                    run: true,
                    params: {
                        path: 'C:\\DEV\\Test',
                        flags: '',
                        enc: 'UTF-8',
                        ms: 2000,
                        offset: 0
                    },
                    expect: {
                        elemId: 'FESVirt_FileManager',
                        methodId: 'Load',
                        params: {
                            Path: 'C:\\DEV\\Test',
                            Flags: '',
                            Encoding: 'UTF-8',
                            MaxSize: 2000,
                            Offset: 0
                        }
                    }
                },
                large: {
                    run: true,
                    params: {
                        path: 'C:\\DEV\\Test',
                        flags: '',
                        enc: 'UTF-8',
                        ms: 120 * 1024,
                        offset: 0
                    },
                    expect: {
                        elemId: 'FESVirt_FileManager',
                        methodId: 'Load',
                        params: {
                            Path: 'C:\\DEV\\Test',
                            Flags: '',
                            Encoding: 'UTF-8',
                            MaxSize: 100 * 1024,
                            Offset: 0
                        }
                    }
                }
            },
            notification: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test',
                    flags: ''
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Notification',
                    params: {
                        Path: 'C:\\DEV\\Test',
                        Flags: ''
                    }
                }
            },
            denotification: {
                run: false,
                params: {
                    path: 'C:\\DEV\\Test'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Denotification',
                    params: {
                        Path: 'C:\\DEV\\Test'
                    }
                }
            },
            restriction: {
                run: true,
                params: {
                    comp: '_CNCEditor'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Restriction',
                    params: {
                        Component: '_CNCEditor'
                    }
                }
            },
            error: {
                run: true,
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'ErrorDetails',
                    params: {}
                }
            },
            save: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test',
                    flags: '',
                    enc: 'UTF-8',
                    data: '0'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Save',
                    params: {
                        Path: 'C:\\DEV\\Test',
                        Flags: '',
                        Encoding: 'UTF-8'
                    },
                    data: '0'
                }
            },
            delete: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Delete',
                    params: {
                        Path: 'C:\\DEV\\Test'
                    }
                }
            },
            rename: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test',
                    name: 'NewTest',
                    flags: ''
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Rename',
                    params: {
                        Path: 'C:\\DEV\\Test',
                        Name: 'NewTest',
                        Flags: ''
                    }
                }
            },
            copy: {
                run: true,
                params: {
                    source: 'C:\\DEV\\Test',
                    destination: 'C:\\DEV\\Test2',
                    flags: ''
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Copy',
                    params: {
                        Source: 'C:\\DEV\\Test',
                        Dest: 'C:\\DEV\\Test2',
                        Flags: ''
                    }
                }
            },
            lock: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Lock',
                    params: {
                        Path: 'C:\\DEV\\Test'
                    }
                }
            },
            clearFlags: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'ClearFlags',
                    params: {
                        Path: 'C:\\DEV\\Test'
                    }
                }
            },
            createFolder: {
                run: true,
                params: {
                    path: 'C:\\DEV\\Test\\NewFolder\\'
                },
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'CreateFolder',
                    params: {
                        Path: 'C:\\DEV\\Test\\NewFolder\\'
                    }
                }
            },
            _handleGetter: {
                run: true,
                default: {
                    run: true,
                    methodId: 'Something',
                    params: {},
                    expect: {
                        elemId: 'FESVirt_FileManager',
                        methodId: 'Something',
                        params: {
                            elemId: 'FESVirt_FileManager' },
                        data: undefined
                    }
                },
                rapid: {
                    methodId: 'Something',
                    params: {
                        Path: 'Dev/Tools/Path.st'
                    },
                    expect: {
                        elemId: 'FESVirt_FileManager',
                        methodId: 'Something',
                        params: {
                            elemId: 'FESVirt_FileManager',
                            Path: 'Dev/Tools/Path.st'
                        },
                        data: undefined,
                        elemId2: 'FESVirt_FileManager', 
                        methodId2: 'Something', 
                        error: { error: { code: -120202020, text: 'Loading of data from Dev/Tools/Path.st abruptly halted' } }, 
                        methodcall: 'reject'
                    }
                }
            },
            _handleSetter: {
                run: true,
                methodId: 'Something',
                params: {},
                data: 123456789,
                expect: {
                    elemId: 'FESVirt_FileManager',
                    methodId: 'Something',
                    params: {
                        elemId: 'FESVirt_FileManager' },
                    data: 123456789
                }
            },
            _widgetReadyHandler: {
                rightId: {
                    run: true,
                    event: {
                        target: {
                            id: 'FESVirt_FileManager'
                        }
                    }
                },
                wrongId: {
                    run: true,
                    event: {
                        target: {
                            id: 'FESVirt_FileManager_wrong'
                        }
                    }
                }
            },
            setMpLink: {
                run: true,
                telegram: {
                    widgetId: 'FESVirt_FileManager'
                },
                expect: {
                    telegram: {
                        widgetId: 'FESVirt_FileManager'
                    }
                }
            },
            getMpLink: {
                run: true,
                expect: {
                    mpLink: 'FileManagement'
                }
            },
            removePromises: {
                run: true,
                expect: {
                    promises: {}
                }
            },
            addPromises: {
                run: true,
                expect: {
                    promises: {
                        Browse: {},
                        Load: {},
                        Restriction: {},
                        ErrorDetails: {},
                        Save: {},
                        Delete: {},
                        Rename: {},
                        Lock: {},
                        ClearFlags: {},
                        CreateFolder: {},
                        Copy: {},
                        Subcriptions: {}
                    }
                }
            },
            _getPromise: {
                run: true,
                correctID: {
                    run: true,
                    methodId: 'Browse'
                },
                incorrectID: {
                    run: true,
                    message: { message: 'Wrong' },
                    methodId: 'Something Wrong',
                    expect: 'Wrong'
                },
                errorState: {
                    run: true,
                    message: { message: 'Wrong' },
                    methodId: 'Browse',
                    expect: 'Wrong'
                }
            },
            _return: {
                run: true,
                resolve: {
                    run: true,
                    methodId: 'Browse',
                    message: 'Browse',
                    telegram: {
                        parameter: {
                            elemId: 'FESVirt_FileManager'
                        },
                        data: ['Data'],
                        methodID: 'Browse'
                    },
                    expect: {
                        data: ['Data'],
                        id: 'FESVirt_FileManager',
                        methodId: 'Browse',
                        resolver: 'resolve'
                    }
                },
                geterror: {
                    run: true,
                    methodId: 'Browse',
                    message: 'GetError',
                    telegram: {
                        parameter: {
                            elemId: 'FESVirt_FileManager'
                        },
                        data: ['Data'],
                        methodID: 'Browse'
                    },
                    expect: {
                        telegram: {
                            parameter: {
                                elemId: 'FESVirt_FileManager'
                            },
                            data: ['Data'],
                            methodID: 'Browse'
                        },
                        id: 'FESVirt_FileManager',
                        methodId: 'Browse',
                        resolver: 'reject'
                    }
                },
                seterror: {
                    run: true,
                    methodId: 'Browse',
                    message: 'SetError',
                    telegram: {
                        parameter: {
                            elemId: 'FESVirt_FileManager'
                        },
                        data: ['Data'],
                        methodID: 'Browse'
                    },
                    expect: {
                        telegram: {
                            parameter: {
                                elemId: 'FESVirt_FileManager'
                            },
                            data: ['Data'],
                            methodID: 'Browse'
                        },
                        id: 'FESVirt_FileManager',
                        methodId: 'Browse',
                        resolver: 'reject'
                    }
                },
                loadChunks: {
                    run: true,
                    methodId: 'Load',
                    message: 'Load',
                    telegram: {
                        parameter: {
                            elemId: 'FESVirt_FileManager'
                        },
                        data: ['Data'],
                        methodID: 'Load'
                    },
                    expect: {
                        telegram: {
                            parameter: {
                                elemId: 'FESVirt_FileManager'
                            },
                            data: ['Data'],
                            methodID: 'Load'
                        }
                    }
                }
            },
            _handlePromise: {
                run: true,
                resolve: {
                    run: true,
                    methodId: 'Browse',
                    elemId: 'FESVirt_FileManager',
                    data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                    resolveType: 'resolve',
                    expect: {
                        data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                        empty: {}
                    }
                },
                reject: {
                    run: true,
                    methodId: 'Browse',
                    elemId: 'FESVirt_FileManager',
                    data: { message: 'We got rejected, again!' },
                    resolveType: 'reject',
                    expect: {
                        telegram: { message: 'We got rejected, again!' },
                        empty: {}
                    }
                }
            },
            _loadingChunks: {
                run: true,
                neof: {
                    run: true,
                    telegram: {
                        methodID: 'Load',
                        parameter: {
                            elemId: 'FESVirt_FileManager', 
                            Path: 'Path/to/file%20here.csv', 
                            Flags: 'LOCK', 
                            Encoding: 'UTF8', 
                            Offset: 0
                        },
                        data: {
                            Content: '50000 bytes read ',
                            Eof: false,
                            BytesRead: 50000
                        }
                    },
                    expect: {
                        data: '50000 bytes read ',
                        elemId: 'FESVirt_FileManager', 
                        path: 'Path/to/file%20here.csv', 
                        flags: 'LOCK', 
                        enc: 'UTF8', 
                        ms: 102400, 
                        offset: 50000
                    }
                },
                eof: {
                    run: true,
                    telegram: {
                        methodID: 'Load',
                        parameter: {
                            elemId: 'FESVirt_FileManager',
                            Path: 'Path/to/file%20here.csv', 
                            Flags: 'LOCK', 
                            Encoding: 'UTF8',
                            Offset: 0
                        },
                        data: {
                            Content: '50000 bytes read',
                            Eof: true,
                            BytesRead: 50000
                        }
                    },
                    expect: {
                        data: '50000 bytes read 50000 bytes read',
                        elemId: 'FESVirt_FileManager', 
                        resolve: 'resolve',
                        methodID: 'Load'
                    }
                }
            },
            _subscribeUpdate: {
                run: true
            },
            _onError: {
                run: true
            },
            setUpMpLinkConnection: {
                run: true,
                default: {
                    run: true,
                    expect: {
                        isConnected: true,
                        isError: false,
                        errorMessage: '',
                        content1: 'FESVirt', 
                        visu1: 'MockedVisu', 
                        content2: 'FESVirt', 
                        visu2: 'MockedVisu'
                    }
                },
                failVirtualContent: {
                    run: true,
                    message: {
                        message: 'The virtual content failed' 
                    },
                    expect: {
                        isConnected: false,
                        isError: true,
                        errorMessage: {
                            message: 'The virtual content failed' 
                        },
                        content2: 'FESVirt', 
                        visu2: 'MockedVisu', 
                        content1: undefined, 
                        visu1: undefined
                    }
                },
                failBinding: {
                    run: true,
                    message: {
                        message: 'The bindings are failing'
                    },
                    expect: {
                        isConnected: false,
                        isError: true,
                        errorMessage: {
                            message: 'The bindings are failing'
                        },
                        content1: 'FESVirt', 
                        visu1: 'MockedVisu', 
                        content2: 'FESVirt', 
                        visu2: 'MockedVisu'
                    }
                }
            }
        }
    };

    return specList;
});
