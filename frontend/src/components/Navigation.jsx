import React from 'react';
import { Nav } from 'react-bootstrap';
import { useAuthState } from '../context/context';

const Navigation = () => {
    const {user} = useAuthState();
    
    /* return(
        <Nav variant="pills" defaultActiveKey="/home" className="flex-column">
            <Nav.Item>
                <Nav.Link href="/home">Inicio</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="link-1">Perfil</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="link-2">Opciones</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="link-3">Cerrar sesión</Nav.Link>
            </Nav.Item>
        </Nav>
    ); */
    
    return(
        <Nav defaultActiveKey="/home" className="flex-column">
            <Nav.Link href="/home">Inicio</Nav.Link>
            <Nav.Link eventKey="link-1" href={`/${user.username}`}>Perfil</Nav.Link>
            <Nav.Link eventKey="link-2">Opciones</Nav.Link>
            <Nav.Link href="/logout" eventKey="link-3">Cerrar sesión</Nav.Link>
        </Nav>
    );
};

export default Navigation;