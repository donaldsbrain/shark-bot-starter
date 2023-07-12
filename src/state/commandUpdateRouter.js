"use strict";
exports.__esModule = true;
exports.createRouter = exports.createCommandObservable = void 0;
var rxjs_1 = require("rxjs");
var createCommandObservable = function () {
    var updateEffects = [];
    var observable = new rxjs_1.Observable(function (subscriber) {
        updateEffects.push(function (update) {
            subscriber.next(update);
            if (update.status === 'failed' || update.status === 'succeeded') {
                subscriber.complete();
            }
        });
    });
    var co = {
        observable: observable,
        raise: function (update) {
            updateEffects.forEach(function (ue) { return ue(update); });
        }
    };
    return co;
};
exports.createCommandObservable = createCommandObservable;
function createRouter() {
    var observables = {};
    var route = function (update) {
        if (update.commandId in observables) {
            observables[update.commandId].raise(update);
        }
    };
    var observe = function (commandId, observable) {
        if (!(commandId in observables)) {
            observables[commandId] = observable;
        }
        return observables[commandId];
    };
    return { route: route, observe: observe };
}
exports.createRouter = createRouter;
