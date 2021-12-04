import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import HomeProfile from './HomeProfile';
import Navigation from './Navigation';

const HomeAside = () => {
    return(
        <Card>
            <Row>
                <Col className="mt-3">
                    <HomeProfile/>
                </Col>
            </Row>
            <Row>
                <Col className="mt-3 mb-3">
                    <Container>
                        <Card>
                            <Navigation/>
                        </Card>
                    </Container>
                </Col>
            </Row>
        </Card>
    );
};

export default HomeAside;