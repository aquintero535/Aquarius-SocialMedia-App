import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useParams, Redirect } from 'react-router';
import Post from '../components/Post';
import AccountListModal from '../components/AccountListModal';
import { ApiService } from '../services/ApiService';

const SinglePost = ({history}) => {
    const [postParam] = useState(useParams().postId);
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState(null);
    const [error, setError] = useState(null);
    const [loadingPost, setLoadingPost] = useState(true);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [showingLikesModal, setShowingLikesModal] = useState(false);
    const [showingRepostsModal, setShowingRepostsModal] = useState(false);
    useEffect(() => {
        ApiService.fetchPost(postParam)
        .then((res) => {
            if (res.data) setPost(res.data);
        }).catch(err => setError(err))
        .finally(() => setLoadingPost(false))
        
        ApiService.fetchPostReplies(postParam)
        .then((res) => {
            if (res.data) setReplies(res.data);
        }).catch(err => setError(err))
        .finally(() => setLoadingReplies(false));
    }, [postParam]);

    const appendReply = (reply) => setReplies([reply, ...replies]);
    const removePost = () => history.push('/home');
    const removeReply = (postId) => setReplies(replies.filter((reply) => reply.post_id !== postId));

    return(
        <Container>
            <AccountListModal show={showingLikesModal} onHide={() => setShowingLikesModal(false)} type="likes" post_id={postParam}/>
            <AccountListModal show={showingRepostsModal} onHide={() => setShowingRepostsModal(false)} type="reposts" post_id={postParam}/>
            <Row>
                <Col className="mt-5">
                    {error && <Alert show variant="danger">{error}</Alert>}
                    {loadingPost && 
                        <div className="text-center border">
                            <Spinner className="p-5" animation="border" variant="primary"/>
                        </div>
                    }
                    {post && <Post post={post} isSinglePost setShowingLikesModal={setShowingLikesModal} setShowingRepostsModal={setShowingRepostsModal}
                        appendReply={appendReply} removePost={removePost}/>}
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={8}>
                    <h5>Respuestas</h5>
                    <hr/>
                    {loadingReplies && 
                        <div className="text-center border">
                            <Spinner className="p-5" animation="border" variant="primary"/>
                        </div>}
                    {replies && replies.map(post => <Post key={post.post_id} post={post} removePost={removeReply} isReplyView/>)}
                </Col>
            </Row>
        </Container>
    );
};

export default SinglePost;