var secret = require("../data/secret.json");

var Widgets = {

    text: function(text, type) {
        if (text == 'undefined' || !text) return false;
        if (type == 'undefined' || !type) type = 0;

        var data = {
            "api_key": secret.geckoboard_api_key,
            "data": {
                "item": [{
                    "text": text,
                    "type": type
                }]
            }
        };

        return data;
    }

}

module.exports = Widgets;
