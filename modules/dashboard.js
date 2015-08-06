var request = require("request");
var secret = require("../data/secret.json");

var Dashboard = {

    /**
     * Update Geckoboard Widget
     * @param  {String} url     Geckoboard Widget Push URL
     * @param  {Object} data    Geckoboard Widget Data
     * @return {Object}         Response from Geckoboard widget
     */
    updateWidget: function(url, data) {
        if (url == 'undefined' || !url) return false;
        if (data == 'undefined' || !data) return false;

        request.post({
                url: url,
                json: true,
                form: JSON.stringify(data)
            },
            function(err, res, body) {
                return (err ? err : body);
            }
        );
    }

}

module.exports = Dashboard;
