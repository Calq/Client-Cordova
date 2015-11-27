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
 
#import "CalqPlugin.h"
#import "CalqClient.h"
#import <Cordova/CDV.h>

@implementation CalqPlugin

- (void) init:(CDVInvokedUrlCommand*)command
{
	// calq.init = function(writeKey)
	// * @param {string}    writeKey		The write key to use when communicating with the API.
    NSString* writeKey = [command.arguments objectAtIndex:0];

    [CalqClient initSharedInstanceWithKey:writeKey];
	
	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) track:(CDVInvokedUrlCommand*)command
{
	// calq.action.track = function(action, params)
	// * @param {string}    action        The name of the action to track.
 	// * @param {object}    properties    Any optional properties to include along with this action. Can be null.
    NSString* action = [command.arguments objectAtIndex:0];
	NSString* json = [command.arguments objectAtIndex:1];

	[[CalqClient sharedInstance] track:action properties:[self jsonStringToDictionary:json]];

  	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)trackSale:(CDVInvokedUrlCommand*)command
{
	// calq.action.trackSale = function(action, params, currency, amount)
	// * @param {string}    action        The name of the action to track.
	// * @param {object}    properties    Any optional properties to include along with this action. Can be null.
	// * @param {string}    currency      The 3 letter currency code (can be fictional).
	// * @param {number}    amount        The amount of this sale (can be negative for refunds).
    NSString* action = [command.arguments objectAtIndex:0];
	NSString* json = [command.arguments objectAtIndex:1];
	NSString* currency = [command.arguments objectAtIndex:2];
	NSNumber* amount = [command.arguments objectAtIndex:3];
	
	NSDecimalNumber* value = [NSDecimalNumber decimalNumberWithDecimal:[amount decimalValue]];
	
	[[CalqClient sharedInstance] trackSale:action properties:[self jsonStringToDictionary:json] currencyCode:currency value:value];

  	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)setGlobalProperty:(CDVInvokedUrlCommand*)command
{
	// calq.action.setGlobalProperty = function(property, value)
	// * @param {string}    property      The name of the property to set.
 	// * @param {object}    value         The value of the new global property.
    NSString* property = [command.arguments objectAtIndex:0];
	NSString* value = [command.arguments objectAtIndex:1];
	
	[[CalqClient sharedInstance] setGlobalProperty:property value:value];
	
  	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)identify:(CDVInvokedUrlCommand*)command
{
    // calq.user.identify = function(actor)
	// * @param {string}    actor         The new unique actor Id. 	
	NSString* actor = [command.arguments objectAtIndex:0];
	
	[[CalqClient sharedInstance] identify:actor];
	
  	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)profile:(CDVInvokedUrlCommand*)command
{
	// calq.action.track = function(action, params)
	// * @param {object} 	properties		The custom properties to set for this user.
	NSString* json = [command.arguments objectAtIndex:0];

	[[CalqClient sharedInstance] profile:[self jsonStringToDictionary:json]];
	
	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)clear:(CDVInvokedUrlCommand*)command
{
    // calq.user.clear = function()
		
	[[CalqClient sharedInstance] clear];
	
  	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)flushQueue:(CDVInvokedUrlCommand*)command
{
	// calq.flushQueue = function()
	
	[[CalqClient sharedInstance] flushQueue];
	
	CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (NSDictionary*)jsonStringToDictionary:(NSString*)json
{
	if(json == nil || [json length] == 0 || [json isEqualToString:@"null"])
	{
		return nil;	// Nothing to add
	}
	
	NSData* jsonData = [json dataUsingEncoding:NSUTF8StringEncoding];
    NSError* error=nil;
    NSDictionary* dict = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&error];

	return dict;
}

@end