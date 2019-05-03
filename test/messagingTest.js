const chai = require('chai');
const expect = chai.expect;
const messages = require('../messaging');

describe('Messaging', function() {
    beforeEach(function () {
        MockDate.set('5/2/2019');
        this.message = [
            {items: 1, timestamp: '2019-05-2T04:55:04.255892'
        },
        ];
    });

    afterEach(function() {
        MockDate.reset();
    });
});