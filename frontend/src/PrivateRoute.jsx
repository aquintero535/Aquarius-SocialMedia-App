import React from 'react';
import { Redirect, Route } from 'react-router';
import { isAuthenticated } from './context/actions';
import { useAuthDispatch } from './context/context';

const PrivateRoute = ({component : Component, ...rest}) => {
    const dispatch = useAuthDispatch();
    return(
        <Route {...rest} render={props => isAuthenticated(dispatch)
            ? <Component {...props} {...rest}/> 
            : <Redirect to={{pathname: '/login', state:{from: props.location}}}/>} />
    );
};

export default PrivateRoute;