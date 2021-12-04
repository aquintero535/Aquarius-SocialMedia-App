import { Card, Container, Image } from 'react-bootstrap';
import { useAuthState } from '../context/context';

const API_URL = process.env.REACT_APP_API_URL;
/*
TODO: Al actualizar la imagen de perfil, los datos en el reducer (AuthState) permanecen iguales,
por lo que en el home se seguirá mostrando la imagen de perfil anterior. Buscar la manera
de que estos datos también se actualicen.
*/
const HomeProfile = () => {
    const { user } = useAuthState();
    return(
        <Container fluid>
            <Card>
                <div className="home-profile d-flex flex-column p-3">
                    <div className="text-center mb-2">
                        <Image src={`${API_URL}${user.profile_image}`} roundedCircle style={{width:"90px"}} />
                    </div>
                    <div className="text-center">
                        <h2>{user.profile_name}</h2>
                        <h3>@{user.username}</h3>
                        <p>Seguidores: {user.followers}</p>
                        <p>Siguiendo: {user.following}</p>
                    </div>
                </div>
            </Card>
        </Container>
    );
};

export default HomeProfile;