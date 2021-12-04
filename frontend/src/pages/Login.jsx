import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap';

import { Link } from 'react-router-dom';
import { login } from '../context/actions';
import { useAuthDispatch, useAuthState } from '../context/context';

const Login = (props) => {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const dispatch = useAuthDispatch();
    const {loading, errorMessage} = useAuthState();
    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (username && password) startLogin();
    };

    const startLogin = () => {
        login(dispatch, {username, password})
        .then((res) => {
            if (res.user) props.history.push('/home');
        }).catch(err => console.log(err))
    };

    return(
        <Container>
            <Row>
                <Col sm={10} md={8} lg={6} style={{margin:"auto"}}>
                    <Card style={{padding:"10px"}}>
                        {errorMessage && <Alert show variant="danger">{errorMessage}</Alert>}
                        <LoginForm handleSubmit={handleSubmit}
                            setUsername={setUsername} setPassword={setPassword}/>
                        <Link to="/signup">Crear una nueva cuenta</Link>
                        {loading && <div className="d-flex justify-content-center mt-2">
                            <Spinner className="" animation="border" variant="primary" /> 
                        </div>}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;