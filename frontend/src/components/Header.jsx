import React from 'react';
import { Button, Form, FormControl, Navbar } from 'react-bootstrap';
import { useAuthState } from '../context/context';
import { ApiService } from '../services/ApiService';
import Navigation from './Navigation';

const Header = () => {
    const {user} = useAuthState();

    const doPing = () => {
        ApiService.doPing()
        .then((res) => console.log(res.data?.message))
        .catch((err) => console.error(err));
    };
    return(
        <Navbar collapseOnSelect bg="primary" variant="dark" expand="md" fixed="top">
            <Navbar.Brand href="/">Aquarius</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                {user && <div className="d-md-none"><Navigation/></div>}
                {user && 
                <Form inline>
                    <FormControl className="mr-sm-2" type="text" placeholder="Buscar usuarios y posts" />
                    <Button className="mt-xs-2" variant="outline-light">Buscar</Button>
                </Form>}
                <Button className="ml-md-2" variant="outline-light" onClick={doPing}>Ping</Button>
            </Navbar.Collapse>
        </Navbar>    
    );
};

export default Header;