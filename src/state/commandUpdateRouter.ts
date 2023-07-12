import { Observable } from "rxjs"
import { CommandUpdate } from "../dto"

export type CommandObservable = {
    raise: (update: CommandUpdate) => void,
    observable: Observable<CommandUpdate>
}

export const createCommandObservable = () => {

    const updateEffects: ((update: CommandUpdate) => void)[] = [];
    
    const observable = new Observable<CommandUpdate>(subscriber => {        
        updateEffects.push(update => {            
            subscriber.next(update);
            if (update.status === 'failed' || update.status === 'succeeded') {
                subscriber.complete();
            }
        })
        
    }); 
       
    const co: CommandObservable = {
        observable,
        raise: update => {            
            updateEffects.forEach(ue => ue(update))
        }
    }
    return co;
}

export function createRouter() {

    const observables : {[commandId: string]: CommandObservable} = {}
    
    const route = (update: CommandUpdate) => {
        if (update.commandId in observables) {
            observables[update.commandId].raise(update);
        }
    }

    const observe = (commandId: string, observable: CommandObservable) => {
        if (!(commandId in observables)) {
            observables[commandId] = observable;
        }
        return observables[commandId];
    }

    

    return { route, observe }
}