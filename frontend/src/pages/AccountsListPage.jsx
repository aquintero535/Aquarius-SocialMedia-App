import { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useLocation, useParams } from "react-router";
import AccountCard from "../components/AccountCard";
import Navigation from "../components/Navigation";
import { ApiService } from "../services/ApiService";

const AccountsListPage = () => {
    let path = useLocation().pathname;
    const [username] = useState(useParams().username);
    const [mode] = useState(path.substring(path.lastIndexOf('/')+1) === 'following' ? 'following' : 'followers');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accounts, setAccounts] = useState(null);
    useEffect(() => {
        if (mode === 'following'){
            ApiService.getFollowing(username)
            .then((res) => {
                if (res.data) setAccounts(res.data);
            }).catch(err => setError(err))
            .finally(() => setLoading(false));
        } else if (mode === 'followers') {
            ApiService.getFollowers(username)
            .then((res) => {
                if (res.data) setAccounts(res.data);
            }).catch(err => setError(err))
            .finally(() => setLoading(false));
        }
    }, [username, mode]);

    return(
        <Container fluid="xl">
            <Row>
                <Col md={3} className="aside d-none d-md-block">
                    <Card>
                        <Navigation/>
                    </Card>
                </Col>
                <Col md={9} className="main accounts-list">
                    <Card className="p-3">
                        <a href={`/${username}`}>Regresar</a>
                        <h3>{username.startsWith('@') ? username : `@${username}`}</h3>
                        <h4>{mode === 'following' ? 'Siguiendo' : 'Seguidores'}</h4>
                        <hr />
                        {error && <Alert show variant="danger">{error}</Alert>}
                        {loading && 
                            <div className="text-center p-3">
                                <Spinner animation="border" variant="primary"/>
                            </div>
                        }
                        {accounts && accounts.map((el) => <AccountCard key={el.profile_id} account={el}/>)}
                        {accounts && accounts.length === 0 && <p>{(mode === 'followers') 
                            ? 'No hay seguidores.'
                            : 'Este usuario no sigue a ninguna cuenta.'}</p>}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AccountsListPage;