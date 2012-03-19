$(function() {
    function nodeTitle(node) {
        return '<span class="node-title">'
            + (node.name.length > 0 ? ('<span class="node-name">' + node.name + '</span>') : '')
            + (node.summary.length > 0 ? (' <span class="node-summary">(' + node.summary + ')</span>') : '')
            + '</span><span class="node-table">'
            + '<span class="node-data">' + (node.rw != null ? mimeType[node.mime].preview(node.data) : '<span class="no-access">нет доступа</span>') + '</span>'
            + '<span class="node-version">' + node.version + '</span>'
            + '<span class="node-mtime">' + node.mtime + '</span>'
            + '</span>';
    }

    function onHashChange () {
        if (window.location.hash.length > 0) {
            var path = window.location.hash.replace(/^#/, '');
            var paths = [];
            var chunks = path.split(/\//);
            while (chunks.length > 1) {
                paths.unshift('#node-' + chunks.join('/').replace(/([\/:\.])/g,'\\$1'));
                chunks.pop();
            }
            var node_path = paths.pop();
            var parent_path = '#node-\\/';
            var success = function () {
                if (paths.length > 0) {
                    parent_path = paths.shift();
                    $('#tree').jstree('open_node', parent_path, success);
                } else if ($('#tree').jstree('is_open', parent_path)) {
                    $('#tree').jstree('select_node', node_path, true);
                } else {
                    $('#tree').one('after_open.jstree', function () {
                        $('#tree').jstree('select_node', node_path, true);
                    });
                }
            }
            success();
        }
    }

    $.validationEngineLanguage.allRules.nodeName = {
        regex: /^[a-z0-9\-]+$/,
        alertText: '* Только строчные латинские буквы, цифры и дефис'
    };

    $('#tree').jstree({
        plugins: ['json_data', 'types', 'ui', 'contextmenu', 'sort', 'search', 'themes'],
        core: {
            html_titles: true,
            animation: 100
        },
        json_data: {
            data: function ($node, success) {
                var tree = this;
                $.get(
                    '/config' + ($node != -1 ? $node.data('node').path : '/'),
                    {},
                    function (data) {
                        var children = [];
                        $.each(data.children || [], function (id, child) {
                            children.push({
                                data: nodeTitle(child),
                                attr: { id: 'node-' + child.path, rel: child.mime },
                                metadata: { node: child },
                                state: child.num_children == 0 ? null : 'closed'
                            });
                        });
                        delete data.children;
                        if (data.path == '/') {
                            $.each(children, function (id, child) { child.attr.rel = 'project' });
                        }
                        if ($node == -1) {
                            success.call(tree, {
                                data: nodeTitle(data),
                                attr: { id: 'node-' + data.path, rel: 'root' },
                                metadata: { node: data },
                                state: 'open',
                                children: children
                            });
                        } else {
                            success.call(tree, children);
                            tree.rename_node($node, nodeTitle(data));
                            $node.data('node', data);
                            $('#node-dialog').node_dialog('refresh');
                        }
                    }
                );
            }
        },
        types: {
            valid_children: ['root'],
            max_children: 1,
            types: {
                default: {
                    icon: { image: '/css/type/default.png' },
                },
                root: {
                    icon: { image: '/css/type/root.png' },
                    valid_children: ['project']
                },
                project: {
                    icon: { image: '/css/type/project.png' }
                },
                "application/x-symlink": {
                    icon: { image: '/css/type/symlink.png' }
                },
                "application/json": {
                    icon: { image: '/css/type/struct.png' }
                },
                "application/x-yaml": {
                    icon: { image: '/css/type/struct.png' }
                },
                "text/plain": {
                    icon: { image: '/css/type/text.png' }
                },
                "application/x-case": {
                    icon: { image: '/css/type/case.png' }
                }
            }
        },
        ui: { select_limit: 1 },
        contextmenu: {
            select_node: true,
            items: function(node) {
                return {
                    refresh: {
                        label: 'Обновить',
                        separator_after: true,
                        action: function(node) {
                            this.refresh(node);
                        }
                    },
                    open_all: {
                        label: 'Развернуть все',
                        _disabled: this.is_leaf(node),
                        action: function(node) {
                            this.open_all(node);
                        }
                    },
                    close_all: {
                        label: 'Свернуть все',
                        separator_after: true,
                        _disabled: !this.is_open(node),
                        action: function(node) {
                            this.close_all(node);
                            if (node.data('node').path == '/') {
                                this.open_node(node);
                            }
                        }
                    },
                    info: {
                        label: 'Информация',
                        action: function(node) {
                            $('#node-dialog').node_dialog('option', 'node', node).node_dialog('open');
                        }
                    },
                    log: {
                        label: 'Журнал',
                        action: function(node) {
                            $('#log-dialog').node_dialog('option', 'node', node).node_dialog('open');
                        }
                    },
                    edit: {
                        label: 'Изменить',
                        separator_before: true,
                        _disabled: !$(node).data('node').rw,
                        action: function(node) {
                            $('#edit-dialog').data('node', node).dialog('open');
                        }
                    },
                    rename: {
                        label: 'Переименовать',
                        _disabled: !$(node).data('node').rw,
                        action: function(node) {
                            $('#rename-dialog').data('node', node).dialog('open');
                        }
                    },
                    move: {
                        label: 'Переместить',
                        _disabled: !$(node).data('node').rw,
                        action: function(node) {
                            $('#move-dialog').data('node', node).dialog('open');
                        }
                    },
                    remove: {
                        label: 'Удалить',
                        _disabled: !(this.is_leaf(node) && $(node).data('node').rw),
                        action: function(node) {
                            $('#delete-dialog').data('node', node).dialog('open');
                        }
                    },
                    access: {
                        label: 'Доступ',
                        _disabled: !($(node).data('node').rw || can_edit_groups),
                        action: function(node) {
                            $('#access-dialog').node_dialog('option', 'node', node).node_dialog('open');
                        }
                    },
                    create: {
                        label: 'Создать',
                        separator_before: true,
                        _disabled: !$(node).data('node').rw || $(node).data('node').mime == 'application/x-symlink',
                        action: function(node) {
                            $('#create-dialog').data('parent', node).dialog('open');
                        }
                    }
                };
            }
        },
        search: {
            show_only_matches: true,
            search_method: 'jstree_node_contains',
            ajax: {
                url: '/search',
                data: function (term) {
                    return { term: term };
                },
                success: function (data) {
                    var paths = {};
                    $.each(data, function (id, node) {
                        var chunks = node.path.split(/\//);
                        chunks.pop();
                        while (chunks.length > 1) {
                            paths[chunks.join('/')] = null;
                            chunks.pop();
                        }
                    });
                    var result = $.map(paths, function (value, id) { return '#node-' + id.replace(/([\/:\.])/g,'\\$1') }).sort();
                    return result;
                }
            }
        },
        themes: { theme: 'default' }
    }).bind('select_node.jstree', function(e, data) {
        window.location.hash = data.rslt.obj.data('node').path;
        $('#node-dialog, #log-dialog, #access-dialog').node_dialog('option', 'node', data.rslt.obj);
    }).bind('loaded.jstree', onHashChange);
    $(window).bind('hashchange', onHashChange);

    $('#create-mime').change(function () {
        $('#create-data')
            .data('getter', mimeType[$(this).val()].edit($('#create-data'), $(this).val(), $('#create-data').data('getter')(true)))
            .data('mime', $(this).val());
    });
    $('#edit-mime').change(function () {
        $('#edit-data')
            .data('getter', mimeType[$(this).val()].edit($('#edit-data'), $(this).val(), $('#edit-data').data('getter')(true)))
            .data('mime', $(this).val());
    });

    $('#node-dialog').node_dialog({
        dialog: {
            width: 400,
            buttons: {
                Изменить: function() {
                    $('#edit-dialog').data('node', $(this).node_dialog('option', 'node')).dialog('open');
                },
                Переименовать: function() {
                    $('#rename-dialog').data('node', $(this).node_dialog('option', 'node')).dialog('open');
                }
            }
        },
        refresh: function (event, ui) {
            var node = $(this).node_dialog('option', 'node').data('node');
            $('#name').text(node.name);
            $('#summary').text(node.summary == null ? '' : node.summary);
            $('#description').text(node.description == null ? '' : node.description);
            $('#mtime').text(node.mtime);
            $('#version').text(node.version);
            ui.success();
            mimeType[node.mime].view($('#data'), node.mime, node.data);
        }
    });

    $('#create-dialog').dialog({
        modal: true,
        autoOpen: false,
        width: '30em',
        open: function() {
            var $parent = $(this).data('parent');
            $('#tree').jstree('open_node', $parent);
            var parent_path = $parent.data('node').path;
            var path = (parent_path == '/' ? '' : parent_path) + '/...';
            $(this)
                .dialog('option', 'title', 'Создать ' + path)
                .find('input, textarea, select').val('').end();
            $('#create-data').data('getter', function () { return null });
            $('#create-mime').val('application/x-null').change();
            $('#create-name-novalidate-div').hide();
            $('#create-name-novalidate').prop('checked', null);
            $('#create-name').addClass('validate[custom[nodeName]]');
        },
        close: function() {
            $('#create-form').validationEngine('hideAll');
            $('#create-data').validationEngine('hidePrompt');
        },
        buttons: {
            Создать: function() {
                if (!$('#create-form').validationEngine('validate')) {
                    if ($('#create-form').validationEngine('validateField', '#create-name')) {
                        $('#create-name-novalidate-div').show();
                    }
                    return;
                }
                var mime = $('#create-mime').val();
                var data = $('#create-data').data('getter')();
                if (!mimeType[mime].validate($('#create-data'), data)) return;
                var $parent = $(this).data('parent');
                var parent_path = $parent.data('node').path;
                var path = '/config' + (parent_path == '/' ? '' : parent_path) + '/' + $('#create-name').val();
                var params = {
                    summary: $('#create-summary').val(),
                    description: $('#create-description').val(),
                    mime: mime,
                    comment: $('#create-comment').val()
                };
                if (data != null) params.data = data;
                $.post(path, params, function(data) {
                    $('#tree')
                        .jstree('create_node', $parent, 'inside', {
                            data: nodeTitle(data),
                            attr: { id: 'node-' + data.path, rel: data.mime },
                            metadata: { node: data }
                        }, function (node) { this.select_node(node, true) });
                });
                $(this).dialog('close');
            },
            Отменить: function() {
                $(this).dialog('close');
            }
        }
    });
    $('#create-form').validationEngine();
    $('#create-name').change(function() {
        var $parent = $('#create-dialog').data('parent');
        var parent_path = $parent.data('node').path;
        $('#create-dialog').dialog('option', 'title', 'Создать ' + (parent_path == '/' ? '' : parent_path) + '/' + $(this).val());
    }); 
    $('#create-name-novalidate').click(function () {
        $('#create-name').toggleClass('validate[custom[nodeName]]', !$(this).is(':checked'));
    });

    $('#edit-dialog').dialog({
        modal: true,
        autoOpen: false,
        width: '30em',
        open: function() {
            var $node = $(this).data('node');
            var node = $node.data('node');
            $(this).dialog('option', 'title', 'Изменить ' + node.path);
            $('#edit-comment').val('');
            $('#edit-data').data('getter', function () { return node.data });
            $('#edit-mime').val(node.mime).change();
            $('#edit-mime option[value="application/x-symlink"]').toggle(node.num_children == 0);
        },
        close: function() {
            $('#edit-data').validationEngine('hidePrompt');
        },
        buttons: {
            Изменить: function() {
                var mime = $('#edit-mime').val();
                var data = $('#edit-data').data('getter')();
                if (!mimeType[mime].validate($('#edit-data'), data)) return;
                var $node = $(this).data('node');
                var path = '/config' + $node.data('node').path;
                var params = { mime: mime, comment: $('#edit-comment').val(), version: $node.data('node').version };
                if (data != null) params.data = data;
                $.post(path, params, function(data) {
                    delete data.result;
                    $('#tree').jstree('rename_node', $node, nodeTitle(data))
                        .jstree('set_type', data.mime, $node);
                    $node.data('node', data);
                    $('#node-dialog, #log-dialog').node_dialog('refresh');
                });
                $(this).dialog('close');
            },
            Отменить: function() {
                $(this).dialog('close');
            }
        }
    });

    $('#delete-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: '30em',
        open: function() {
            var path = $(this).data('node').data('node').path;
            $(this).dialog('option', 'title', 'Удалить ' + path + '?');
            $('#delete-path').text(path);
            $('#delete-comment').val('');
        },
        buttons: {
            Удалить: function() {
                var $node = $(this).data('node');
                var path = $node.data('node').path;
                $.ajax({
                    type: 'DELETE',
                    url: '/config' + path,
                    data: {
                        version: $node.data('node').version,
                        comment: $('#delete-comment').val(),
                    },
                    success: function() {
                        $('#tree').jstree('delete_node', $node);
                    }
                });
                $(this).dialog('close');
            },
            Отменить: function() {
                $(this).dialog('close');
            }
        }
    });

    $('#rename-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: '30em',
        open: function () {
            var node = $(this).data('node').data('node');
            $(this).dialog('option', 'title', 'Переименовать ' + node.path);
            $('#rename-summary').val(node.summary);
            $('#rename-description').val(node.description);
        },
        buttons: {
            Изменить: function () {
                var $node = $(this).data('node');
                var path = '/config' + $node.data('node').path;
                $.post(path, { summary: $('#rename-summary').val(), description: $('#rename-description').val() }, function(data) {
                    delete data.result;
                    $('#tree').jstree('rename_node', $node, nodeTitle(data))
                        .jstree('set_type', data.mime, $node);
                    $node.data('node', data);
                    $('#node-dialog, #log-dialog').node_dialog('refresh');
                });
                $(this).dialog('close');
            },
            Отменить: function () {
                $(this).dialog('close');
            }
        }
    });

    $('#move-dialog').dialog({
        autoOpen: false,
        modal: true,
        width: '30em',
        open: function () {
            var node = $(this).data('node').data('node');
            $(this).dialog('option', 'title', 'Переместить ' + node.path);
            $('#move-path').val('');
            $('#move-symlink').prop('checked', 'checked');
        },
        buttons: {
            Переместить: function () {
                var $node = $(this).data('node');
                var path = '/config' + $node.data('node').path;
                $.post(path, { path: $('#move-path').val(), symlink: $('#move-symlink').prop('checked') ? 1 : 0 }, function(data) {
                    delete data.result;
                    $('#tree').jstree('refresh', -1);
                    $node.data('node', data);
                    $('#node-dialog, #log-dialog').node_dialog('refresh');
                });
                $(this).dialog('close');
            },
            Отменить: function () {
                $(this).dialog('close');
            }
        }
    });
    $('#move-path').autocompletePath();

    $.each(mimeType, function (k, v) {
        $('<option/>').prop('value', k).text(v.title).appendTo('#create-mime');
        $('<option/>').prop('value', k).text(v.title).appendTo('#edit-mime');
    });

    $('span.value input:text, span.value textarea').addClass('input-width-fill')
        .wrap($('<div class="ui-widget-content ui-corner-all input-width-fill-wrapper"/>'));
    $('body')
        .delegate('.input-width-fill-wrapper', 'focusin', function() { $(this).addClass('input-focus') })
        .delegate('.input-width-fill-wrapper', 'focusout', function() { $(this).removeClass('input-focus') });
    $('#search-block')
        .focusin(function() { $(this).addClass('input-focus') })
        .focusout(function() { $(this).removeClass('input-focus') });
});
