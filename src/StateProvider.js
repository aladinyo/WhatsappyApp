import {createContext, useReducer, useContext} from "react";
import { actionTypes } from './reducer'

export const StateContext = createContext();

export const StateProvider = ({ reducer, initialState, children}) => (
    <StateContext.Provider value={[...useReducer(reducer, initialState), actionTypes]}>
        {children}
    </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);