/*
 *  Copyright 2015 Calq.io
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in
 *  compliance with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is
 *  distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *  implied. See the License for the specific language governing permissions and limitations under the
 *  License.
 *
 */

'use strict';

var exec = require('cordova/exec'),
    calq = {
        action: {},
        user: {},
        _hasInit: false,
    },
    // Helper to validate inputs before we pass to native
    validation = {
        checkInit: function () {
            if(!calq._hasInit) {
                throw new Error("Calq has not been initialised. Call calq.init(...)");
            }  
        },
        check: function (param, type, nullable) {
            return (nullable ? !param : true) && (typeof param === (type ? type : 'string'));
        },
        errors: {
            argument: function(paramName, value) {
                return 'invalid argument \'' + paramName + '\', with value \'' + value + '\'';
            }
        }
    };

// --- Init

/**
 * Attempts to create a Calq client from previously saved data (includes identity and
 * global properties). If no previous data is found then a new client will be created.
 * 
 * <p>This MUST be called before any other library methods.
 *
 * <p>In order to save battery API calls are queued and batched together. There may be
 * a delay between making a call here and it being sent to Calq's API server. You can
 * call flushQueue if you want to force all pending calls to be sent immediately.
 *
 * @param {string}    writeKey      The write key to use when communicating with the API.
 * @return a new CalqClient instance either populated with the previous session data
 *        or with a new anonymous user Id (a blank session).
 */
calq.init = function(writeKey, onSuccess, onFail) {
    if (!validation.check(writeKey)) {
        return onFail(validation.errors.argument('writeKey', writeKey));
    }
    var successWrapper = function(param) {
        if(onSuccess) {
            onSuccess.apply(this, param);
        }
        calq._hasInit = true;
    };
    exec(successWrapper, onFail, 'Calq', 'init', [writeKey]);
};

// --- Action

/**
 * Tracks the given action.
 *
 * <p>Calq performs analytics based on actions that you send it, and any custom data
 * associated with that action. This call is the core of the analytics platform.
 *
 * <p>All actions have an action name, and some optional data to send along with it.
 *
 * <p>This method will pass data to a background worker and continue ASAP. It will not
 * block whilst API calls to Calq servers are made.
 *
 * @param {string}    action        The name of the action to track.
 * @param {object}    properties    Any optional properties to include along with this action. Can be null.
 */
calq.action.track = function(action, params, onSuccess, onFail) {
    validation.checkInit();
    if (!validation.check(action)) {
        return onFail(validation.errors.argument('action', action));
    }
    exec(onSuccess, onFail, 'Calq', 'track', [action, JSON.stringify(params || {})]);
};

/**
 * Tracks the given action which has associated revenue.
 *
 * @param {string}    action        The name of the action to track.
 * @param {object}    properties    Any optional properties to include along with this action. Can be null.
 * @param {string}    currency      The 3 letter currency code (can be fictional).
 * @param {number}    amount        The amount of this sale (can be negative for refunds).
 */
calq.action.trackSale = function(action, params, currency, amount, onSuccess, onFail) {
    validation.checkInit();
    if (!validation.check(action)) {
        return onFail(validation.errors.argument('action', action));
    }
    if (!validation.check(currency) || currency.length != 3) {
        return onFail(validation.errors.argument('currency', currency));
    }
    if (!validation.check(amount, 'number')) {
        return onFail(validation.errors.argument('amount', amount));
    }
    exec(onSuccess, onFail, 'Calq', 'trackSale', [action, JSON.stringify(params || {}), currency, amount]);
};

/**
 * Sets a global property to be sent with all future actions when using
 * track(...) calls. Will be persisted to client for future. If a value
 * has been already set then it will be overwritten.
 *
 * @param {string}    property      The name of the property to set.
 * @param {object}    value         The value of the new global property.
 */
calq.action.setGlobalProperty = function(property, value, onSuccess, onFail) {
    validation.checkInit();
    if (!validation.check(property)) {
        return onFail(validation.errors.argument('property', property));
    }
    if (value == null) {
        return onFail(validation.errors.argument('value', value));
    }
    exec(onSuccess, onFail, 'Calq', 'setGlobalProperty', [property, value.toString()]);
};

// -- User

/**
 * Sets the ID of this client to something else. This should be called if you register or
 * sign-in a user and want to associate previously anonymous actions with this new identity.
 *
 * <p>This should only be called once for a given user. Calling identify(...) again with a
 * different Id for the same user will result in an exception being thrown.
 *
 * @param {string}    actor         The new unique actor Id.
 */
calq.user.identify = function(actor, onSuccess, onFail) {
    validation.checkInit();
    if (!validation.check(actor)) {
        return onFail(validation.errors.argument('actor', actor));
    }
    exec(onSuccess, onFail, 'Calq', 'identify', [actor]);
};

/**
 * Sets profile properties for the current user. These are not the same as global properties.
 * A user MUST be identified before calling profile else an exception will be thrown.
 *
 * @param {object}    properties    The custom properties to set for this user. If a property 
 *    with the same name already exists then it will be overwritten.
 */
calq.user.profile = function(properties, onSuccess, onFail) {
    validation.checkInit();
    if (!validation.check(properties, 'object')) {
        return onFail(validation.errors.argument('properties', properties));
    }
    exec(onSuccess, onFail, 'Calq', 'profile', [JSON.stringify(properties || {})]);
};

/**
 * Clears the current session and resets to being an anonymous user.
 * You should generally call this if a user logs out of your application.
 */
calq.user.clear = function(onSuccess, onFail) {
    validation.checkInit();
    exec(onSuccess, onFail, 'Calq', 'clear', []);
};

// -- Util

/**
 * Asks the CalqClient to flush any API calls which are currently queued. Normally this
 * is done in the background for you (calls are grouped together to save battery).
 */
calq.flushQueue = function(onSuccess, onFail) {
    validation.checkInit();
    exec(onSuccess, onFail, 'Calq', 'flush', []);
};

// --- Exports

module.exports = calq;