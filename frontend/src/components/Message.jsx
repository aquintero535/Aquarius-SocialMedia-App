import React from 'react';
import { Alert } from 'react-bootstrap';

const Message = ({msg, variant, show}) => {
    return(
        <Alert >
            {msg}
        </Alert>
    );
};

export default Message;