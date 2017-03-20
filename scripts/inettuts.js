/*
 * Script from NETTUTS.com [by James Padolsey]
 * @requires jQuery($), jQuery UI & sortable/draggable UI modules
 */

var iNettuts = {

    jQuery: $,

    settings: {
        columns: '.column',
        widgetSelector: '.widget',
        handleSelector: '.widget-head',
        contentSelector: '.widget-content',
        widgetDefault: {
            movable: true,
            removable: true,
            collapsible: true,
            refresh: true,
            editable: true,
            colorClasses: ['color-yellow', 'color-red', 'color-blue', 'color-white', 'color-orange', 'color-green']
        },
        widgetIndividual: {
            intro: {
                movable: false,
                removable: false,
                collapsible: false,
                editable: false
            },
            gallery: {
                colorClasses: ['color-yellow', 'color-red', 'color-white']
            }
        }
    },

    init: function () {
        this.attachStylesheet('css/inettuts.js.css');
        this.addWidgetControls();
        this.makeSortable();
    },

    getWidgetSettings: function (id) {
        var $ = this.jQuery,
            settings = this.settings;
        return (id && settings.widgetIndividual[id]) ? $.extend({}, settings.widgetDefault, settings.widgetIndividual[id]) : settings.widgetDefault;
    },

    addWidgetControls: function () {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;

        $(settings.widgetSelector, $(settings.columns)).each(function () {
            var thisWidgetSettings = iNettuts.getWidgetSettings(this.id);

            if (thisWidgetSettings.removable) {
                if ($(settings.handleSelector, this).find(".remove").length === 0) {
                    $('<a href="#" class="remove">CLOSE</a>').mousedown(function (e) {
                        e.stopPropagation();
                    }).click(function () {
                        if (confirm('Are you sure you want to remove this Widget?')) {
                            $(this).parents(settings.widgetSelector).hide("slow");
                        }
                        return false;
                    }).appendTo($(settings.handleSelector, this));
                }
            }

            if (thisWidgetSettings.refresh) {
                if ($(settings.handleSelector, this).find(".refresh").length === 0) {
                    $('<a href="#" class="refresh">REFRESH</a>').mousedown(function (e) {
                        e.stopPropagation();
                    }).click(function () {
                        var refreshContentSelector = $(this).parents(settings.widgetSelector).children(settings.contentSelector);
                        refreshContentSelector.html("");

                        ajaxFeeds($(this).parents(settings.widgetSelector).attr("data-feed-url"), function (result) {
                            if (result != null && !result.error) {
                                widget_html = '<ul>';
                                for (var i = 0; i < result.feedList.length; i++) {
                                    entry = result.feedList[i];
                                    widget_html += '<li><a href="' + entry.link + '" target="_blank">' + entry.title + '</a></li>';
                                }
                                widget_html += '</ul>';
                                refreshContentSelector.html(widget_html);
                            }
                            else {
                                FeedError();
                            }
                        });
                        return false;
                    }).prependTo($(settings.handleSelector, this));
                }
            }

            if (thisWidgetSettings.editable) {
                if ($(settings.handleSelector, this).find(".edit").length === 0) {
                    $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                        e.stopPropagation();
                    }).toggle(function () {
                        $(this).css({ backgroundPosition: '-66px 0', width: '55px' })
                            .parents(settings.widgetSelector)
                                .find('.edit-box').show().find('input').focus();
                        var option = $(this).parents(settings.widgetSelector).find('.edit-box').find(".feed_size").find("[value='" + $(this).parents(settings.widgetSelector).attr("data-size") + "']");
                        option.attr('selected', 'selected');
                        return false;
                    }, function () {
                        $(this).css({ backgroundPosition: '', width: '' })
                            .parents(settings.widgetSelector)
                                .find('.edit-box').hide();
                        return false;
                    }).appendTo($(settings.handleSelector, this));
                    $('<div class="edit-box" style="display:none;"/>')
                        .append('<ul><li class="item"><label>FeedUrl: </label><input  value="' + $(settings.handleSelector, this).parents(settings.widgetSelector).attr("data-feed-url") + '"/><div style="display:none"><label>FeedSize: </label><select class="feed_size" id="feed_size"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option><option value="50">50</option></select></div><a href="#" class="feed_submit">EDIT</a></li>')
                        .append('</ul>')
                        .insertAfter($(settings.handleSelector, this));
                }
            }

            if (thisWidgetSettings.collapsible) {
                if ($(settings.handleSelector, this).find(".collapse").length === 0) {
                    $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                        e.stopPropagation();
                    }).click(function () {
                        $(this).parents(settings.widgetSelector).toggleClass('collapsed');
                        return false;
                    }).prependTo($(settings.handleSelector, this));
                }
            }

        });
    },

    attachStylesheet: function (href) {
        var $ = this.jQuery;
        return $('<link href="' + href + '" rel="stylesheet" type="text/css" />').appendTo('head');
    },

    makeSortable: function () {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings,
            $sortableItems = (function () {
                var notSortable = '';
                $(settings.widgetSelector, $(settings.columns)).each(function (i) {
                    if (!iNettuts.getWidgetSettings(this.id).movable) {
                        if (!this.id) {
                            this.id = 'widget-no-id-' + i;
                        }
                        notSortable += '#' + this.id + ',';
                    }
                });
                return $('> li:not(' + notSortable + ')', settings.columns);
            })();

        $sortableItems.find(settings.handleSelector).css({
            cursor: 'move'
        }).mousedown(function (e) {
            $sortableItems.css({ width: '' });
            $(this).parent().css({
                width: $(this).parent().width() + 'px'
            });
        }).mouseup(function () {
            if (!$(this).parent().hasClass('dragging')) {
                $(this).parent().css({ width: '' });
            } else {
                $(settings.columns).sortable('disable');
            }
        });

        $(settings.columns).sortable({
            items: $sortableItems,
            connectWith: $(settings.columns),
            handle: settings.handleSelector,
            placeholder: 'widget-placeholder',
            forcePlaceholderSize: true,
            revert: 300,
            delay: 100,
            opacity: 0.8,
            containment: 'document',
            start: function (e, ui) {
                $(ui.helper).addClass('dragging');
            },
            stop: function (e, ui) {
                $(ui.item).css({ width: '' }).removeClass('dragging');
                $(settings.columns).sortable('enable');
            }
        });
    }

};

//iNettuts.init();