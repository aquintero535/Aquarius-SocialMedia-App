import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router';
import EditProfile from '../components/EditProfile';
import Navigation from '../components/Navigation';
import Post from '../components/Post';
import { useAuthState } from '../context/context';
import NewPost from '../components/NewPost';
import { ApiService } from '../services/ApiService';
import Timeline from '../components/Timeline';

const API_URL = process.env.REACT_APP_API_URL;

const profilePlaceholder = {
    profile_header: '/images/placeholder.jpg',
    profile_image: '/images/default-profile-image.jpg',
    profile_name: 'Loading...',
    profile_bio: 'loading...',
    username: 'loading...',
    followers: 0,
    following: 0,
    is_following: false
};

/* TODO: Do a refactor of the UI. */
const UserProfile = () => {
    const [user] = useState(useParams().username);
    const [profile, setProfile] = useState(profilePlaceholder);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState(null);
    const [showingEditProfile, setShowingEditProfile] = useState(false);
    const [following, setFollowing] = useState(false);
    const myUserId = useAuthState().user.user_id;

    useEffect(() => {
        ApiService.fetchUserProfile(user)
        .then((res) => {
            if (res.data) {
                setProfile(res.data)
                setFollowing(Boolean(res.data.is_following));
            }
        }).catch(err => setError(err))
        .finally(() => setLoadingProfile(false));
    }, [user]);

    const followUser = () => {
        ApiService.toggleFollowUser(user, profile.user_id, following)
        .then((res) => {
            if (res.data) setFollowing(res.data.following);
        }).catch(err => setError(err));
    };

    return(
        <Container fluid="xl">
            {!loadingProfile && <EditProfile show={showingEditProfile} onHide={() => setShowingEditProfile(false)} profile={profile} setProfile={setProfile} user={user}/>}
            <Row>
                <Col md={3} className="aside d-none d-md-block">
                    <Card>
                        <Navigation/>
                    </Card>
                </Col>
                <Col md={9} className="main">
                    <Card className="p-3 mb-3">
                        {error && <Alert show variant="danger">{error}</Alert>}
                        <div className="user-profile-header">
                            <Image fluid src={`${API_URL}${profile.profile_header}`}/>
                        </div>
                        <div className="user-profile-info">
                            <Card className="mt-3 p-2">
                                <div className="d-flex flex-row mt-2">
                                    <div className="user-profile-img">
                                        <Image src={`${API_URL}${profile.profile_image}`} roundedCircle style={{width:'70px'}}/>
                                    </div>
                                    <div className="user-profile-names d-flex flex-column ml-2">
                                        <h5>{profile.profile_name}</h5>
                                        <h6>@{profile.username}</h6>
                                    </div>
                                    <div className="user-profile-counters d-flex flex-wrap text-center ml-2">
                                        <div className="followers border-right">
                                            <a href={`/${user}/followers`}>Seguidores: </a>
                                            <h5>{profile.followers}</h5>
                                        </div>
                                        <div className="following ml-3 border-right">
                                            <a href={`/${user}/following`}>Siguiendo: </a>
                                            <h5>{profile.following}</h5>
                                        </div>
                                        <div className="user-profile-actions ml-3">
                                            <Button onClick={followUser}>{!following ? 'Seguir' : 'Siguiendo'}</Button>
                                            {
                                                (myUserId === profile.user_id)
                                                ? <Button className="ml-2" onClick={() => setShowingEditProfile(true)}>Editar perfil</Button>
                                                : ''
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="user-profile-bio mt-3">
                                    <p>{profile.profile_bio}</p>
                                </div>
                            </Card>
                        </div>
                    </Card>
                    <div className="user-profile-posts">
                        <Timeline type="user_profile" user={user} showNewPost={(myUserId === profile.user_id)}/>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;