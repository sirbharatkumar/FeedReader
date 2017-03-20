var feed, entry, widget_html, widget_container, widget_reload;

function ajaxFeeds(feed_url, callback) {
    var surl = "http://api.cmdgen.com/feed";

    $.ajax({
        type: 'GET',
        url: surl,
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        data: { url: feed_url, count: 20 },
        dataType: "jsonp",
        success: function (data) {
            callback(data);
        },
        error: function (xhr, status, error) { alert('404 Error!!'); },
        async: false,
        global: false,
    });
}

function initialize() {
    var user_feed = $.cookies.get('user_feed');
    if (user_feed === null) {
        $("#widget-feeds li").each(function () {
            BindFeedWidget($(this).attr("data-feed-url"), $(this).attr("data-column"), $(this).attr("data-position"), false, $(this).attr("data-size"));
        });
        $(".site-loader").css({ opacity: 0.5 });
    }
    else {
        $.each(user_feed, function () {
            BindFeedWidget(this.feedUrl, this.columnNumber, this.position, this.collapsedState, this.size);
        });
        $(".site-loader").css({ opacity: 0.5 });
    }
    setTimeout(function () { OnFeedBindComplete(); }, 1000);
}

function OnFeedBindComplete() {
    var user_feed = $.cookies.get('user_feed');
    if (user_feed === null) {
        if ($('.widget-feed:visible').length === 10) {
            iNettuts.init();
            $(".site-loader").hide();
        } else {
            setTimeout(function () { OnFeedBindComplete(); }, 1000);
        }

    } else {
        if (user_feed.length === $('.widget-feed:visible').length) {
            iNettuts.init();
            $(".site-loader").hide();
        }
        else {
            setTimeout(function () { OnFeedBindComplete(); }, 1000);
        }
    }
}

function BindFeedWidget(feed_url, feed_column, feed_position, feed_collapsedState, feed_size) {
    ajaxFeeds(feed_url, function (result) {
        if (result != null && !result.error) {
            if (result.title.length > 55) {
                widget_html = '<div class="widget-head"><h3>' + result.title.substring(0, 55) + '...</h3></div>';
            }
            else {
                widget_html = '<div class="widget-head"><h3>' + result.title + '</h3></div>';
            }
            widget_html += '<div class="widget-content"><ul>';
            for (var i = 0; i < result.feedList.length; i++) {
                entry = result.feedList[i];
                widget_html += '<li><a href="' + entry.link + '" target="_blank">' + entry.title + '</a></li>';
            }
            widget_html += '</ul></div>';
            if (feed_column === "1") {
                widget_container = $("#column1").find(".widget-feed[data-position='" + feed_position + "']");
            } else if (feed_column === "2") {
                widget_container = $("#column2").find(".widget-feed[data-position='" + feed_position + "']");
            }

            if (feed_collapsedState) {
                widget_container.addClass("collapsed");
            }
            widget_container.attr("data-feed-url", feed_url);
            widget_container.attr("data-size", feed_size);
            widget_container.html(widget_html);
            widget_container.show();
        } else {
            FeedError();
        }
    });
}

function FeedError() {
    alert("Doesn't seems to be a right RSS feed. Please try with some other feed.");
}

function SaveUserFeeds() {
    if (widget_reload === false) {
        var feed_json = [];
        $("#column1 .widget-feed:visible").each(function (index) {
            feed_json.push({
                columnNumber: "1",
                position: parseInt(index + 1),
                collapsedState: $(this).attr('class').indexOf("collapsed") !== -1 ? true : false,
                feedUrl: $(this).attr("data-feed-url"),
                size: $(this).attr("data-size")
            });
        });
        $("#column2 .widget-feed:visible").each(function (index) {
            feed_json.push({
                columnNumber: "2",
                position: parseInt(index + 1),
                collapsedState: $(this).attr('class').indexOf("collapsed") !== -1 ? true : false,
                feedUrl: $(this).attr("data-feed-url"),
                size: $(this).attr("data-size")
            });
        });

        $.cookies.set('user_feed', feed_json, { expiresAt: new Date(2020, 1, 1) });
    }
}

function AddPageColumns() {
    AddPageColumn("1");
    AddPageColumn("2");
}

function AddPageColumn(columnNum) {
    var columnHtml = "";
    for (var i = 1; i <= 10; i++) {
        columnHtml += "<li class='widget color-green widget-feed' data-position='" + i + "' data-column='" + columnNum + "' data-size='' style='display: none' data-feed-url=''></li>";
    }

    var html = $("<ul id='column" + columnNum + "' class='column'></ul>").html(columnHtml);
    $("#columns").append(html);

}

$(function () {

    AddPageColumns();

    initialize();

    widget_reload = false;

    $(".widget-reset-content a").click(function (e) {
        e.preventDefault();
        $.cookies.del('user_feed');
        widget_reload = true;
        location.reload();
    });

    $(".feed_size").live("change", function () {
        var option = $(".feed_size").find("[value='" + $(this).val() + "']");
        option.attr('selected', 'selected');
    });

    $(".feed_submit").live("click", function (e) {
        e.preventDefault();
        var submitSelector = $(this).parents(iNettuts.settings.widgetSelector);
        var submitFeedUrl = $(this).parents(".item").children(":input").val();
        var submitFeedSize = $(this).parents(".item").children(".feed_size").val();
        submitSelector.children(iNettuts.settings.contentSelector).html("");
        ajaxFeeds(submitFeedUrl, function (result) {
            if (result != null && !result.error) {
                if (result.title.length > 55) {
                    submitSelector.children(iNettuts.settings.handleSelector).find("h3").html(result.title.substring(0, 55) + '...');
                }
                else {
                    submitSelector.children(iNettuts.settings.handleSelector).find("h3").html(result.title);
                }

                widget_html = '<ul>';
                for (var i = 0; i < result.feedList.length; i++) {
                    entry = result.feedList[i];
                    widget_html += '<li><a href="' + entry.link + '" target="_blank">' + entry.title + '</a></li>';
                }
                widget_html += '</ul>';
                submitSelector.children(iNettuts.settings.contentSelector).html(widget_html);
                submitSelector.attr("data-feed-url", submitFeedUrl);
                submitSelector.attr("data-size", submitFeedSize);
            }
            else {
                FeedError();
            }
        });
    });

    $(".widget-add-content a").click(function (e) {
        e.preventDefault();
        var column1FeedCount = $("#column1 .widget-feed:visible").length;
        var column2FeedCount = $("#column2 .widget-feed:visible").length;
        if (parseInt(column1FeedCount + column2FeedCount) === 10) {
            alert("Maximum 10 Feed Widgets are allowed. Please Edit/Delete to have new one.");
        }
        else {
            var feed_prompt_url = prompt("Feed URL : ", "Please enter your feed url here");
            if (feed_prompt_url != null && feed_prompt_url != "") {
                ajaxFeeds(feed_prompt_url, function (result) {
                    if (result != null && !result.error) {
                        if (result.title.length > 55) {
                            widget_html = '<div class="widget-head"><h3>' + result.title.substring(0, 55) + '...</h3></div>';
                        }
                        else {
                            widget_html = '<div class="widget-head"><h3>' + result.title + '</h3></div>';
                        }
                        widget_html += '<div class="widget-content"><ul>';
                        for (var i = 0; i < result.feedList.length; i++) {
                            entry = result.feedList[i];
                            widget_html += '<li><a href="' + entry.link + '" target="_blank">' + entry.title + '</a></li>';
                        }
                        widget_html += '</ul></div>';
                        if (column1FeedCount != 10) {
                            widget_container = $("#column1 .widget-feed:visible:last").next();
                        }
                        else {
                            widget_container = $("#column2 .widget-feed:visible:last").next();
                        }
                        widget_container.removeClass("collapsed");
                        widget_container.attr("data-feed-url", feed_prompt_url);
                        widget_container.attr("data-size", 10);
                        widget_container.html(widget_html);
                        widget_container.show();
                        iNettuts.init();
                        $('html,body').animate({
                            scrollTop: $(widget_container).offset().top
                        }, 'slow');

                    }
                    else {
                        FeedError();
                    }
                });
            }
            else {
                alert("No input provided.");
            }
        }
    });
});
