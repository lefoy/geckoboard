var fs = require("fs");
var twig = require("twig").twig;
var async = require('async');
var request = require("request");
var numeral = require('numeral');
var dashboard = require("../modules/dashboard.js");
var widgets = require("../modules/widgets.js");
var secret = require("../data/secret.json");

var twitch_url = "https://api.twitch.tv/kraken";
var twitch_api_url = "http://api.twitch.tv/api";

/**
 * Configuration
 * @type {Object}
 */
var config = {
    user: "qc_methical",
    twitch: {
        client_id: secret.twitch_client_id,
        scope: "user_read, channel_read_",
        response_type: "token"
    }
};

/**
 * Retrieve data from Twitch endpoints
 * @param  {String}   endpoint
 * @param  {Function} callback
 * @return {Callback}
 */
function retrieveResource(endpoint, callback) {
    if (endpoint == 'undefined' || !endpoint) return false;
    if (!callback || typeof callback != 'function') return false;

    var self = this;

    request.get({
        url: twitch_url + endpoint
    }, function(err, response, body) {
        body = JSON.parse(body);
        if (callback) callback.call(self, null, body);
    });
}

/**
 * Render Twig template
 * @param  {String} template Name of the template to render
 * @param  {Object} data     Data object passed to the template
 * @return {String}          Rendered template
 */
function renderTemplate(template, data) {
    var file = twig({
        data: fs.readFileSync("templates/twitch/" + template + ".twig", {
            "encoding": "UTF-8"
        })
    });
    return file.render(data);
}

/**
 * Twitch Client
 * @type {Object}
 */
var TwitchClient = {

    /**
     * Update Twitch Widgets
     * @return {null}
     */
    update: function() {
        this.getWidgets();
    },

    /**
     * Loop through each widgets
     * @return {null}
     */
    getWidgets: function() {
        var self = this;
        secret.widgets.twitch.forEach(function(widget) {
            self.updateWidget(widget.name, widget.push_url);
        });
    },

    /**
     * Handle each widget types
     * @type {Object}
     */
    updateWidget: function(widget, push_url) {
        switch (widget) {
            case "online":
                this.updateOnlineWidget(push_url);
                break;
        }
    },

    /**
     * Online Twitch streams widget
     * @param  {String} push_url
     * @return {null}
     */
    updateOnlineWidget: function(push_url) {
        var self = this;
        var twig_data = {
            streams: []
        };

        // Get user followers
        this.getFollowers(config.user, function(followers) {
            async.forEachOf(followers.reverse(), function(follower, index, callback) {
                // Get current follower stream informations
                self.getStreamInfo(follower.channel.name, function(channel) {
                    if (channel.stream !== null) {
                        // Stream is online, add data to widget
                        twig_data.streams.push({
                            name: follower.channel.display_name,
                            url: follower.channel.url,
                            logo: follower.channel.logo,
                            preview: channel.stream.preview,
                            viewers: numeral(channel.stream.viewers).format('0,0'),
                            followers: numeral(follower.channel.followers).format('0,0')
                        });
                    }
                    callback();
                });
            }, function() {
                var data = widgets.text(renderTemplate("online", twig_data), 0);
                dashboard.updateWidget(push_url, data);
            });
        });
    },

    /**
     * Returns a stream object if live.
     * @param  {String}   user
     * @param  {Function} callback
     * @return {Callback}
     */
    getStreamInfo: function(channel, callback) {
        if (channel == 'undefined' || !channel) return false;
        if (!callback || typeof callback != 'function') return false;

        retrieveResource("/streams/" + channel + "/", function(error, response) {
            callback(response);
        });
    },

    /**
     * Get a user's list of followed channels
     * @param  {String}   user
     * @param  {Function} callback
     * @return {Callback}
     */
    getFollowers: function(user, callback) {
        if (user == 'undefined' || !user) return false;
        if (!callback || typeof callback != 'function') return false;

        retrieveResource("/users/" + user + "/follows/channels", function(error, response) {
            callback(response.follows);
        });
    }

}

module.exports = TwitchClient;
