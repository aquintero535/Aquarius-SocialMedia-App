import React from 'react';
import { Button, Form } from 'react-bootstrap';

const LoginForm = ({handleSubmit, setUsername, setPassword}) => {
    return(
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
                <Form.Label>Nombre de usuario o correo electrónico</Form.Label>
                <Form.Control type="username" onChange={(ev) => setUsername(ev.target.value)} placeholder="Escribe tu nombre de usuario" required/>
            </Form.Group>
            <Form.Group controlId="formPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control type="password" onChange={(ev) => setPassword(ev.target.value)} placeholder="Contraseña" required/>
            </Form.Group>
            <Button variant="primary" type="submit">
                Iniciar sesión
            </Button>
        </Form>
    );
};

export default LoginForm;