import { Col, Container, Row, Spinner} from 'react-bootstrap';
import HomeAside from '../components/HomeAside';
import Timeline from '../components/Timeline';


const Home = () => {
    
    return(
        <Container fluid="xl">
            <Row>
                <Col md={3} className="d-none d-md-block">
                    <HomeAside/>
                </Col>
                <Col md={9}>
                    <Timeline type="home" showNewPost/>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;