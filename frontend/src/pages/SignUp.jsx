import { useState } from 'react';
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import SignUpForm from "../components/SignUpForm";
import { login, signup } from '../context/actions';

const SignUp = (props) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    
    const handleSubmit = (ev, form) => {
        ev.preventDefault();
        setLoading(true);
        signup(form)
        .then((res) => {
            console.log(res);
            return login(form.username, form.password);
        }).then((result) => {
            console.log(result);
            props.history.push('/home');
        })
        .catch((err) => {
            console.error(err);
            setErrors(err);
        }).finally(() => setLoading(false));
    };

    return(
        <Container>
            <Row>
                <Col sm={10} md={8} lg={6} style={{margin:"auto"}}>
                    <Card style={{padding:"10px"}}>
                        <SignUpForm handleSubmit={handleSubmit}/>
                        {loading && <div className="d-flex justify-content-center mt-2">
                            <Spinner className="" animation="border" variant="primary" /> 
                        </div>}
                        {errors && errors.map((error) => <Alert className="mt-2" show variant="danger">{error.message}</Alert>)}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
};

export default SignUp;